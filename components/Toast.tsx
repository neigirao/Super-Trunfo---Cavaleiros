import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  const color = type === 'error' ? '#d94a4a' : type === 'success' ? '#50dc78' : '#f4c349';
  const icon = type === 'error' ? '✕' : type === 'success' ? '✓' : '◆';

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, padding: '14px 28px',
        background: 'rgba(10,5,0,.97)', border: `1px solid ${color}`,
        boxShadow: `0 0 32px ${color}33, 0 4px 24px rgba(0,0,0,.7)`,
        fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.25em',
        color, cursor: 'pointer', maxWidth: 480, width: 'max-content',
        display: 'flex', alignItems: 'center', gap: 10,
      }}
    >
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span>{message}</span>
    </div>
  );
};
