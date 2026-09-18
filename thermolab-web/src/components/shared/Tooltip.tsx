
import React, { useState, useEffect, useCallback } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onMouseMove={handleMouseMove}
    >
      {children}
      {visible && (
        <div
          className="fixed z-[9999] px-2 py-1 bg-slate-900/90 text-white text-[10px] font-bold rounded shadow-xl pointer-events-none backdrop-blur-sm border border-slate-700 whitespace-nowrap"
          style={{
            left: position.x + 15,
            top: position.y - 10,
            transform: 'translateY(-50%)'
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
