import React from 'react';
import { useChainId, useSwitchChain } from 'wagmi';

interface NetworkSelectorProps {
  activeNetwork: 'base' | 'monad';
  onNetworkChange: (network: 'base' | 'monad') => void;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ activeNetwork, onNetworkChange }) => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const handleNetworkChange = async (network: 'base' | 'monad') => {
    try {
      if (network === 'base') {
        await switchChain({ chainId: 8453 }); // Base mainnet
      } else if (network === 'monad') {
        await switchChain({ chainId: 10143 }); // Monad testnet
      }
      
      // Wait a bit for network switch to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onNetworkChange(network);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  return (
    <div className="w-full flex justify-center mb-6">
      <div className="bg-[#232946] rounded-xl p-1 border border-blue-400/30 shadow-lg">
        <div className="flex">
          <button
            onClick={() => handleNetworkChange('base')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeNetwork === 'base'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-blue-300 hover:text-blue-200 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span>Base</span>
              <span className="text-xs opacity-80">Mainnet</span>
            </div>
          </button>
          
          <div className="w-px bg-blue-400/30 mx-1"></div>
          
          <button
            onClick={() => handleNetworkChange('monad')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeNetwork === 'monad'
                ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg'
                : 'text-green-300 hover:text-green-200 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span>Monad</span>
              <span className="text-xs opacity-80">Testnet</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkSelector; 