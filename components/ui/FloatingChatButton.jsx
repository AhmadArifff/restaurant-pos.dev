'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import AIChatBox from '../admin/AIChatBox';

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  // Don't render if not admin (prevent hydration mismatch)
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      {/* Chat Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Chat Modal - AIChatBox handles its own header */}
      {isOpen && (
        <div
          className="fixed z-40"
          style={{
            bottom: '120px',
            right: '24px',
            width: 'min(450px, calc(100vw - 32px))',
            maxHeight: '600px',
          }}
        >
          <AIChatBox isModal={true} />
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 z-50 flex items-center justify-center text-xl font-bold hover:scale-110 active:scale-95 ${
          isOpen ? 'rotate-45' : ''
        }`}
        title={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          '🤖'
        )}
      </button>
    </>
  );
}
