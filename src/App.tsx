import React from 'react';
import { useFarcaster } from './hooks/useFarcaster';
import { useSpinEvents } from './hooks/useSpinEvents';
import { useFarcasterWallet } from './hooks/useFarcasterWallet';
import SpinWheel from './components/SpinWheel';
import GameButtons from './components/GameButtons';

function App() {
  // Initialize Farcaster wallet detection
  const { 
    address, 
    isConnected, 
    isFarcasterEnvironment, 
    connectFarcaster 
  } = useFarcasterWallet();
  
  const {
    isLoading,
    prizePool,
    jackpotPool,
    spinPrice,
    isPaused,
    userData,
    spin,
    claim,
  } = useFarcaster(); // Initialize first to get address
  
  // Initialize spin events hook with user address
  const { spinState, startSpin, setSpinState, checkRecentEvents } = useSpinEvents(address);
  
  // Create enhanced spin function
  const enhancedSpin = async () => {
    // Reset any previous result immediately
    setSpinState({
      isSpinning: false,
      targetAngle: 0,
      prizeIndex: undefined,
      resultReceived: false
    });
    
    // Start animation immediately when button is clicked
    startSpin();
    
    try {
      await spin(); // Execute blockchain transaction
      console.log('✅ Spin transaction sent successfully');
    } catch (error) {
      console.error('❌ Spin transaction failed:', error);
      // Stop spinning if transaction fails
      setSpinState(prev => ({
        ...prev,
        isSpinning: false,
        resultReceived: false
      }));
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#181A20] to-[#232946] flex flex-col items-center justify-start pb-8 pt-safe-top">
      {/* Üst Bilgi */}
      <div className="w-full flex flex-col items-center pt-6 pb-2 px-4 relative">
        <div className="text-3xl font-extrabold text-yellow-400 drop-shadow-sm mb-1">
          {parseFloat(prizePool).toFixed(4)} ETH
        </div>
        <div className="flex items-center gap-2 text-yellow-300 text-base font-semibold mb-2">
          <span role="img" aria-label="jackpot">🏆</span>
          Jackpot: {parseFloat(jackpotPool).toFixed(4)} ETH
        </div>
        {/* Cüzdan Badge */}
        {address && (
          <div className="absolute right-4 top-6 bg-green-600/90 text-white text-xs font-mono px-3 py-1 rounded-full shadow-md">
            {address.slice(0, 6)}...{address.slice(-4)}
            {isFarcasterEnvironment && (
              <span className="ml-1 text-yellow-300">🎯</span>
            )}
          </div>
        )}
        
        {/* Farcaster Environment Indicator */}
        {isFarcasterEnvironment && (
          <div className="absolute left-4 top-6 bg-purple-600/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            🎯 Farcaster
          </div>
        )}
      </div>

      {/* Başlık */}
      <div className="w-full flex flex-col items-center mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Spinning Money</h1>
        <div className="text-sm text-white/70 mb-2">✨ Spin. Win. Claim. ✨</div>
      </div>

      {/* Çark */}
      <div className="w-full flex justify-center items-center mb-6">
        <SpinWheel spinState={spinState} />
      </div>

      {/* Chainlink VRF etiketi */}
      <div className="w-full flex justify-center mb-6">
        <a
          href="https://chain.link/vrf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1 rounded-full bg-[#232946] text-blue-300 font-medium shadow border border-blue-400/30 flex items-center gap-1"
        >
          <span role="img" aria-label="link">🔗</span> Provably fair by Chainlink VRF
        </a>
      </div>

      {/* Spin ve Claim Butonları */}
      <div className="w-full flex flex-col items-center gap-3 px-4">
        <GameButtons
          isConnected={isConnected}
          isLoading={isLoading}
          canSpin={!isPaused && !isLoading && !spinState.isSpinning}
          canClaim={userData && parseFloat(userData.claimable) > 0}
          claimableAmount={userData ? userData.claimable : '0'}
          onConnect={connectFarcaster}
          onSpin={enhancedSpin}
          onClaim={claim}
        />
      </div>
    </div>
  );
}

export default App; 