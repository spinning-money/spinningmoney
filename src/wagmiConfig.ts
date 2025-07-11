import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'

// Check if we're in Farcaster miniapp environment
const isFarcasterMiniapp = typeof window !== 'undefined' && 
  (window.location.hostname.includes('farcaster') || 
   window.location.hostname.includes('warpcast') ||
   window.navigator.userAgent.includes('Farcaster'));

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    miniAppConnector({
      // Force Farcaster wallet in miniapp environment
      forceFarcaster: isFarcasterMiniapp,
      // Auto connect in Farcaster environment
      autoConnect: isFarcasterMiniapp,
    })
  ],
  // Auto connect in Farcaster environment
  autoConnect: isFarcasterMiniapp,
}) 