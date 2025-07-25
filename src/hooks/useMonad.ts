import { useAccount, useReadContract, useWriteContract, useChainId } from 'wagmi';
import { SpinAndWinMonadABI, MONAD_CONTRACT_ADDRESS } from '../contracts/SpinAndWinMonad';
import { useState, useEffect } from 'react';
import { formatEther } from 'viem';

// Network connectivity test function
const testMonadRPC = async () => {
  const rpcUrls = [
    'https://rpc.testnet.monad.xyz',
    'https://testnet-rpc.monad.xyz',
    'https://monad-testnet-rpc.publicnode.com'
  ];

  for (const url of rpcUrls) {
    try {
      console.log(`🔍 Testing RPC endpoint: ${url}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ RPC endpoint ${url} is working. Latest block:`, data.result);
        return url;
      } else {
        console.log(`❌ RPC endpoint ${url} returned status:`, response.status);
      }
    } catch (error) {
      console.log(`❌ RPC endpoint ${url} failed:`, error);
    }
  }
  
  console.log('❌ All Monad RPC endpoints failed');
  return null;
};

export const useMonad = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(false);

  // Test RPC connectivity on mount
  useEffect(() => {
    testMonadRPC();
  }, []);

  console.log('🔍 useMonad hook initialized');
  console.log('🔍 Address:', address);
  console.log('🔍 IsConnected:', isConnected);
  console.log('🔍 Chain ID:', chainId);
  console.log('🔍 Expected Chain ID: 10143 (Monad Testnet)');
  console.log('🔍 Contract Address:', MONAD_CONTRACT_ADDRESS);

  // Read contract data
  const { data: prizePool, error: prizePoolError } = useReadContract({
    address: MONAD_CONTRACT_ADDRESS,
    abi: SpinAndWinMonadABI,
    functionName: 'prizePool',
  });
  const { data: jackpotPool, error: jackpotPoolError } = useReadContract({
    address: MONAD_CONTRACT_ADDRESS,
    abi: SpinAndWinMonadABI,
    functionName: 'jackpotPool',
  });
  const { data: spinPrice, error: spinPriceError } = useReadContract({
    address: MONAD_CONTRACT_ADDRESS,
    abi: SpinAndWinMonadABI,
    functionName: 'SPIN_PRICE',
  });
  const { data: isPaused, error: isPausedError } = useReadContract({
    address: MONAD_CONTRACT_ADDRESS,
    abi: SpinAndWinMonadABI,
    functionName: 'paused',
  });
  const { data: userData, error: userDataError } = useReadContract({
    address: MONAD_CONTRACT_ADDRESS,
    abi: SpinAndWinMonadABI,
    functionName: 'users',
    args: [address!],
  });

  // Debug contract calls
  console.log('🔍 Contract Data:');
  console.log('🔍 Prize Pool:', prizePool, 'Error:', prizePoolError);
  console.log('🔍 Jackpot Pool:', jackpotPool, 'Error:', jackpotPoolError);
  console.log('🔍 Spin Price:', spinPrice, 'Error:', spinPriceError);
  console.log('🔍 Is Paused:', isPaused, 'Error:', isPausedError);
  console.log('🔍 User Data:', userData, 'Error:', userDataError);

  // Write contract
  const { writeContractAsync } = useWriteContract();

  const spin = async () => {
    if (!address) return;
    setIsLoading(true);
    
    try {
      // Sabit spin price: 0.05 MON = 0.05 * 10^18 wei
      const fixedSpinPrice = BigInt("50000000000000000"); // 0.05 MON in wei
      
      console.log('🎯 Monad spin attempt - spinPrice:', fixedSpinPrice);
      console.log('🎯 Contract address:', MONAD_CONTRACT_ADDRESS);
      console.log('🎯 Prize Pool:', prizePool && typeof prizePool === 'bigint' ? formatEther(prizePool) : '0', 'MON');
      console.log('🎯 Jackpot Pool:', jackpotPool && typeof jackpotPool === 'bigint' ? formatEther(jackpotPool) : '0', 'MON');
      
      const result = await writeContractAsync({
        address: MONAD_CONTRACT_ADDRESS,
        abi: SpinAndWinMonadABI,
        functionName: 'spin',
        value: fixedSpinPrice,
        account: address, // Explicitly set the account
        gas: BigInt(200000), // Set explicit gas limit
      });
      
      // Calculate immediate result based on transaction hash (pseudo-random)
      if (result) {
        console.log('✅ Monad spin transaction sent:', result);
        console.log('⏳ Transaction hash:', result);
        
        // Don't send immediate result - let the wheel spin for 5-6 seconds
        console.log('✅ Transaction sent, wheel will spin until WebSocket event comes...');
        
        // Only poll for verification (no immediate event)
        const pollForReceipt = async (hash: string, maxAttempts = 30) => {
          for (let i = 0; i < maxAttempts; i++) {
            try {
              const response = await fetch('https://monad-testnet.g.alchemy.com/v2/EXk1VtDVCaeNBRAWsi7WA', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'eth_getTransactionReceipt',
                  params: [hash],
                  id: 1
                })
              });
              
              const data = await response.json();
              if (data.result && data.result.status === '0x1') {
                console.log('🎯 Transaction mined! Getting result immediately...');
                
                // Find SpinResult event in logs
                const spinResultLog = data.result.logs?.find((log: any) => 
                  log.address.toLowerCase() === MONAD_CONTRACT_ADDRESS.toLowerCase() &&
                  log.topics[0] === '0x923a28d8c9438f25c933f709149b09e8d419b32b13fe24f5e61ee52c0d1b437a'
                );
                
                if (spinResultLog) {
                  // Decode event immediately
                  const player = '0x' + spinResultLog.topics[1].slice(26);
                  const dataBytes = spinResultLog.data.slice(2);
                  const reward = BigInt('0x' + dataBytes.slice(0, 64));
                  const jpReward = BigInt('0x' + dataBytes.slice(64, 128));
                  const prizeIndex = parseInt(dataBytes.slice(128, 192), 16);
                  
                  const eventData = {
                    player,
                    reward: formatEther(reward),
                    jpReward: formatEther(jpReward),
                    prizeIndex,
                    timestamp: Date.now(),
                    transactionHash: hash
                  };
                  
                  console.log('🔍 Receipt verification found:', eventData);
                  // Note: Not triggering immediate event, letting WebSocket handle it
                }
                return;
              }
            } catch (error) {
              console.log(`⏳ Polling attempt ${i + 1}/${maxAttempts}...`);
            }
            
            // Wait 1 second before next poll
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          console.log('⚠️ Transaction receipt polling timeout');
        };
        
        // Start polling immediately
        pollForReceipt(result);
        console.log('🔍 Check the transaction on Monad explorer to see the result');
      }
    } catch (error) {
      console.error('❌ Monad spin transaction failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const claim = async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const result = await writeContractAsync({
        address: MONAD_CONTRACT_ADDRESS,
        abi: SpinAndWinMonadABI,
        functionName: 'claim',
        account: address, // Explicitly set the account
        gas: BigInt(300000), // Set explicit gas limit
      });
      
      // Wait for transaction to be mined
      if (result) {
        console.log('✅ Monad claim transaction sent:', result);
      }
    } catch (error) {
      console.error('❌ Monad claim transaction failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Format userData for easier use
  const formattedUserData = userData && Array.isArray(userData) ? {
    spins: Number(userData[0]),
    claimable: userData[1] ? formatEther(userData[1] as bigint) : '0',
    claimed: userData[2] ? formatEther(userData[2] as bigint) : '0'
  } : null;

  return {
    address,
    isConnected,
    isLoading,
    prizePool: prizePool && typeof prizePool === 'bigint' ? formatEther(prizePool) : '0',
    jackpotPool: jackpotPool && typeof jackpotPool === 'bigint' ? formatEther(jackpotPool) : '0',
    spinPrice: '0.05', // Sabit spin price
    isPaused: isPaused || false,
    userData: formattedUserData,
    spin,
    claim,
  };
}; 