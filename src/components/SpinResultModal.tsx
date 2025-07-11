import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Coins, Sparkles, X, ExternalLink } from 'lucide-react';
import { SpinResult } from '../hooks/useWebSocket';

interface SpinResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SpinResult | null;
  userAddress?: string;
}

const PRIZES = [
  { name: '0.05 ETH', color: '#FF6B6B', icon: Trophy, emoji: '🏆' },
  { name: '0.01 ETH', color: '#4ECDC4', icon: Coins, emoji: '💰' },
  { name: '0.005 ETH', color: '#45B7D1', icon: Coins, emoji: '💎' },
  { name: '0.0025 ETH', color: '#96CEB4', icon: Coins, emoji: '💚' },
  { name: '0.0005 ETH', color: '#FFEAA7', icon: Coins, emoji: '⭐' },
  { name: '0.00005 ETH', color: '#DDA0DD', icon: Coins, emoji: '✨' },
  { name: 'Try Again', color: '#F8F9FA', icon: Sparkles, emoji: '🎲' },
];

const SpinResultModal: React.FC<SpinResultModalProps> = ({ 
  isOpen, 
  onClose, 
  result, 
  userAddress 
}) => {
  if (!result) return null;

  const isUserSpin = userAddress && result.player.toLowerCase() === userAddress.toLowerCase();
  const prize = PRIZES[result.prizeIndex];
  const totalReward = parseFloat(result.reward) + parseFloat(result.jpReward);
  const hasWon = totalReward > 0;

  const formatEth = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1) {
      return `${num.toFixed(4)} ETH`;
    } else if (num >= 0.01) {
      return `${(num * 1000).toFixed(2)} mETH`;
    } else {
      return `${(num * 1000000).toFixed(1)} μETH`;
    }
  };

  const getResultMessage = () => {
    if (hasWon) {
      if (parseFloat(result.jpReward) > 0) {
        return "🎉 JACKPOT! You hit the jackpot! 🎉";
      }
      return "🎊 Congratulations! You won! 🎊";
    }
    return "😅 Better luck next time! Keep spinning!";
  };

  const getConfettiColors = () => {
    if (parseFloat(result.jpReward) > 0) {
      return ['#FFD700', '#FFA500', '#FF6B6B', '#FFEAA7'];
    }
    if (hasWon) {
      return ['#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    }
    return ['#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA'];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>

            {/* Result Header */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {hasWon ? '🎉' : '🎲'}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {getResultMessage()}
              </h2>
              <p className="text-gray-600">
                {isUserSpin ? 'Your spin result' : 'Spin completed'}
              </p>
            </div>

            {/* Prize Details */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border border-purple-100">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${prize.color}20` }}
                >
                  {prize.emoji}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{prize.name}</h3>
                  <p className="text-sm text-gray-600">Prize #{result.prizeIndex + 1}</p>
                </div>
              </div>

              {/* Reward Breakdown */}
              {hasWon && (
                <div className="space-y-2">
                  {parseFloat(result.reward) > 0 && (
                    <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                      <span className="text-gray-600">Main Prize:</span>
                      <span className="font-bold text-green-600">{formatEth(result.reward)}</span>
                    </div>
                  )}
                  {parseFloat(result.jpReward) > 0 && (
                    <div className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <span className="text-gray-600">🎰 Jackpot:</span>
                      <span className="font-bold text-orange-600">{formatEth(result.jpReward)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 px-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <span className="text-gray-700 font-semibold">Total Won:</span>
                    <span className="font-bold text-blue-600 text-lg">{formatEth(totalReward.toString())}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Transaction Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Request ID:</span>
                <span className="font-mono text-gray-800">{result.requestId.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Player:</span>
                <span className="font-mono text-gray-800">{result.player.slice(0, 6)}...{result.player.slice(-4)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Time:</span>
                <span className="text-gray-800">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                Continue Playing
              </button>
              <button
                onClick={() => {
                  window.open(`https://basescan.org/tx/${result.requestId}`, '_blank');
                }}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                title="View on Explorer"
              >
                <ExternalLink size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Confetti Effect */}
            {hasWon && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {getConfettiColors().map((color, index) => (
                  <motion.div
                    key={index}
                    className="absolute w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{
                      x: Math.random() * 400 - 200,
                      y: -20,
                      opacity: 1,
                    }}
                    animate={{
                      y: 400,
                      opacity: 0,
                      rotate: 360,
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      delay: Math.random() * 0.5,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SpinResultModal; 