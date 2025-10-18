import { lazy, Suspense } from 'react';
import * as LucideIcons from 'lucide-react';

export default function DynamicIcon({ library, name, size = '24', color = '#000000', className = '' }) {
  // For Heroicons, use dynamic import
  if (library === 'heroicons' && name) {
    try {
      // Dynamically import the icon
      const HeroIcon = lazy(() => 
        import('@heroicons/react/24/outline').then(module => ({ 
          default: module[name] || (() => <div>?</div>) 
        }))
      );
      
      return (
        <Suspense fallback={<div style={{ width: `${size}px`, height: `${size}px` }}>...</div>}>
          <HeroIcon
            className={className}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              color: color,
            }}
          />
        </Suspense>
      );
    } catch (error) {
      console.error('Error loading Heroicon:', name, error);
    }
  }

  if (library === 'lucide' && name && LucideIcons[name]) {
    const IconComponent = LucideIcons[name];
    return (
      <IconComponent
        className={className}
        size={parseInt(size)}
        color={color}
      />
    );
  }

  // Fallback if icon not found
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: '1px dashed #ccc',
      }}
    >
      ?
    </div>
  );
}

