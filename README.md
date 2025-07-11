# Spinning Money - Farcaster Miniapp

🎰 **Provably fair spin wheel game on Base mainnet using Chainlink VRF for randomness.**

## Features

- **Provably Fair**: Uses Chainlink VRF for true randomness
- **Mobile-First**: Optimized for Farcaster mobile app
- **Wallet Integration**: Supports Farcaster wallet with MetaMask fallback
- **Real-time Updates**: WebSocket integration for live results
- **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS for styling
- Wagmi + Viem for blockchain interaction
- Farcaster SDK with miniapp connector
- Chainlink VRF for randomness

## Development

```bash
npm install
npm run dev
```

## Deployment

The app is deployed on Vercel at: https://spinmoney.vercel.app

## Farcaster Integration

- Miniapp manifest: `/.well-known/farcaster.json`
- Embed metadata for social sharing
- Wallet integration optimized for Farcaster environment

---

*Updated: Latest deployment with Farcaster embed fixes* 