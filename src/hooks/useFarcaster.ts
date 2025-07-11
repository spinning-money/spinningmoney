import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { SpinAndWinV3ABI } from '../contracts/SpinAndWinV3';
import { CONTRACT_ADDRESS } from '../contracts/SpinAndWinV3';
import { useState } from 'react';
import { formatEther } from 'viem';

export const useFarcaster = () => {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  // Read contract data
  const { data: prizePool } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SpinAndWinV3ABI,
    functionName: 'prizePool',
    watch: true
  });
  const { data: jackpotPool } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SpinAndWinV3ABI,
    functionName: 'jackpotPool',
    watch: true
  });
  const { data: spinPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SpinAndWinV3ABI,
    functionName: 'SPIN_PRICE',
    watch: true
  });
  const { data: isPaused } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SpinAndWinV3ABI,
    functionName: 'paused',
    watch: true
  });
  const { data: userData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SpinAndWinV3ABI,
    functionName: 'users',
    args: [address!],
    enabled: !!address,
    watch: true
  });

  // Write contract
  const { writeContractAsync } = useWriteContract();

  const spin = async () => {
    if (!address) return;
    setIsLoading(true);
    
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: SpinAndWinV3ABI,
        functionName: 'spin',
        value: spinPrice,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const claim = async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: SpinAndWinV3ABI,
        functionName: 'claim',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format userData for easier use
  const formattedUserData = userData ? {
    spins: Number(userData[0]),
    claimable: formatEther(userData[1]),
    claimed: formatEther(userData[2])
  } : null;

  return {
    address,
    isConnected,
    isLoading,
    prizePool: prizePool ? formatEther(prizePool) : '0',
    jackpotPool: jackpotPool ? formatEther(jackpotPool) : '0',
    spinPrice: spinPrice ? formatEther(spinPrice) : '0',
    isPaused: isPaused || false,
    userData: formattedUserData,
    spin,
    claim,
  };
}; 