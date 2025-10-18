import { useEffect } from 'react';

export default function ContextMenu({ 
  visible, 
  x, 
  y, 
  component, 
  onClose, 
  onAddChild,
  onDuplicate,
  onDelete,
  onEditText,
  onBringToFront,
  onSendToBack
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && visible) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (visible && !e.target.closest('.context-menu')) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [visible, onClose]);

  if (!visible || !component) return null;

  const isContainer = component.type === 'container' || component.type === 'columns' || component.type === 'form-container';
  const isText = component.type === 'heading' || component.type === 'text' || component.type === 'button';

  return (
    <div
      className="context-menu fixed z-[9999] bg-base-100 border border-base-300 rounded-lg shadow-xl py-2 min-w-[200px]"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {isContainer && (
        <button
          onClick={() => { onAddChild(); onClose(); }}
          className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
        >
          <span>➕</span> Add Child
        </button>
      )}
      
      {isText && (
        <button
          onClick={() => { onEditText(); onClose(); }}
          className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
        >
          <span>✏️</span> Edit Text
        </button>
      )}

      <button
        onClick={() => { onDuplicate(); onClose(); }}
        className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
      >
        <span>📋</span> Duplicate
      </button>

      <div className="divider my-1"></div>

      <button
        onClick={() => { onBringToFront(); onClose(); }}
        className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
      >
        <span>⬆️</span> Bring to Front
      </button>

      <button
        onClick={() => { onSendToBack(); onClose(); }}
        className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
      >
        <span>⬇️</span> Send to Back
      </button>

      <div className="divider my-1"></div>

      <button
        onClick={() => { onDelete(); onClose(); }}
        className="w-full text-left px-4 py-2 hover:bg-error hover:text-error-content flex items-center gap-2"
      >
        <span>🗑️</span> Delete
      </button>
    </div>
  );
}

