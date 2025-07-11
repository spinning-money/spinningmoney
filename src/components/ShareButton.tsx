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
  const [isSharing, setIsSharing] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

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

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      // Create the share URL with embed metadata
      const shareUrl = `${window.location.origin}/share`;
      
      // Try to use native Web Share API first
      if (navigator.share) {
        await navigator.share({
          title: 'Spinning Money - Spin the Wheel & Win ETH!',
          text: '🎰 Just spun the wheel and won! Try your luck on Spinning Money - provably fair crypto gaming on Base! 🤑',
          url: shareUrl
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/share`);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={getButtonClasses()}
      >
        {isSharing ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sharing...
          </>
        ) : showCopied ? (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share & Win
          </>
        )}
      </button>
      <button
        type="button"
        className={getButtonClasses() + ' bg-[#6746f9] hover:bg-[#4b2bbd] text-white'}
        onClick={() => {
          const text = encodeURIComponent('🎰 Just spun the wheel and won! Try your luck on Spinning Money - provably fair crypto gaming on Base! 🤑\n\nhttps://spinmoney.vercel.app/share');
          window.open(`https://warpcast.com/~/compose?text=${text}`, '_blank');
        }}
      >
        <svg className="h-5 w-5 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2m4-4v12m0-12l-4 4m4-4l4 4" /></svg>
        Farcaster'da Paylaş
      </button>
    </div>
  );
};

export default ShareButton; 