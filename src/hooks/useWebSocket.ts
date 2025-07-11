import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { SPIN_AND_WIN_ABI, CONTRACT_ADDRESS } from '../contracts/SpinAndWinV3';

export interface SpinResult {
  player: string;
  requestId: string;
  reward: string;
  jpReward: string;
  prizeIndex: number;
  timestamp: number;
}

export interface ClaimResult {
  player: string;
  net: string;
  fee: string;
  timestamp: number;
}

export const useWebSocket = (userAddress?: string) => {
  const [spinResults, setSpinResults] = useState<SpinResult[]>([]);
  const [claimResults, setClaimResults] = useState<ClaimResult[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSpinResult, setLastSpinResult] = useState<SpinResult | null>(null);
  const [lastClaimResult, setLastClaimResult] = useState<ClaimResult | null>(null);

  const connectWebSocket = useCallback(async () => {
    try {
      // Alchemy WebSocket provider
      const wsProvider = new ethers.WebSocketProvider('wss://base-mainnet.g.alchemy.com/v2/JfnVnW2YpUqElEL7WqWBt');
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, SPIN_AND_WIN_ABI, wsProvider);
      
      setIsConnected(true);

      // Listen for SpinResult events
      contract.on('SpinResult', (player: string, requestId: ethers.BigNumberish, reward: ethers.BigNumberish, jpReward: ethers.BigNumberish, prizeIndex: number, event: any) => {
        const result: SpinResult = {
          player,
          requestId: requestId.toString(),
          reward: ethers.formatEther(reward),
          jpReward: ethers.formatEther(jpReward),
          prizeIndex: Number(prizeIndex),
          timestamp: Date.now()
        };

        console.log('🎰 Spin Result:', result);
        
        setLastSpinResult(result);
        setSpinResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
        
        // If this is the current user's spin, trigger UI update
        if (userAddress && player.toLowerCase() === userAddress.toLowerCase()) {
          // You can emit a custom event here for the UI to listen
          window.dispatchEvent(new CustomEvent('userSpinResult', { detail: result }));
        }
      });

      // Listen for Claimed events
      contract.on('Claimed', (player: string, net: ethers.BigNumberish, fee: ethers.BigNumberish, event: any) => {
        const result: ClaimResult = {
          player,
          net: ethers.formatEther(net),
          fee: ethers.formatEther(fee),
          timestamp: Date.now()
        };

        console.log('💰 Claim Result:', result);
        
        setLastClaimResult(result);
        setClaimResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
        
        // If this is the current user's claim, trigger UI update
        if (userAddress && player.toLowerCase() === userAddress.toLowerCase()) {
          window.dispatchEvent(new CustomEvent('userClaimResult', { detail: result }));
        }
      });

      // Listen for SpinStarted events
      contract.on('SpinStarted', (player: string, requestId: ethers.BigNumberish, event: any) => {
        console.log('🎯 Spin Started:', { player, requestId: requestId.toString() });
        
        // If this is the current user's spin, trigger UI update
        if (userAddress && player.toLowerCase() === userAddress.toLowerCase()) {
          window.dispatchEvent(new CustomEvent('userSpinStarted', { 
            detail: { player, requestId: requestId.toString() }
          }));
        }
      });

      // Handle connection errors
      wsProvider.on('error', (error) => {
        console.error('WebSocket Error:', error);
        setIsConnected(false);
      });

      wsProvider.on('close', () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
      });

      return () => {
        contract.removeAllListeners();
        wsProvider.destroy();
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
    }
  }, [userAddress]);

  useEffect(() => {
    const cleanup = connectWebSocket();
    
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [connectWebSocket]);

  return {
    isConnected,
    spinResults,
    claimResults,
    lastSpinResult,
    lastClaimResult
  };
}; 