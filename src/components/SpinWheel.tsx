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
  
  // Mobile-first: çark genişliği ekrana göre
  const size = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.85, 320) : 300;
  const center = size / 2;
  const radius = size / 2 - 8;
  const segmentAngle = 360 / PRIZES.length;

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
    if (prizeIndex === undefined) return null;
    
    const prize = PRIZES[prizeIndex];
    if (prize.name === 'Try Again') {
      return {
        type: 'lose',
        message: 'OH NO! You lost! 😭',
        subMessage: 'Try again for better luck!',
        color: 'bg-gradient-to-r from-red-500 to-red-600',
        icon: '💔'
      };
    } else {
      return {
        type: 'win',
        message: `CONGRATULATIONS! 🎉`,
        subMessage: `You won ${prize.name}!`,
        color: 'bg-gradient-to-r from-green-500 to-emerald-600',
        icon: '💰'
      };
    }
  };

  const resultMessage = getResultMessage();

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
            
            // Highlight winning segment
            const isWinningSegment = !isSpinning && prizeIndex !== undefined && i === prizeIndex;
            
            return (
              <path
                key={i}
                d={d}
                fill={isWinningSegment ? '#FFD700' : prize.color} // Gold for winning segment
                stroke={isWinningSegment ? '#FFA500' : '#232946'} // Orange border for winning segment
                strokeWidth={isWinningSegment ? 6 : 2} // Much thicker border for winning segment
                className="transition-all duration-500"
                style={{
                  filter: isWinningSegment ? 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.9))' : 'none',
                  transform: isWinningSegment ? 'scale(1.05)' : 'scale(1)', // Slightly larger for winning segment
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
          
          // Highlight winning segment text
          const isWinningSegment = !isSpinning && prizeIndex !== undefined && i === prizeIndex;
          
          return (
            <div
              key={i}
              className={`absolute font-bold drop-shadow-lg select-none pointer-events-none ${
                isWinningSegment ? 'text-black font-extrabold' : 'text-white'
              }`}
              style={{
                left: x,
                top: y,
                width: 60,
                textAlign: 'center',
                transform: 'translate(-50%, -50%)',
                fontSize: isWinningSegment ? '16px' : '12px',
                textShadow: isWinningSegment ? '2px 2px 4px rgba(0,0,0,0.8)' : '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {prize.name}
            </div>
          );
        })}

        {/* ETH simgesi - merkez, dönen kısımda */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-[#232946]">
          <div className="text-2xl">⟨</div>
        </div>
      </div>

      {/* Spinning Status */}
      {isSpinning && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
          {resultReceived ? '🎯 Finalizing...' : '🎰 Spinning...'}
        </div>
      )}

      {/* Result Display */}
      {!isSpinning && resultMessage && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          {/* Main result card */}
          <div className={`${resultMessage.color} text-white px-6 py-3 rounded-2xl shadow-xl border-2 border-white/20 flex flex-col items-center gap-1`}>
            <div className="text-2xl">{resultMessage.icon}</div>
            <div className="text-lg font-bold">{resultMessage.message}</div>
            <div className="text-sm font-medium opacity-90">{resultMessage.subMessage}</div>
          </div>
          
          {/* Glow effect */}
          <div className={`absolute inset-0 ${resultMessage.type === 'win' ? 'bg-green-400' : 'bg-red-400'} blur-xl opacity-30 rounded-2xl -z-10`}></div>
        </div>
      )}
    </div>
  );
};

export default SpinWheel; 
