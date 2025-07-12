import React, { useEffect, useState } from 'react';
import { SpinState } from '../hooks/useSpinEvents';

const PRIZES = [
  { name: '0.05 ETH', color: '#FF6B6B', value: 0.05 },
  { name: '0.01 ETH', color: '#FF8C42', value: 0.01 },
  { name: '0.005 ETH', color: '#6BCF7F', value: 0.005 },
  { name: '0.0025 ETH', color: '#4D96FF', value: 0.0025 },
  { name: '0.0005 ETH', color: '#9B59B6', value: 0.0005 },
  { name: '0.00005 ETH', color: '#E91E63', value: 0.00005 },
  { name: 'Try Again', color: '#95A5A6', value: 0 },
];

interface SpinWheelProps {
  spinState: SpinState;
  totalPool: string; // or number, depending on your state
  jackpot: string;   // or number, depending on your state
}

const SpinWheel = ({ spinState, totalPool, jackpot }: SpinWheelProps) => {
  const { isSpinning, targetAngle, resultReceived, prizeIndex } = spinState;
  const [currentRotation, setCurrentRotation] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
  
  // Mobile-first: çark genişliği ekrana göre
  const size = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.85, 320) : 300;
  const center = size / 2;
  const radius = size / 2 - 8;
  const segmentAngle = 360 / PRIZES.length;

  // Pulsing animation for winning segment
  useEffect(() => {
    if (!isSpinning && prizeIndex !== undefined && PRIZES[prizeIndex]?.name !== 'Try Again') {
      const interval = setInterval(() => {
        setPulseScale(prev => prev === 1 ? 1.1 : 1);
      }, 500);
      
      return () => clearInterval(interval);
    } else {
      setPulseScale(1);
    }
  }, [isSpinning, prizeIndex]);

  // Handle spinning animation
  useEffect(() => {
    let animationId: number;
    let startTime: number;
    let startRotation: number;

    if (isSpinning && !resultReceived) {
      // Continuous spinning animation
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        
        // Rotate 360 degrees every 500ms
        const newRotation = startRotation + (elapsed / 500) * 360;
        setCurrentRotation(newRotation);
        
        animationId = requestAnimationFrame(animate);
      };
      
      startRotation = currentRotation;
      animationId = requestAnimationFrame(animate);
    } else if (isSpinning && resultReceived) {
      // Final rotation to target angle
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const duration = 3000; // 3 seconds
        
        if (elapsed < duration) {
          const progress = elapsed / duration;
          const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
          const newRotation = startRotation + (targetAngle - startRotation) * easeOut;
          setCurrentRotation(newRotation);
          animationId = requestAnimationFrame(animate);
        } else {
          setCurrentRotation(targetAngle);
        }
      };
      
      startRotation = currentRotation;
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isSpinning, resultReceived, targetAngle, currentRotation]);

  // Get result message
  const getResultMessage = () => {
    if (isSpinning || prizeIndex === undefined) return null;

    const prize = PRIZES[prizeIndex];
    const isTryAgain = prize.name === 'Try Again';
    
    // Jackpot kazanma durumunu kontrol et (bu bilgiyi props olarak almalıyız)
    const hasJackpotWin = spinState.jackpotReward && parseFloat(spinState.jackpotReward) > 0;
    
    // Eğer ana ödül Try Again ama jackpot kazanmışsa, jackpot'u göster
    if (isTryAgain && hasJackpotWin) {
      return {
        type: 'jackpot',
        icon: '🎰',
        message: 'JACKPOT WIN!',
        subMessage: `+${spinState.jackpotReward} ETH`,
        color: 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500'
      };
    }
    
    // Normal durumlar
    if (isTryAgain) {
      return {
        type: 'lose',
        icon: '😔',
        message: 'Try Again',
        subMessage: 'Better luck next time!',
        color: 'bg-gradient-to-r from-red-500 to-red-600'
      };
    }

    return {
      type: 'win',
      icon: '🎉',
      message: `Won ${prize.name}!`,
      subMessage: hasJackpotWin ? `+${spinState.jackpotReward} ETH Jackpot Bonus!` : 'Congratulations!',
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    };
  };

  const resultMessage = getResultMessage();

  // Animasyon için ek CSS (Tailwind ile birlikte çalışır)
  const WINNER_ANIMATION = {
    animation: 'winner-pop 0.7s cubic-bezier(.68,-0.55,.27,1.55) 1, winner-glow 1.5s infinite alternate',
  };

  // Keyframes'i globalde ekle (örn. index.css'de), burada örnek olarak inline bırakıyorum:
  // @keyframes winner-pop { 0% { transform: scale(1); box-shadow: 0 0 0 0 #fff0; } 60% { transform: scale(1.15); box-shadow: 0 0 16px 4px #fff8; } 100% { transform: scale(1.05); box-shadow: 0 0 8px 2px #fff6; } }
  // @keyframes winner-glow { 0% { box-shadow: 0 0 8px 2px #fff6; } 100% { box-shadow: 0 0 24px 8px #ffe066; } }

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Modern, real Total Pool & Jackpot bar (only real data, more stylish) */}
      <div className="w-full max-w-md mx-auto pt-4 pb-6">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-400 rounded-3xl shadow-2xl px-10 py-6 border-4 border-white/10">
          <div className="flex flex-col items-start">
            <div className="text-xs font-semibold uppercase tracking-widest text-white/80">Total Pool</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-2 mt-1 drop-shadow-lg">
              <span>Ξ</span>
              <span className="tracking-tight">{totalPool}</span>
            </div>
          </div>
          <div className="h-12 w-px bg-white/20 mx-8" />
          <div className="flex flex-col items-end">
            <div className="text-xs font-semibold uppercase tracking-widest text-white/80">Jackpot</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-yellow-300 flex items-center gap-2 mt-1 drop-shadow-lg">
              <span role='img' aria-label='slot'>🎰</span>
              <span className="tracking-tight">{jackpot}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Wheel Container - Both SVG and labels rotate together */}
      <div 
        className="relative"
        style={{
          transform: `rotate(${currentRotation}deg)`,
          transition: 'none' // We handle animation manually
        }}
      >
        {/* SVG Wheel */}
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`} 
          className="block"
        >
          {PRIZES.map((prize, i) => {
            const startAngle = i * segmentAngle - 90;
            const endAngle = (i + 1) * segmentAngle - 90;
            const largeArc = segmentAngle > 180 ? 1 : 0;
            const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);
            const d = `M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
            
            // Enhanced winning segment highlighting
            const isWinningSegment = !isSpinning && prizeIndex !== undefined && i === prizeIndex;
            const isResult = !isSpinning && prizeIndex !== undefined;
            const isTryAgain = isWinningSegment && prize.name === 'Try Again';
            const isWinningPrize = isWinningSegment && prize.name !== 'Try Again';

            // Renk ve opaklık mantığı
            let fillColor = prize.color;
            let strokeColor = '#232946';
            let opacity = 1;
            if (isResult) {
              if (isWinningPrize) {
                fillColor = '#00FF7F'; // Canlı yeşil kazanan
                strokeColor = '#00C46A';
                opacity = 1;
              } else if (isTryAgain) {
                fillColor = '#FF3B3B'; // Canlı kırmızı kaybeden
                strokeColor = '#B80000';
                opacity = 1;
              } else {
                opacity = 0.4; // Diğer segmentler soluk
              }
            }

            return (
              <path
                key={i}
                d={d}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={isWinningSegment ? 8 : 2}
                className="transition-all duration-500"
                style={{
                  ...(isWinningSegment ? WINNER_ANIMATION : {}),
                  filter: 'none',
                  transform: isWinningSegment ? `scale(${pulseScale})` : 'scale(1)',
                  opacity,
                }}
              />
            );
          })}
        </svg>

        {/* Segment Labels - These now rotate with the wheel */}
        {PRIZES.map((prize, i) => {
          const angle = (i + 0.5) * segmentAngle - 90;
          const x = center + (radius - 35) * Math.cos((angle * Math.PI) / 180);
          const y = center + (radius - 35) * Math.sin((angle * Math.PI) / 180);
          
          // Enhanced winning segment text highlighting
          const isWinningSegment = !isSpinning && prizeIndex !== undefined && i === prizeIndex;
          const isResult = !isSpinning && prizeIndex !== undefined;
          const isTryAgain = isWinningSegment && prize.name === 'Try Again';
          const isWinningPrize = isWinningSegment && prize.name !== 'Try Again';

          let textColor = 'white';
          let fontWeight = 700;
          let opacity = 1;
          if (isResult) {
            if (isWinningPrize) {
              textColor = '#00FF7F';
              fontWeight = 900;
              opacity = 1;
            } else if (isTryAgain) {
              textColor = '#FF3B3B';
              fontWeight = 900;
              opacity = 1;
            } else {
              opacity = 0.4;
            }
          }

          return (
            <div
              key={i}
              className={`absolute font-bold drop-shadow-lg select-none pointer-events-none transition-all duration-500`}
              style={{
                ...(isWinningSegment ? WINNER_ANIMATION : {}),
                left: x,
                top: y,
                width: 60,
                textAlign: 'center',
                transform: `translate(-50%, -50%) scale(${isWinningSegment ? pulseScale : 1})`,
                fontSize: isWinningSegment ? '18px' : '12px',
                textShadow: isWinningSegment
                  ? '3px 3px 6px rgba(0,0,0,1), 0 0 10px #00FF7F88'
                  : '1px 1px 2px rgba(0,0,0,0.5)',
                fontWeight,
                color: textColor,
                opacity,
              }}
            >
              {prize.name}
            </div>
          );
        })}

        {/* ETH simgesi - merkez, dönen kısımda */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-[#232946]">
          {/* Gerçek Ethereum logosu SVG */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <polygon points="16,3 28,16 16,29 4,16" fill="#627EEA"/>
              <polygon points="16,3 16,29 28,16" fill="#8FA8F6"/>
              <polygon points="16,3 16,29 4,16" fill="#3B5CA8"/>
              <polygon points="16,7 24,16 16,25 8,16" fill="#fff" fillOpacity="0.95"/>
            </g>
          </svg>
        </div>
      </div>

      {/* Result Display */}
      {!isSpinning && resultMessage && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          {/* Main result card */}
          <div className={`${resultMessage.color} text-white px-6 py-3 rounded-2xl shadow-xl border-2 border-white/20 flex flex-col items-center gap-1`}>
            <div className="text-2xl">{resultMessage.icon}</div>
            <div className="text-lg font-bold">{resultMessage.message}</div>
            <div className="text-sm font-medium opacity-90">{resultMessage.subMessage}</div>
          </div>
          {/* Share on Farcaster butonu */}
          {(() => {
            // Kazanma durumu kontrolü
            const prize = prizeIndex !== undefined ? PRIZES[prizeIndex] : undefined;
            const jackpot = spinState.jackpotReward && parseFloat(spinState.jackpotReward) > 0 ? spinState.jackpotReward : undefined;
            const wonPrize = prize && prize.value > 0;
            const wonJackpot = jackpot && parseFloat(jackpot) > 0;
            if (!wonPrize && !wonJackpot) return null;
            // Dinamik mesaj
            let shareText = '';
            if (wonPrize && wonJackpot) {
              shareText = `🎉 I just won ${prize.name} AND hit the JACKPOT (+${jackpot} ETH) on Spinning Money! 💰💥\nCan you beat my luck? Spin now: https://farcaster.xyz/miniapps/jxUXo76X96_-/spinning-money\n#SpinningMoney #Jackpot #FarcasterMiniapp`;
            } else if (wonPrize) {
              shareText = `🎉 I just won ${prize.name} on Spinning Money! Feeling lucky! 🚀\nTry your luck: https://farcaster.xyz/miniapps/jxUXo76X96_-/spinning-money\n#SpinningMoney #FarcasterMiniapp`;
            } else if (wonJackpot) {
              shareText = `💥 JACKPOT! I just hit the bonus on Spinning Money and won ${jackpot} ETH! 🔥\nTry your luck: https://farcaster.xyz/miniapps/jxUXo76X96_-/spinning-money\n#SpinningMoney #Jackpot #FarcasterMiniapp`;
            }
            const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`;
            return (
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 text-white font-bold shadow-lg text-sm sm:text-base hover:scale-105 active:scale-95 transition-transform duration-150"
              >
                Share on Farcaster
              </a>
            );
          })()}
          {/* Glow effect */}
          <div className={`absolute inset-0 ${resultMessage.type === 'win' ? 'bg-green-400' : 'bg-red-400'} blur-xl opacity-30 rounded-2xl -z-10`}></div>
        </div>
      )}
    </div>
  );
};

export default SpinWheel; 
