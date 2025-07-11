import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useFarcaster } from './hooks/useFarcaster';
import { useSpinEvents } from './hooks/useSpinEvents';
import { useFarcasterWallet } from './hooks/useFarcasterWallet';
import SpinWheel from './components/SpinWheel';
import GameButtons from './components/GameButtons';
import ShareButton from './components/ShareButton';
import SharePage from './components/SharePage';
import GameInfo from './components/GameInfo';

function MainApp() {
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
    refreshUserData, // Add this if available in useFarcaster hook
  } = useFarcaster(); // Initialize first to get address
  
  // Create refresh function
  const refreshData = () => {
    if (refreshUserData) {
      refreshUserData();
    } else {
      // If refreshUserData is not available, we'll need to implement it
      console.log('🔄 Refreshing user data...');
      // Force a re-render by updating some state
      // This is a fallback if the hook doesn't provide refreshUserData
    }
  };
  
  // Initialize spin events hook with user address and refresh callback
  const { spinState, startSpin, setSpinState, checkRecentEvents } = useSpinEvents(address, refreshData);
  
  // Periodic refresh of user data (every 30 seconds)
  useEffect(() => {
    if (!isConnected || !address) return;
    
    const interval = setInterval(() => {
      refreshData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isConnected, address]);
  
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
        {/* Başlık ve Slogan */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1 drop-shadow-lg text-center">Spinning Money</h1>
        <div className="text-base text-blue-200/90 font-medium mb-3 text-center tracking-wide" style={{letterSpacing: '0.02em'}}>Spin. Win. Claim. Provably fair crypto gaming.</div>
        {/* Cüzdan Badge */}
        {address && (
          <div className="mt-2 bg-green-600/90 text-white text-xs font-mono px-4 py-1 rounded-full shadow-md text-center">
            {address.slice(0, 6)}...{address.slice(-4)}
            {isFarcasterEnvironment && (
              <span className="ml-1 text-yellow-300">Farcaster</span>
            )}
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
        <SpinWheel spinState={spinState} totalPool={parseFloat(prizePool).toFixed(4)} jackpot={parseFloat(jackpotPool).toFixed(4)} />
      </div>

      {/* Chainlink VRF etiketi */}
      <div className="w-full flex justify-center mb-6">
        <a
          href="https://vrf.chain.link/base#/side-drawer/subscription/base/17952329676849432097364691293412979287742510665681724364050779803330792847198"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1 rounded-full bg-[#232946] text-blue-300 font-medium shadow border border-blue-400/30 flex items-center gap-1"
        >
          <span role="img" aria-label="link">🔗</span> Provably fair by Chainlink VRF
        </a>
      </div>

      {/* Spin ve Claim Butonları */}
      <div className="w-full flex flex-col items-center gap-3 px-4 mb-6">
        <GameButtons
          isConnected={isConnected}
          isLoading={isLoading}
          canSpin={!isPaused && !isLoading && !spinState.isSpinning}
          canClaim={!!userData && parseFloat(userData.claimable) > 0 && !isLoading}
          claimableAmount={userData ? userData.claimable : '0'}
          claimedAmount={userData ? userData.claimed : '0'}
          onConnect={connectFarcaster}
          onSpin={enhancedSpin}
          onClaim={claim}
        />
      </div>

      {/* Share Button */}
      <div className="w-full flex justify-center px-4">
        <ShareButton 
          variant="outline" 
          size="lg" 
          className="w-full max-w-sm"
        />
      </div>

      {/* Game Information Panel */}
      <GameInfo 
        totalPool={parseFloat(prizePool).toFixed(4)} 
        jackpot={parseFloat(jackpotPool).toFixed(4)} 
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/share" element={<SharePage />} />
      </Routes>
    </Router>
  );
}

export default App; 
