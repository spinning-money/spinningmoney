import React, { useState } from 'react';

interface ShareButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  className = '', 
  variant = 'primary',
  size = 'md' 
}) => {
  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
      secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
      outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-6 py-4 text-lg'
    };

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  };

  return (
    <button
      type="button"
      className={getButtonClasses() + ' bg-[#6746f9] hover:bg-[#4b2bbd] text-white'}
      onClick={() => {
        const text = encodeURIComponent('🎰 Just spun the wheel and won! Try your luck on Spinning Money - provably fair crypto gaming on Base! 🤑\n\nhttps://spinmoney.vercel.app/share');
        window.open(`https://warpcast.com/~/compose?text=${text}`, '_blank');
      }}
    >
      <svg className="h-5 w-5 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2m4-4v12m0-12l-4 4m4-4l4 4" /></svg>
      Share on Farcaster
    </button>
  );
};

export default ShareButton; 
