// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*──────────────── OpenZeppelin ─────────────────────*/
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/*====================================================================
  SpinAndWinMonad — MON token based spin game without Chainlink VRF
  ====================================================================*/
contract SpinAndWinMonad is ReentrancyGuard, Pausable, Ownable {
    /*──── CONSTANTS ────*/
    uint256 public constant SPIN_PRICE = 0.05 ether; // 0.05 MON
    uint16  public constant MAX_FEE_BP      = 1_000; // 10 %
    uint16  public constant MAX_JP_SHARE_BP = 5_000; // 50 % cap
    uint256 public constant MAX_JACKPOT = 100 ether; // Jackpot cap - 100 MON

    /*──── CONFIGURABLE RATES ────*/
    uint16 public spinFeeBP   = 500;  // 5 % of spin price → ownerFees
    uint16 public claimFeeBP  = 200;  // 2 % of claim amount
    uint16 public jackpotShareBP = 2000; // 20 % of net → jackpotPool

    /*──── POOLS & FEES ────*/
    uint256 public prizePool;
    uint256 public jackpotPool;
    uint256 public ownerFees;

    /*──── USER DATA ────*/
    struct User { uint256 spins; uint256 claimable; uint256 claimed; }
    mapping(address => User) public users;

    /*──── PRIZE TABLE (private) ────*/
    struct Prize { uint256 amount; uint16 prob; } // prob / 1000
    Prize[] private prizes;

    /*──── RANDOMNESS ────*/
    uint256 private nonce;

    /*──── EVENTS ────*/
    event SpinResult(address indexed player, uint256 reward, uint256 jpReward, uint8 prizeIndex);
    event Claimed(address indexed player, uint256 net, uint256 fee);
    event FeesWithdrawn(uint256 amount);
    event PoolWithdrawn(uint256 amount);
    event JackpotWithdrawn(uint256 amount);
    event JackpotFunded(uint256 amount);
    event FeesUpdated(uint16 spinBP, uint16 claimBP);
    event JackpotShareUpdated(uint16 shareBP);
    event PoolsShifted(string direction, uint256 amount);

    /*──── CONSTRUCTOR ────*/
    constructor() Ownable(msg.sender) {
        // MON token prizes (higher values than ETH)
        prizes.push(Prize(10 ether, 1));    // 10 MON - 0.1%
        prizes.push(Prize(5 ether, 2));     // 5 MON - 0.2%
        prizes.push(Prize(2 ether, 5));     // 2 MON - 0.5%
        prizes.push(Prize(1 ether, 10));    // 1 MON - 1%
        prizes.push(Prize(0.5 ether, 50));  // 0.5 MON - 5%
        prizes.push(Prize(0.2 ether, 200)); // 0.2 MON - 20%
        prizes.push(Prize(0, 732));         // %73.2 şansla hiçbir şey kazanamaz (Try Again/Empty)
    }

    /*──── ADMIN SETTINGS ────*/
    function setFees(uint16 newSpinBP, uint16 newClaimBP) external onlyOwner {
        require(newSpinBP <= MAX_FEE_BP && newClaimBP <= MAX_FEE_BP, "fee too high");
        spinFeeBP  = newSpinBP;
        claimFeeBP = newClaimBP;
        emit FeesUpdated(newSpinBP, newClaimBP);
    }
    
    function setJackpotShare(uint16 newShareBP) external onlyOwner {
        require(newShareBP <= MAX_JP_SHARE_BP, "share too high");
        jackpotShareBP = newShareBP;
        emit JackpotShareUpdated(newShareBP);
    }
    
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /*──── SPIN ────*/
    function spin() external payable whenNotPaused nonReentrant {
        require(msg.value >= SPIN_PRICE, "min price 0.05 MON");
        require(msg.value <= SPIN_PRICE + 1e12, "too much value sent"); // 0.000001 MON tolerans

        uint256 fee = (SPIN_PRICE * spinFeeBP) / 10_000;
        ownerFees  += fee;
        uint256 net = SPIN_PRICE - fee;

        uint256 jpShare = (net * jackpotShareBP) / 10_000;
        jackpotPool += jpShare;
        prizePool   += net - jpShare;

        // Fazla gönderilen miktarı iade et
        if (msg.value > SPIN_PRICE) {
            (bool ok, ) = msg.sender.call{value: msg.value - SPIN_PRICE}("");
            require(ok, "refund failed");
        }

        // Jackpot cap kontrolü
        if (jackpotPool > MAX_JACKPOT) {
            uint256 excess = jackpotPool - MAX_JACKPOT;
            jackpotPool = MAX_JACKPOT;
            prizePool += excess;
        }

        // Generate pseudo-random number
        uint256 randomNumber = _generateRandomNumber();
        
        // Process spin result
        _processSpinResult(msg.sender, randomNumber);
        
        users[msg.sender].spins += 1;
    }

    /*──── RANDOM NUMBER GENERATION ────*/
    function _generateRandomNumber() private returns (uint256) {
        nonce++;
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            nonce
        )));
    }

    /*──── PROCESS SPIN RESULT ────*/
    function _processSpinResult(address player, uint256 randomNumber) private {
        // Main reward
        uint256 r = randomNumber % 1000;
        uint256 acc; 
        uint256 reward;
        uint8 prizeIndex = 255;
        
        for (uint256 i; i < prizes.length; ++i) {
            acc += prizes[i].prob;
            if (r < acc) { 
                reward = prizes[i].amount; 
                prizeIndex = uint8(i); 
                break; 
            }
        }
        
        if (reward > 0 && prizePool >= reward) {
            prizePool -= reward;
            users[player].claimable += reward;
        }

        // Jackpot reward - improved chances
        uint256 jr = (randomNumber >> 10) % 1000;
        uint256 jpReward;
        if (jr < 10)      jpReward = (jackpotPool * 30) / 100; // 1‰ → 30%
        else if (jr < 30) jpReward = (jackpotPool * 15) / 100; // 2‰ → 15%
        else if (jr < 80) jpReward = (jackpotPool * 5)  / 100; // 5‰ → 5%

        if (jpReward > 0) {
            jackpotPool -= jpReward;
            users[player].claimable += jpReward;
        }
        
        emit SpinResult(player, reward, jpReward, prizeIndex);
    }

    /*──── CLAIM ────*/
    function claim() external nonReentrant {
        uint256 amt = users[msg.sender].claimable;
        require(amt > 0, "nothing to claim");
        uint256 fee = (amt * claimFeeBP) / 10_000;
        uint256 net = amt - fee;
        ownerFees  += fee;
        users[msg.sender].claimable = 0;
        users[msg.sender].claimed  += net;
        _safeSend(payable(msg.sender), net);
        emit Claimed(msg.sender, net, fee);
    }

    /*──── OWNER WITHDRAW ────*/
    function withdrawFees(uint256 amt) external onlyOwner nonReentrant {
        require(amt <= ownerFees, "exceeds fees");
        ownerFees -= amt; 
        _safeSend(payable(owner()), amt);
        emit FeesWithdrawn(amt);
    }
    
    function withdrawAllFees() external onlyOwner nonReentrant {
        uint256 amt = ownerFees; 
        ownerFees = 0;
        _safeSend(payable(owner()), amt); 
        emit FeesWithdrawn(amt);
    }

    function withdrawPool(uint256 amt) external onlyOwner nonReentrant {
        require(amt <= prizePool, "exceeds pool");
        prizePool -= amt; 
        _safeSend(payable(owner()), amt);
        emit PoolWithdrawn(amt);
    }
    
    function withdrawAllPool() external onlyOwner nonReentrant {
        uint256 amt = prizePool; 
        prizePool = 0;
        _safeSend(payable(owner()), amt); 
        emit PoolWithdrawn(amt);
    }

    function withdrawJackpot(uint256 amt) external onlyOwner nonReentrant {
        require(amt <= jackpotPool, "exceeds jackpot");
        jackpotPool -= amt; 
        _safeSend(payable(owner()), amt);
        emit JackpotWithdrawn(amt);
    }
    
    function withdrawAllJackpot() external onlyOwner nonReentrant {
        uint256 amt = jackpotPool; 
        jackpotPool = 0;
        _safeSend(payable(owner()), amt); 
        emit JackpotWithdrawn(amt);
    }

    // Owner jackpot havuzunu normal havuza aktarabilir
    function shiftJackpotToPool(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= jackpotPool, "exceeds jackpot");
        jackpotPool -= amount;
        prizePool += amount;
        emit PoolsShifted("jackpot_to_pool", amount);
    }

    // Owner normal havuzu jackpot'a aktarabilir
    function shiftPoolToJackpot(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= prizePool, "exceeds pool");
        require(jackpotPool + amount <= MAX_JACKPOT, "would exceed jackpot cap");
        prizePool -= amount;
        jackpotPool += amount;
        emit PoolsShifted("pool_to_jackpot", amount);
    }

    // Owner jackpot cap'ini geçici olarak artırabilir (sadece transfer için)
    function emergencyJackpotWithdraw(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= jackpotPool, "exceeds jackpot");
        jackpotPool -= amount;
        _safeSend(payable(owner()), amount);
        emit JackpotWithdrawn(amount);
    }

    /*──── INTERNAL SAFE SEND ────*/
    function _safeSend(address payable to, uint256 value) private {
        (bool ok, ) = to.call{ value: value }("");
        require(ok, "MON transfer failed");
    }

    /*──── Optional external funding ────*/
    receive() external payable { prizePool += msg.value; }
} 