import { useEffect, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';

export const useFarcasterWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [isFarcasterEnvironment, setIsFarcasterEnvironment] = useState(false);

  useEffect(() => {
    // Check if we're in Farcaster environment
    const checkFarcasterEnvironment = () => {
      const isFarcaster = typeof window !== 'undefined' && 
        (window.location.hostname.includes('farcaster') || 
         window.location.hostname.includes('warpcast') ||
         window.navigator.userAgent.includes('Farcaster'));
      
      setIsFarcasterEnvironment(isFarcaster);
      console.log('🔍 Farcaster environment:', isFarcaster);
      
      return isFarcaster;
    };

    checkFarcasterEnvironment();
  }, []);

  // Auto-connect in Farcaster environment
  useEffect(() => {
    if (isFarcasterEnvironment && !isConnected) {
      const farcasterConnector = connectors.find(connector => 
        connector.name.toLowerCase().includes('farcaster')
      );
      
      if (farcasterConnector) {
        console.log('🔗 Auto-connecting to Farcaster wallet...');
        connect({ connector: farcasterConnector });
      }
    }
  }, [isFarcasterEnvironment, isConnected, connectors, connect]);

  const connectFarcaster = () => {
    const farcasterConnector = connectors.find(connector => 
      connector.name.toLowerCase().includes('farcaster')
    );
    
    if (farcasterConnector) {
      connect({ connector: farcasterConnector });
    } else {
      console.warn('⚠️ Farcaster connector not found');
    }
  };

  return {
    address,
    isConnected,
    isFarcasterEnvironment,
    connectFarcaster,
    connectors
  };
}; 