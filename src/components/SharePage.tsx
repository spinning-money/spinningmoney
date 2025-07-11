import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface SharePageProps {
  className?: string;
}

const SharePage: React.FC<SharePageProps> = ({ className = '' }) => {
  const [searchParams] = useSearchParams();
  const prize = searchParams.get('prize');
  const amount = searchParams.get('amount');
  const isWinner = searchParams.get('winner') === 'true';

  useEffect(() => {
    // Add embed metadata to the page head
    const addEmbedMetadata = () => {
      const miniappEmbed = {
        version: "1",
        imageUrl: `${window.location.origin}/sharing-image.png`,
        button: {
          title: isWinner ? "🎰 Try Your Luck!" : "🎰 Spin & Win!",
          action: {
            type: "launch_miniapp",
            url: window.location.origin,
            name: "Spinning Money",
            splashImageUrl: `${window.location.origin}/splash.png`,
            splashBackgroundColor: "#0f172a"
          }
        }
      };

      const frameEmbed = {
        version: "1",
        imageUrl: `${window.location.origin}/sharing-image.png`,
        button: {
          title: isWinner ? "🎰 Try Your Luck!" : "🎰 Spin & Win!",
          action: {
            type: "launch_frame",
            url: window.location.origin,
            name: "Spinning Money",
            splashImageUrl: `${window.location.origin}/splash.png`,
            splashBackgroundColor: "#0f172a"
          }
        }
      };

      // Remove existing meta tags
      const existingMiniappMeta = document.querySelector('meta[name="fc:miniapp"]');
      const existingFrameMeta = document.querySelector('meta[name="fc:frame"]');
      
      if (existingMiniappMeta) existingMiniappMeta.remove();
      if (existingFrameMeta) existingFrameMeta.remove();

      // Add new meta tags
      const miniappMeta = document.createElement('meta');
      miniappMeta.name = 'fc:miniapp';
      miniappMeta.content = JSON.stringify(miniappEmbed);
      document.head.appendChild(miniappMeta);

      const frameMeta = document.createElement('meta');
      frameMeta.name = 'fc:frame';
      frameMeta.content = JSON.stringify(frameEmbed);
      document.head.appendChild(frameMeta);
    };

    addEmbedMetadata();
  }, [isWinner]);

  const getShareMessage = () => {
    if (isWinner && prize && amount) {
      return `🎉 Just won ${prize} (${amount} ETH) on Spinning Money! 🎰 Try your luck too!`;
    } else if (isWinner) {
      return `🎉 Just won on Spinning Money! 🎰 Try your luck too!`;
    } else {
      return `🎰 Spinning Money - Provably fair crypto gaming on Base! Every spin grows the prize pool! 🤑`;
    }
  };

  const getTitle = () => {
    if (isWinner && prize) {
      return `Won ${prize}! 🎉`;
    } else if (isWinner) {
      return `Winner! 🎉`;
    } else {
      return `Spin the Wheel & Win ETH! 🎰`;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {getTitle()}
          </h1>
          <p className="text-gray-300 text-lg">
            {getShareMessage()}
          </p>
        </div>

        {/* Prize Display */}
        {isWinner && prize && (
          <div className="mb-8 p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              {prize}
            </div>
            {amount && (
              <div className="text-xl text-yellow-300">
                {amount} ETH
              </div>
            )}
          </div>
        )}

        {/* Spin Wheel Preview */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            🎰
          </div>
        </div>

        {/* Features */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-center gap-2 text-gray-300">
            <span className="text-green-400">✓</span>
            <span>Provably Fair with Chainlink VRF</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-300">
            <span className="text-green-400">✓</span>
            <span>Growing Prize Pool</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-300">
            <span className="text-green-400">✓</span>
            <span>Instant Payouts</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="space-y-4">
          <a
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            🎰 Spin Now & Win!
          </a>
          
          <p className="text-sm text-gray-400">
            Share this page to challenge your friends!
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-gray-500">
            Powered by Base • Chainlink VRF • Farcaster
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharePage; 