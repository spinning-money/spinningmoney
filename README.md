# 🎰 Spinning Money - Farcaster Miniapp

A provably fair spin wheel game built for Farcaster, powered by Chainlink VRF on Base chain.

## 🚀 Features

- **🎰 Spin Wheel Game**: Interactive spinning wheel with 7 prize segments
- **🔗 Chainlink VRF**: Provably fair randomness
- **💰 Real Rewards**: Win actual ETH prizes
- **🎯 Farcaster Integration**: Native Farcaster wallet support
- **📱 Mobile-First**: Optimized for Farcaster mobile app
- **⚡ Real-Time**: Live event updates via WebSocket
- **🏆 Jackpot System**: Progressive jackpot with percentage rewards

## 🎮 How to Play

1. **Connect Wallet**: Use Farcaster wallet or MetaMask
2. **Spin the Wheel**: Click "SPIN TO WIN" (costs 0.0005 ETH)
3. **Wait for Result**: Chainlink VRF generates provably fair result
4. **Claim Rewards**: Collect your winnings instantly

## 🏆 Prize Tiers

- **0.05 ETH** - Grand Prize (Red)
- **0.01 ETH** - Major Prize (Orange)
- **0.005 ETH** - Medium Prize (Green)
- **0.0025 ETH** - Minor Prize (Blue)
- **0.0005 ETH** - Small Prize (Purple)
- **0.00005 ETH** - Micro Prize (Pink)
- **Try Again** - No prize (Gray)

## 🛠️ Technical Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Blockchain**: Wagmi + Viem
- **Wallet**: Farcaster Miniapp Connector
- **Randomness**: Chainlink VRF v2.5
- **Chain**: Base Mainnet
- **Events**: WebSocket + Real-time updates

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/farcaster-spin-wheel.git
cd farcaster-spin-wheel

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🚀 Deployment

### Quick Deploy

```bash
# Build and prepare for deployment
npm run deploy
```

### Manual Deploy

```bash
# Build the project
npm run build

# Deploy dist/ contents to your hosting provider
# Ensure .well-known/farcaster.json is accessible
```

## 🌐 Domain Setup

### Farcaster Manifest

The app includes a Farcaster manifest at `/.well-known/farcaster.json`:

```json
{
  "miniapp": {
    "version": "1",
    "name": "Spinning Money",
    "homeUrl": "https://farcmoney.com",
    "canonicalDomain": "farcmoney.com"
  }
}
```

### Required Files

- `/.well-known/farcaster.json` - Farcaster manifest
- `/icon.svg` - App icon (512x512)
- All built files in `dist/`

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_CONTRACT_ADDRESS=0x501434B1eAa8A85dBAb5D6d933F2f22cb10e6253
VITE_CHAINLINK_SUBSCRIPTION_ID=17952329676849432097364691293412979287742510665681724364050779803330792847198
VITE_ALCHEMY_WS_URL=wss://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### Contract Details

- **Contract**: `0x501434B1eAa8A85dBAb5D6d933F2f22cb10e6253`
- **Chain**: Base Mainnet
- **Spin Price**: 0.0005 ETH
- **VRF**: Chainlink VRF v2.5

## 🧪 Testing

### Local Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
# Connect MetaMask or Farcaster wallet
# Test spin functionality
```

### Farcaster Testing

1. Deploy to your domain
2. Open in Farcaster app
3. Test wallet connection
4. Verify real-time events

## 📱 Farcaster Integration

### Wallet Support

- **Farcaster Wallet**: Native integration
- **MetaMask**: Fallback support
- **Auto-connect**: In Farcaster environment

### Environment Detection

The app automatically detects Farcaster environment and:
- Uses Farcaster wallet connector
- Shows Farcaster badges
- Enables auto-connect

## 🔒 Security

### Provably Fair

- **Chainlink VRF**: Verifiable randomness
- **On-chain Logic**: No frontend manipulation
- **Transparent**: All results verifiable on-chain

### Smart Contract

- **Audited**: Security best practices
- **Paused**: Emergency pause functionality
- **Ownership**: Controlled by trusted team

## 📊 Analytics

### Event Tracking

- Spin attempts
- Win/loss ratios
- Prize distributions
- User engagement

### Real-time Updates

- Live pool amounts
- Recent winners
- Jackpot status
- Contract events

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: GitHub Issues
- **Discord**: Join our community
- **Email**: support@farcmoney.com

## 🎯 Roadmap

- [ ] Multi-chain support
- [ ] Tournament mode
- [ ] Social features
- [ ] Mobile app
- [ ] Advanced analytics

---

**Built with ❤️ for the Farcaster community** 