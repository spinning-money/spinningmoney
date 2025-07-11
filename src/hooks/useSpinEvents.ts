import { useEffect, useState, useRef } from 'react';
import { createPublicClient, webSocket, parseAbiItem, getContract } from 'viem';
import { base } from 'viem/chains';
import { CONTRACT_ADDRESS, SpinAndWinV3ABI } from '../contracts/SpinAndWinV3';

// WebSocket client for real-time events
const client = createPublicClient({
  chain: base,
  transport: webSocket('wss://base-mainnet.g.alchemy.com/v2/JfnVnW2YpUqElEL7WqWBt')
});

export interface SpinState {
  isSpinning: boolean;
  targetAngle: number;
  prizeIndex?: number;
  resultReceived: boolean;
}

export const useSpinEvents = (userAddress?: string) => {
  const [spinState, setSpinState] = useState<SpinState>({
    isSpinning: false,
    targetAngle: 0,
    prizeIndex: undefined,
    resultReceived: false
  });

  const unwatchRef = useRef<(() => void) | null>(null);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate target angle based on prize index
  const calculateTargetAngle = (prizeIndex: number): number => {
    // 7 segments, each 360/7 = ~51.43 degrees
    const segmentAngle = 360 / 7;
    
    // Each segment's center angle (measured from 12 o'clock clockwise)
    const segmentCenterAngle = (prizeIndex + 0.5) * segmentAngle;
    
    // We need to rotate so the winning segment is at the top
    // Add multiple full rotations for visual effect (minimum 4-6 full spins)
    const minRotations = 4 + Math.random() * 2; // 4-6 rotations
    const baseRotation = minRotations * 360;
    
    // Final angle: base rotation + adjustment to bring winning segment to top
    const targetAngle = baseRotation + (360 - segmentCenterAngle);
    
    return targetAngle;
  };

  // Start spinning when spin transaction is initiated
  const startSpin = () => {
    console.log('🎰 Starting spin animation...');
    
    // Clear any existing timeout
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
    }
    
    setSpinState(prev => ({
      ...prev,
      isSpinning: true,
      resultReceived: false,
      prizeIndex: undefined
    }));

    // Set a timeout to check for events if none received within 15 seconds
    spinTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Timeout reached, checking for events...');
      checkRecentEvents();
    }, 15000);
  };

  // Stop spinning with result
  const stopSpinWithResult = (prizeIndex: number) => {
    console.log('🎯 Spin result received:', prizeIndex);
    
    // Clear timeout since we got the result
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = null;
    }
    
    const targetAngle = calculateTargetAngle(prizeIndex);
    
    setSpinState(prev => ({
      ...prev,
      targetAngle,
      prizeIndex,
      resultReceived: true
    }));

    // Stop spinning after animation completes
    setTimeout(() => {
      setSpinState(prev => ({
        ...prev,
        isSpinning: false
      }));
    }, 3000); // Match animation duration
  };

  // Manual check for recent events (fallback)
  const checkRecentEvents = async () => {
    if (!userAddress) return;
    
    try {
      console.log('🔍 Checking for recent SpinResult events...');
      
      // Get recent blocks
      const latestBlock = await client.getBlockNumber();
      const fromBlock = latestBlock - 20n; // Check last 20 blocks
      
      // Get logs for SpinResult events
      const logs = await client.getLogs({
        address: CONTRACT_ADDRESS,
        event: parseAbiItem('event SpinResult(address indexed player, uint256 indexed requestId, uint256 reward, uint256 jpReward, uint8 prizeIndex)'),
        fromBlock,
        toBlock: latestBlock,
      });

      // Filter for current user
      const userLogs = logs.filter(log => 
        log.args.player?.toLowerCase() === userAddress.toLowerCase()
      );

      if (userLogs.length > 0) {
        const latestLog = userLogs[userLogs.length - 1];
        if (latestLog.args.prizeIndex !== undefined) {
          console.log('🎉 Found recent SpinResult:', latestLog.args);
          stopSpinWithResult(Number(latestLog.args.prizeIndex));
        }
      } else {
        console.log('❌ No recent events found for user');
      }
    } catch (error) {
      console.error('Error checking recent events:', error);
    }
  };

  useEffect(() => {
    if (!userAddress) return;

    console.log('🔗 Setting up WebSocket connection for address:', userAddress);

    // Clean up previous connection
    if (unwatchRef.current) {
      unwatchRef.current();
    }

    // Listen for SpinResult events
    const unwatch = client.watchEvent({
      address: CONTRACT_ADDRESS,
      event: parseAbiItem('event SpinResult(address indexed player, uint256 indexed requestId, uint256 reward, uint256 jpReward, uint8 prizeIndex)'),
      onLogs: (logs) => {
        console.log('📡 Received logs:', logs.length);
        logs.forEach((log) => {
          console.log('📋 Log:', log);
          // Check if this event is for the current user
          if (log.args.player?.toLowerCase() === userAddress.toLowerCase()) {
            if (log.args.prizeIndex !== undefined) {
              console.log('🎉 SpinResult event received:', {
                player: log.args.player,
                prizeIndex: log.args.prizeIndex,
                reward: log.args.reward,
                jpReward: log.args.jpReward
              });
              
              stopSpinWithResult(Number(log.args.prizeIndex));
            }
          }
        });
      },
      onError: (error) => {
        console.error('❌ WebSocket error:', error);
        // Fallback to manual checking
        setTimeout(checkRecentEvents, 2000);
      }
    });

    unwatchRef.current = unwatch;

    return () => {
      if (unwatchRef.current) {
        unwatchRef.current();
      }
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, [userAddress]);

  return {
    spinState,
    startSpin,
    stopSpinWithResult,
    setSpinState,
    checkRecentEvents
  };
}; 