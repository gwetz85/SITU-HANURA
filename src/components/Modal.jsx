import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Premium Modal Component
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Function to call when closing
 * @param {string} title - Main header title
 * @param {React.ReactNode} icon - Icon to display next to title
 * @param {React.ReactNode} children - Modal body content
 * @param {React.ReactNode} footer - Optional footer content
 * @param {string} maxWidth - Optional max-width override (default: 720px)
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  children, 
  footer,
  maxWidth = '720px'
}) => {
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="premium-modal-overlay" onClick={onClose}>
      <div 
        className="premium-modal-content" 
        style={{ maxWidth }} 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="premium-modal-header">
          <div className="premium-modal-title">
            {icon}
            <span>{title}</span>
          </div>
          <button className="premium-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="premium-modal-body">
          {children}
        </div>

        {footer && (
          <footer className="premium-modal-footer">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default Modal;
