import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Buffer polyfill for browser compatibility
import { Buffer } from 'buffer'
window.Buffer = Buffer

import { sdk } from '@farcaster/miniapp-sdk'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './wagmiConfig'

const queryClient = new QueryClient()

// Initialize Farcaster SDK
const initializeFarcaster = async () => {
  try {
    await sdk.actions.ready();
    console.log('✅ Farcaster SDK initialized successfully');
    
    // Check if we're in Farcaster environment by checking window object
    const isFarcaster = typeof window !== 'undefined' && 
      (window.location.hostname.includes('farcaster') || 
       window.location.hostname.includes('warpcast') ||
       window.navigator.userAgent.includes('Farcaster'));
    
    console.log('🔍 Farcaster environment detected:', isFarcaster);
    
    if (isFarcaster) {
      console.log('🎯 Running in Farcaster miniapp environment');
    }
  } catch (error) {
    console.log('⚠️ Not in Farcaster environment or SDK error:', error);
  }
};

// Initialize Farcaster SDK
initializeFarcaster();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <App />
      </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>,
) 