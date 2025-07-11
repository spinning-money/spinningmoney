import React from 'react';

interface GameInfoProps {
  totalPool: string;
  jackpot: string;
}

const GameInfo: React.FC<GameInfoProps> = ({ totalPool, jackpot }) => {
  const prizes = [
    { name: '0.05 ETH', color: '#FF6B6B', probability: '~14%' },
    { name: '0.01 ETH', color: '#FF8C42', probability: '~14%' },
    { name: '0.005 ETH', color: '#6BCF7F', probability: '~14%' },
    { name: '0.0025 ETH', color: '#4D96FF', probability: '~14%' },
    { name: '0.0005 ETH', color: '#9B59B6', probability: '~14%' },
    { name: '0.00005 ETH', color: '#E91E63', probability: '~14%' },
    { name: 'Try Again', color: '#95A5A6', probability: '~16%' },
  ];

  const jackpotRewards = [
    { percentage: '30%', description: 'of Total Pool', color: '#FFD700' },
    { percentage: '20%', description: 'of Total Pool', color: '#FFA500' },
    { percentage: '10%', description: 'of Total Pool', color: '#FF6B6B' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-3 pb-6">
      {/* Main Info Panel */}
      <div className="bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-emerald-600/20 border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <div className="text-xl">🎰</div>
            <h2 className="text-lg font-bold text-white">Game Info</h2>
            <div className="text-xl">💰</div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          
          {/* Pool & Jackpot Section */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Pool */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-xl p-3 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">Ξ</span>
                </div>
                <h3 className="text-white font-semibold text-sm">Total Pool</h3>
              </div>
              <div className="text-lg font-bold text-blue-300">{totalPool} ETH</div>
              <p className="text-blue-200/70 text-xs mt-1">Grows with every spin</p>
            </div>

            {/* Jackpot */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 rounded-xl p-3 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">🎰</span>
                </div>
                <h3 className="text-white font-semibold text-sm">Jackpot</h3>
              </div>
              <div className="text-lg font-bold text-yellow-300">{jackpot} ETH</div>
              <p className="text-yellow-200/70 text-xs mt-1">Special bonus pool</p>
            </div>
          </div>

          {/* Jackpot Reward System */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 rounded-xl p-3 border border-yellow-500/20">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
              <span className="text-base">🏆</span>
              Jackpot Rewards
            </h3>
            <div className="space-y-2">
              {jackpotRewards.map((reward, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between bg-yellow-500/20 rounded-lg p-2 border border-yellow-500/30"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: reward.color }}
                    ></div>
                    <span className="text-yellow-300 font-semibold text-sm">{reward.percentage}</span>
                  </div>
                  <span className="text-yellow-200/70 text-xs">{reward.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prize Distribution */}
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-3 border border-white/10">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
              <span className="text-base">🎯</span>
              Prize Distribution
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {prizes.map((prize, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-slate-600/30 to-slate-700/30 rounded-lg p-2 border border-white/5 hover:border-white/20 transition-all duration-200"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: prize.color }}
                    ></div>
                    <span className="text-white font-medium text-xs">{prize.name}</span>
                  </div>
                  <div className="text-xs text-white/60">{prize.probability}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chainlink VRF Section */}
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/20 rounded-xl p-3 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">🔗</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Provably Fair</h3>
                <p className="text-orange-200/70 text-xs">Powered by Chainlink VRF</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="bg-orange-500/20 rounded-lg p-2 border border-orange-500/30">
                <div className="text-orange-300 font-semibold">Verifiable</div>
                <div className="text-orange-200/70">On-chain randomness</div>
              </div>
              <div className="bg-orange-500/20 rounded-lg p-2 border border-orange-500/30">
                <div className="text-orange-300 font-semibold">Tamper-proof</div>
                <div className="text-orange-200/70">No manipulation possible</div>
              </div>
              <div className="bg-orange-500/20 rounded-lg p-2 border border-orange-500/30">
                <div className="text-orange-300 font-semibold">Decentralized</div>
                <div className="text-orange-200/70">Oracle network secured</div>
              </div>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-xl p-3 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">🚀</span>
              </div>
              <h3 className="text-white font-semibold text-sm">The More You Play</h3>
            </div>
            <p className="text-green-200/80 text-xs leading-relaxed">
              The more spins, the bigger the pools grow! Every player contributes to making the rewards more exciting and valuable. Join the fun and watch the jackpots soar! 🎉
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GameInfo; 
