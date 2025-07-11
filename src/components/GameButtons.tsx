import React from 'react';
import { formatEther } from 'viem';

interface GameButtonsProps {
  isConnected: boolean;
  isLoading: boolean;
  canSpin: boolean;
  canClaim: boolean;
  claimableAmount: string;
  onConnect: () => void;
  onSpin: () => void;
  onClaim: () => void;
}

const GameButtons: React.FC<GameButtonsProps> = ({
  isConnected,
  isLoading,
  canSpin,
  canClaim,
  claimableAmount,
  onConnect,
  onSpin,
  onClaim
}) => {
  const formatAmount = (amount: string) => {
    if (!amount || amount === '0') return '0.0000 ETH';
    try {
      const num = parseFloat(amount);
      return `${num.toFixed(4)} ETH`;
    } catch {
      return '0.0000 ETH';
    }
  };

  if (!isConnected) {
    return (
      <div className="w-full flex flex-col items-center gap-4 px-4">
        <button
          onClick={onConnect}
          disabled={isLoading}
          className="w-full max-w-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-5 px-8 rounded-2xl shadow-lg text-lg active:scale-95 transition-all duration-200"
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
        <p className="text-white/70 text-sm text-center max-w-sm">
          Connect your wallet to start spinning!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-4 px-4">
      {/* Büyük Spin Butonu */}
      <button
        onClick={onSpin}
        disabled={isLoading || !canSpin}
        className="w-full max-w-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-6 px-8 rounded-2xl shadow-lg text-xl active:scale-95 transition-all duration-200 flex flex-col items-center gap-1"
      >
        <div className="text-2xl font-extrabold">
          {isLoading ? '🎯 SPINNING...' : '🎰 SPIN TO WIN'}
        </div>
        <div className="text-sm font-medium opacity-90">
          💎 0.0005 ETH
        </div>
      </button>

      {/* Claim Section */}
      <div className="w-full max-w-sm">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-3">
          <div className="text-center">
            <div className="text-white/70 text-sm mb-1">Your Claimable</div>
            <div className="text-2xl font-bold text-yellow-400">
              {formatAmount(claimableAmount)}
            </div>
          </div>
        </div>

        <button
          onClick={onClaim}
          disabled={isLoading || !canClaim}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg text-lg active:scale-95 transition-all duration-200"
        >
          {isLoading ? 'Claiming...' : '💰 CLAIM REWARDS'}
        </button>

        {!canClaim && parseFloat(claimableAmount) === 0 && (
          <p className="text-white/60 text-sm text-center mt-2">
            Spin to win and claim rewards!
          </p>
        )}
      </div>

      {/* Game Info */}
      <div className="text-center text-white/60 text-sm max-w-sm mt-2">
        <p className="mb-1">
          🎲 Each spin costs 0.0005 ETH
        </p>
        <p>
          🏆 Higher prizes and jackpots await!
        </p>
      </div>
    </div>
  );
};

export default GameButtons; 