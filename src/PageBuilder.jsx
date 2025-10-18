import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ColorPicker, SpacingControl, TypographyControl, BorderControl, ShadowControl, DisplayControl } from "./components/StyleControls";
import IconPicker from "./components/IconPicker";
import { EmbedHelper } from "./components/EmbedHelper";
import DynamicIcon from "./components/DynamicIcon";
import ContextMenu from "./components/ContextMenu";

// Custom Page Builder - Simple and Reliable
export default function PageBuilder({
  pageId,
  initialComponents = [],
  onSave,
  onBack,
  pageName = 'Page Builder',
  pageSlug = '',
  brandColors = [],
}) {
  const id = pageId;
  const [page, setPage] = useState({ id: pageId, name: pageName, slug: pageSlug });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [components, setComponents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [resizingId, setResizingId] = useState(null);
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [draggingId, setDraggingId] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, componentX: 0, componentY: 0 });
  const [activeGuides, setActiveGuides] = useState({ x: null, y: null });
  const [altKeyPressed, setAltKeyPressed] = useState(false);
  const [activeTab, setActiveTab] = useState('content'); // content, style, advanced
  const [showAddMenu, setShowAddMenu] = useState(null); // ID of container showing add menu
  const [draggedComponentType, setDraggedComponentType] = useState(null);
  const [fullWidth, setFullWidth] = useState(() => localStorage.getItem('builder.fullWidth') === 'true');
  const [device, setDevice] = useState(() => localStorage.getItem('builder.device') || 'Desktop');
  const [zoom, setZoom] = useState(() => parseFloat(localStorage.getItem('builder.zoom')) || 100);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, targetId: null });
  const [showGrid, setShowGrid] = useState(() => localStorage.getItem('builder.showGrid') !== 'false');

  // Device presets
  const devicePresets = {
    'Mobile': 375,
    'Tablet': 768,
    'Desktop': 1440,
  };

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('builder.fullWidth', fullWidth);
  }, [fullWidth]);

  useEffect(() => {
    localStorage.setItem('builder.device', device);
  }, [device]);

  useEffect(() => {
    localStorage.setItem('builder.zoom', zoom);
  }, [zoom]);

  useEffect(() => {
    localStorage.setItem('builder.showGrid', showGrid);
  }, [showGrid]);

  // Track Alt key for disabling snapping
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Alt') setAltKeyPressed(true);
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Alt') setAltKeyPressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Snap helper functions
  const getSnapLines = (components, activeId) => {
    const verticalLines = [0, 600, 1200]; // Left edge, center, right edge of canvas
    const horizontalLines = [0, 400]; // Top edge, center of canvas
    
    components.forEach(comp => {
      if (comp.id === activeId) return;
      const pos = comp.position || { x: 0, y: 0 };
      const width = comp.width && comp.width !== 'auto' ? parseInt(comp.width) : 100;
      const height = comp.height && comp.height !== 'auto' ? parseInt(comp.height) : 100;
      
      verticalLines.push(pos.x, pos.x + width / 2, pos.x + width);
      horizontalLines.push(pos.y, pos.y + height / 2, pos.y + height);
    });
    
    return { verticalLines, horizontalLines };
  };

  const snap = (value, targets, threshold = 8) => {
    let minDist = threshold;
    let snappedValue = value;
    let snapTarget = null;
    
    for (const target of targets) {
      const dist = Math.abs(value - target);
      if (dist < minDist) {
        minDist = dist;
        snappedValue = target;
        snapTarget = target;
      }
    }
    
    return { snapped: snapTarget !== null, value: snappedValue, target: snapTarget };
  };

  const snapToGrid = (value, gridSize = 10) => {
    return Math.round(value / gridSize) * gridSize;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const selectedComponent = selectedId ? findComponent(selectedId) : null;

      // Enter key - start editing selected text element
      if (e.key === 'Enter' && selectedId && selectedComponent) {
        if (selectedComponent.type === 'heading' || selectedComponent.type === 'text' || selectedComponent.type === 'button') {
          e.preventDefault();
          setEditingId(selectedId);
        }
      }

      // Delete/Backspace key - delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        if (confirm('Delete this component?')) {
          deleteComponent(selectedId);
        }
      }

      // Escape key - deselect
      if (e.key === 'Escape' && selectedId && !editingId) {
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, editingId]);

  // Element resize handlers with corner support
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingId) return;

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      const component = findComponent(resizingId);
      if (!component) return;

      let newWidth, newHeight, newX, newY;

      // Handle corner-based resizing with position adjustments
      if (resizeStart.corner) {
        switch (resizeStart.corner) {
          case 'se': // Bottom-right: only size changes
            newWidth = Math.max(50, resizeStart.width + deltaX);
            newHeight = Math.max(50, resizeStart.height + deltaY);
            newX = resizeStart.componentX;
            newY = resizeStart.componentY;
            break;
          case 'sw': // Bottom-left: width shrinks from left, height grows down
            newWidth = Math.max(50, resizeStart.width - deltaX);
            newHeight = Math.max(50, resizeStart.height + deltaY);
            newX = resizeStart.componentX + deltaX;
            newY = resizeStart.componentY;
            break;
          case 'ne': // Top-right: width grows right, height shrinks from top
            newWidth = Math.max(50, resizeStart.width + deltaX);
            newHeight = Math.max(50, resizeStart.height - deltaY);
            newX = resizeStart.componentX;
            newY = resizeStart.componentY + deltaY;
            break;
          case 'nw': // Top-left: both shrink from top-left
            newWidth = Math.max(50, resizeStart.width - deltaX);
            newHeight = Math.max(50, resizeStart.height - deltaY);
            newX = resizeStart.componentX + deltaX;
            newY = resizeStart.componentY + deltaY;
            break;
          default:
            newWidth = resizeStart.width;
            newHeight = resizeStart.height;
            newX = resizeStart.componentX;
            newY = resizeStart.componentY;
        }

        // Update component with new size and position
        if (component.type === 'text') {
          updateComponent(resizingId, {
            width: `${Math.round(newWidth)}px`,
            position: { x: Math.round(newX), y: Math.round(newY) },
          });
        } else {
          updateComponent(resizingId, {
            width: `${Math.round(newWidth)}px`,
            height: `${Math.round(newHeight)}px`,
            position: { x: Math.round(newX), y: Math.round(newY) },
          });
        }
      } else if (resizeStart.aspectRatio === false) {
        // Legacy resize (for image handles)
        newWidth = Math.max(50, resizeStart.width + deltaX);
        newHeight = Math.max(50, resizeStart.height + deltaY);
        
        if (component.type === 'text') {
          updateComponent(resizingId, {
            width: `${Math.round(newWidth)}px`,
          });
        } else {
          updateComponent(resizingId, {
            width: `${Math.round(newWidth)}px`,
            height: `${Math.round(newHeight)}px`,
          });
        }
      } else {
        // Maintain aspect ratio (legacy corner resize)
        const aspectRatio = resizeStart.width / resizeStart.height;
        newWidth = Math.max(50, resizeStart.width + deltaX);
        newHeight = newWidth / aspectRatio;
        
        updateComponent(resizingId, {
          width: `${Math.round(newWidth)}px`,
          height: `${Math.round(newHeight)}px`,
        });
      }
    };

    const handleMouseUp = () => {
      if (resizingId) {
        // Check if resized component is inside a container and trigger resize
        const resizedComp = findComponent(resizingId);
        if (resizedComp) {
          // Find parent by checking all containers
          const findParent = (comps) => {
            for (const comp of comps) {
              if (comp.children) {
                if (comp.children.some(c => c.id === resizingId)) {
                  return comp.id;
                }
                const nested = findParent(comp.children);
                if (nested) return nested;
              }
            }
            return null;
          };
          const parentId = findParent(components);
          if (parentId) {
            setTimeout(() => recalcContainerSize(parentId), 0);
          }
        }
        
        setResizingId(null);
      }
    };

    if (resizingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingId, resizeStart]);

  // Drag to position handlers with snapping
  useEffect(() => {
    let rafId = null;

    const handleMouseMove = (e) => {
      if (!draggingId) return;

      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        let newX = Math.max(0, dragStart.componentX + deltaX);
        let newY = Math.max(0, dragStart.componentY + deltaY);

        const guides = { x: null, y: null };

        // Apply snapping if Alt key is not pressed
        if (!altKeyPressed) {
          const component = findComponent(draggingId);
          if (component) {
            const width = component.width && component.width !== 'auto' ? parseInt(component.width) : 100;
            const height = component.height && component.height !== 'auto' ? parseInt(component.height) : 100;
            
            const { verticalLines, horizontalLines } = getSnapLines(components, draggingId);
            
            // Snap left edge, center, or right edge
            const leftSnap = snap(newX, verticalLines);
            const centerXSnap = snap(newX + width / 2, verticalLines);
            const rightSnap = snap(newX + width, verticalLines);
            
            if (leftSnap.snapped) {
              newX = leftSnap.value;
              guides.x = leftSnap.target;
            } else if (centerXSnap.snapped) {
              newX = centerXSnap.value - width / 2;
              guides.x = centerXSnap.target;
            } else if (rightSnap.snapped) {
              newX = rightSnap.value - width;
              guides.x = rightSnap.target;
            } else {
              // Fallback to grid snap
              newX = snapToGrid(newX, 10);
            }
            
            // Snap top edge, center, or bottom edge
            const topSnap = snap(newY, horizontalLines);
            const centerYSnap = snap(newY + height / 2, horizontalLines);
            const bottomSnap = snap(newY + height, horizontalLines);
            
            if (topSnap.snapped) {
              newY = topSnap.value;
              guides.y = topSnap.target;
            } else if (centerYSnap.snapped) {
              newY = centerYSnap.value - height / 2;
              guides.y = centerYSnap.target;
            } else if (bottomSnap.snapped) {
              newY = bottomSnap.value - height;
              guides.y = bottomSnap.target;
            } else {
              // Fallback to grid snap
              newY = snapToGrid(newY, 10);
            }
          }
        }

        setActiveGuides(guides);
        updateComponent(draggingId, {
          position: { x: newX, y: newY },
        });
      });
    };

    const handleMouseUp = () => {
      if (draggingId) {
        // Check if dragged component is inside a container and trigger resize
        const draggedComp = findComponent(draggingId);
        if (draggedComp) {
          // Find parent by checking all containers
          const findParent = (comps) => {
            for (const comp of comps) {
              if (comp.children) {
                if (comp.children.some(c => c.id === draggingId)) {
                  return comp.id;
                }
                const nested = findParent(comp.children);
                if (nested) return nested;
              }
            }
            return null;
          };
          const parentId = findParent(components);
          if (parentId) {
            setTimeout(() => recalcContainerSize(parentId), 0);
          }
        }
        
        setDraggingId(null);
        setActiveGuides({ x: null, y: null });
      }
      if (rafId) cancelAnimationFrame(rafId);
    };

    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [draggingId, dragStart, altKeyPressed, components]);

  // Initialize page data from props
  useEffect(() => {
    setPage({ id: pageId, name: pageName, slug: pageSlug });
    setComponents(initialComponents);
    setLoading(false);
  }, [pageId, pageName, pageSlug, initialComponents]);

  // Save page
  const handleSave = async () => {
    if (!page) return;
    setSaving(true);
    try {
      if (onSave) {
        await onSave({
          components,
          pageId: id,
          pageName: page.name,
          pageSlug: page.slug
        });
      }
    } catch (e) {
      console.error('Error saving page:', e);
      alert('❌ Error saving page: ' + (e.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // Add component with position
  const addComponent = (type, parentId = null) => {
    // Calculate better initial position
    let initialPosition;
    
    if (parentId) {
      // Adding to a container - calculate based on siblings
      const parent = findComponent(parentId);
      const siblingCount = parent?.children?.length || 0;
      initialPosition = {
        x: 16 + (siblingCount % 3) * 220,
        y: 16 + Math.floor(siblingCount / 3) * 160,
      };
    } else {
      // Adding to root - stagger in a grid
      const rootCount = components.length;
      initialPosition = {
        x: 80 + (rootCount % 3) * 300,
        y: 80 + Math.floor(rootCount / 3) * 220,
      };
    }
    
    const baseComponent = {
      id: Date.now().toString(),
      type,
      position: initialPosition,
      styles: {},
    };

    // Define component-specific properties
    let newComponent = { ...baseComponent };

    switch (type) {
      case 'heading':
        newComponent = { ...newComponent, content: 'New Heading', className: 'text-3xl font-bold', width: 'auto', height: 'auto' };
        break;
      case 'text':
        newComponent = { ...newComponent, content: 'New text content', className: 'text-base', width: '300px', height: 'auto' };
        break;
      case 'button':
        newComponent = { ...newComponent, content: 'Click Me', href: '#', className: 'btn btn-primary', width: 'auto', height: 'auto' };
        break;
      case 'image':
        newComponent = { ...newComponent, content: 'https://via.placeholder.com/400x300', className: 'rounded-lg object-cover', width: '400px', height: '300px' };
        break;
      case 'columns':
        newComponent = { ...newComponent, className: 'grid grid-cols-1 md:grid-cols-2 gap-4', width: '600px', height: 'auto', children: [] };
        break;
      case 'container':
        newComponent = { ...newComponent, className: 'p-4', width: '400px', height: 'auto', children: [] };
        break;
      case 'divider':
        newComponent = { ...newComponent, className: 'divider', width: '100%', height: 'auto' };
        break;
      case 'spacer':
        newComponent = { ...newComponent, className: 'h-12', width: '100%', height: '48px' };
        break;
      case 'html':
        newComponent = { ...newComponent, content: '<div class="p-4"><h2>Custom HTML</h2></div>', rawHtml: true, width: '600px', height: 'auto' };
        break;
      case 'icon':
        newComponent = { ...newComponent, iconLibrary: 'heroicons', iconName: 'HomeIcon', customSvg: null, size: '24', color: '#000000', className: '', width: 'auto', height: 'auto' };
        break;
      case 'embed':
        newComponent = { ...newComponent, embedCode: '', embedType: 'auto', url: '', className: 'rounded-lg overflow-hidden', width: '600px', height: '400px' };
        break;
      case 'form-container':
        newComponent = { ...newComponent, action: '', method: 'POST', className: 'space-y-4', width: '600px', height: 'auto', children: [], successMessage: 'Form submitted successfully!', errorMessage: 'Failed to submit form' };
        break;
      case 'form-input':
        newComponent = { ...newComponent, label: 'Input Field', placeholder: 'Enter text...', name: 'field', inputType: 'text', required: false, className: 'input input-bordered w-full', width: '400px', height: 'auto' };
        break;
      case 'form-textarea':
        newComponent = { ...newComponent, label: 'Message', placeholder: 'Enter your message...', name: 'message', required: false, rows: 4, className: 'textarea textarea-bordered w-full', width: '400px', height: 'auto' };
        break;
      case 'form-select':
        newComponent = { ...newComponent, label: 'Select Option', name: 'select', required: false, options: ['Option 1', 'Option 2', 'Option 3'], className: 'select select-bordered w-full', width: '400px', height: 'auto' };
        break;
      case 'form-checkbox':
        newComponent = { ...newComponent, label: 'I agree', name: 'checkbox', required: false, className: 'checkbox', width: 'auto', height: 'auto' };
        break;
      case 'form-radio-group':
        newComponent = { ...newComponent, label: 'Choose One', name: 'radio', required: false, options: ['Option 1', 'Option 2'], className: '', width: '400px', height: 'auto' };
        break;
      case 'form-file':
        newComponent = { ...newComponent, label: 'Upload File', name: 'file', required: false, accept: '*', className: 'file-input file-input-bordered w-full', width: '400px', height: 'auto' };
        break;
      case 'form-date':
        newComponent = { ...newComponent, label: 'Select Date', name: 'date', required: false, className: 'input input-bordered w-full', width: '400px', height: 'auto' };
        break;
      case 'form-submit':
        newComponent = { ...newComponent, content: 'Submit', className: 'btn btn-primary', width: 'auto', height: 'auto' };
        break;
      default:
        newComponent = { ...newComponent, content: '', className: '', width: '100px', height: 'auto' };
    }

    // Add children property for container types
    if (['columns', 'container', 'form-container'].includes(type) && !newComponent.children) {
      newComponent.children = [];
    }
    
    if (parentId) {
      // Add as child to parent container
      setComponents(components.map(c => {
        if (c.id === parentId && (c.type === 'columns' || c.type === 'container' || c.type === 'form-container')) {
          return { ...c, children: [...(c.children || []), newComponent] };
        }
        return c;
      }));
      // Auto-resize parent container
      setTimeout(() => recalcContainerSize(parentId), 0);
    } else {
      // Add to root
      setComponents([...components, newComponent]);
    }
    setSelectedId(newComponent.id);
  };

  // Update component (supports nested)
  const updateComponent = (id, updates) => {
    const updateNested = (items) => {
      return items.map(c => {
        if (c.id === id) {
          return { ...c, ...updates };
        }
        if (c.children) {
          return { ...c, children: updateNested(c.children) };
        }
        return c;
      });
    };
    setComponents(updateNested(components));
  };

  // Helper to update component styles
  const updateComponentStyle = (property, value) => {
    if (!selectedId) return;
    const component = findComponent(selectedId);
    if (!component) return;
    updateComponent(selectedId, {
      styles: { ...(component.styles || {}), [property]: value }
    });
  };

  // Helper to parse px values
  const parsePx = (value) => {
    if (typeof value === 'string' && value.endsWith('px')) {
      return parseFloat(value) || 0;
    }
    if (typeof value === 'number') return value;
    return 0;
  };

  // Auto-resize container to fit children
  const recalcContainerSize = (parentId) => {
    const parent = findComponent(parentId);
    if (!parent || !parent.children || parent.children.length === 0) return;

    const children = parent.children;
    const padding = 16;

    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    children.forEach(child => {
      const x = child.position?.x || 0;
      const y = child.position?.y || 0;
      const w = parsePx(child.width) || 0;
      const h = parsePx(child.height) || 0;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });

    // If no valid bounds, set defaults
    if (!isFinite(minX)) return;

    // Normalize children positions if any are negative
    if (minX < 0 || minY < 0) {
      const offsetX = Math.max(0, -minX + padding);
      const offsetY = Math.max(0, -minY + padding);
      
      children.forEach(child => {
        updateComponent(child.id, {
          position: {
            x: (child.position?.x || 0) + offsetX,
            y: (child.position?.y || 0) + offsetY
          }
        });
      });

      maxX += offsetX;
      maxY += offsetY;
    }

    // Calculate new container size
    const newWidth = Math.max(200, Math.ceil(maxX - minX) + padding * 2);
    const newHeight = Math.max(100, Math.ceil(maxY - minY) + padding * 2);

    updateComponent(parentId, {
      width: `${newWidth}px`,
      height: `${newHeight}px`
    });
  };

  // Generate inline styles from visual controls
  const generateInlineStyles = (component) => {
    const styles = {};
    
    if (component.styles) {
      if (component.styles.backgroundColor) styles.backgroundColor = component.styles.backgroundColor;
      if (component.styles.color) styles.color = component.styles.color;
      if (component.styles.fontSize) styles.fontSize = component.styles.fontSize;
      if (component.styles.fontWeight) styles.fontWeight = component.styles.fontWeight;
      if (component.styles.fontFamily) styles.fontFamily = component.styles.fontFamily;
      if (component.styles.lineHeight) styles.lineHeight = component.styles.lineHeight;
      if (component.styles.letterSpacing) styles.letterSpacing = component.styles.letterSpacing;
      if (component.styles.borderWidth) styles.borderWidth = component.styles.borderWidth;
      if (component.styles.borderStyle) styles.borderStyle = component.styles.borderStyle;
      if (component.styles.borderColor) styles.borderColor = component.styles.borderColor;
      if (component.styles.borderRadius) styles.borderRadius = component.styles.borderRadius;
      if (component.styles.boxShadow) styles.boxShadow = component.styles.boxShadow;
      if (component.styles.display) styles.display = component.styles.display;
      if (component.styles.flexDirection) styles.flexDirection = component.styles.flexDirection;
      if (component.styles.justifyContent) styles.justifyContent = component.styles.justifyContent;
      if (component.styles.alignItems) styles.alignItems = component.styles.alignItems;
      if (component.styles.gap) styles.gap = component.styles.gap;
      if (component.styles.gridTemplateColumns) styles.gridTemplateColumns = component.styles.gridTemplateColumns;
      
      // Handle spacing (padding/margin)
      if (component.styles.padding) {
        if (component.styles.padding.all) {
          styles.padding = component.styles.padding.all;
        } else {
          if (component.styles.padding.top) styles.paddingTop = component.styles.padding.top;
          if (component.styles.padding.right) styles.paddingRight = component.styles.padding.right;
          if (component.styles.padding.bottom) styles.paddingBottom = component.styles.padding.bottom;
          if (component.styles.padding.left) styles.paddingLeft = component.styles.padding.left;
        }
      }
      
      if (component.styles.margin) {
        if (component.styles.margin.all) {
          styles.margin = component.styles.margin.all;
        } else {
          if (component.styles.margin.top) styles.marginTop = component.styles.margin.top;
          if (component.styles.margin.right) styles.marginRight = component.styles.margin.right;
          if (component.styles.margin.bottom) styles.marginBottom = component.styles.margin.bottom;
          if (component.styles.margin.left) styles.marginLeft = component.styles.margin.left;
        }
      }
    }
    
    return styles;
  };

  // Delete component (supports nested)
  const deleteComponent = (id) => {
    const deleteNested = (items) => {
      return items.filter(c => c.id !== id).map(c => {
        if (c.children) {
          return { ...c, children: deleteNested(c.children) };
        }
        return c;
      });
    };
    setComponents(deleteNested(components));
    setSelectedId(null);
  };

  // Find component by ID (supports nested)
  const findComponent = (id, items = components) => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findComponent(id, item.children);
        if (found) return found;
      }
    }
    return null;
  };

  // Duplicate component
  const duplicateComponent = (id) => {
    const component = components.find(c => c.id === id);
    if (component) {
      const newComponent = { ...component, id: Date.now().toString() };
      const index = components.findIndex(c => c.id === id);
      const newComponents = [...components];
      newComponents.splice(index + 1, 0, newComponent);
      setComponents(newComponents);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newComponents = [...components];
    const draggedItem = newComponents[draggedIndex];
    newComponents.splice(draggedIndex, 1);
    newComponents.splice(index, 0, draggedItem);
    
    setComponents(newComponents);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Move component up/down
  const moveUp = (index) => {
    if (index === 0) return;
    const newComponents = [...components];
    [newComponents[index - 1], newComponents[index]] = [newComponents[index], newComponents[index - 1]];
    setComponents(newComponents);
  };

  const moveDown = (index) => {
    if (index === components.length - 1) return;
    const newComponents = [...components];
    [newComponents[index], newComponents[index + 1]] = [newComponents[index + 1], newComponents[index]];
    setComponents(newComponents);
  };

  // Context menu handlers
  const handleContextMenu = (e, componentId) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      targetId: componentId
    });
    setSelectedId(componentId);
  };

  const handleBringToFront = () => {
    if (!contextMenu.targetId) return;
    const component = findComponent(contextMenu.targetId);
    if (!component) return;
    // Move to end of array (renders last = on top)
    setComponents(prev => [...prev.filter(c => c.id !== contextMenu.targetId), component]);
  };

  const handleSendToBack = () => {
    if (!contextMenu.targetId) return;
    const component = findComponent(contextMenu.targetId);
    if (!component) return;
    // Move to start of array (renders first = on bottom)
    setComponents(prev => [component, ...prev.filter(c => c.id !== contextMenu.targetId)]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const selectedComponent = selectedId ? findComponent(selectedId) : null;

  // Recursive component renderer
  const renderComponent = (component, index, parentComponents) => {
    const isContainer = component.type === 'columns' || component.type === 'container' || component.type === 'form-container';
    const hasChildren = component.children && component.children.length > 0;
    const position = component.position || { x: 0, y: 0 };
    const inlineStyles = generateInlineStyles(component);

    return (
      <div
        key={component.id}
        onClick={(e) => { e.stopPropagation(); setSelectedId(component.id); }}
        onContextMenu={(e) => handleContextMenu(e, component.id)}
        className={`absolute group cursor-move border-2 transition-all ${
          selectedId === component.id
            ? 'border-primary bg-primary/5'
            : isContainer 
              ? 'border-base-300/40 hover:border-gray-300'
              : 'border-transparent hover:border-gray-300'
        } ${isContainer ? 'p-2' : ''} ${draggingId === component.id ? 'opacity-70' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: component.width !== 'auto' ? component.width : undefined,
          height: component.height !== 'auto' && component.height ? component.height : undefined,
          minWidth: component.type === 'text' ? '200px' : undefined,
          ...inlineStyles,
        }}
        onMouseDown={(e) => {
          // Allow drag from anywhere except interactive elements and resize handles
          const isInteractive = e.target.closest('input, textarea, select, button, a, [contenteditable="true"], .no-drag');
          const isResizeHandle = e.target.classList.contains('cursor-nw-resize') || 
                                 e.target.classList.contains('cursor-ne-resize') ||
                                 e.target.classList.contains('cursor-sw-resize') ||
                                 e.target.classList.contains('cursor-se-resize') ||
                                 e.target.classList.contains('cursor-s-resize') ||
                                 e.target.classList.contains('cursor-e-resize');
          
          if (!isInteractive && !isResizeHandle) {
            e.stopPropagation();
            // Auto-select on drag start
            if (selectedId !== component.id) {
              setSelectedId(component.id);
            }
            setDraggingId(component.id);
            setDragStart({
              x: e.clientX,
              y: e.clientY,
              componentX: position.x,
              componentY: position.y,
            });
          }
        }}
      >
        {/* Drag Handle - Visible when selected */}
        {selectedId === component.id && (
          <div 
            className="drag-handle absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-6 bg-primary rounded cursor-move flex items-center justify-center z-20"
            title="Drag to move"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </div>
        )}

        {/* Resize Handles - Visible when selected */}
        {selectedId === component.id && (
          <>
            {/* Top-left corner */}
            <div
              className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize z-20 hover:scale-125 transition-transform"
              onMouseDown={(e) => {
                e.stopPropagation();
                setResizingId(component.id);
                const rect = e.currentTarget.parentElement.getBoundingClientRect();
                setResizeStart({
                  width: rect.width,
                  height: rect.height,
                  x: e.clientX,
                  y: e.clientY,
                  corner: 'nw',
                  componentX: position.x,
                  componentY: position.y,
                });
              }}
              title="Resize from top-left"
            />
            {/* Top-right corner */}
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize z-20 hover:scale-125 transition-transform"
              onMouseDown={(e) => {
                e.stopPropagation();
                setResizingId(component.id);
                const rect = e.currentTarget.parentElement.getBoundingClientRect();
                setResizeStart({
                  width: rect.width,
                  height: rect.height,
                  x: e.clientX,
                  y: e.clientY,
                  corner: 'ne',
                  componentX: position.x,
                  componentY: position.y,
                });
              }}
              title="Resize from top-right"
            />
            {/* Bottom-left corner */}
            <div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize z-20 hover:scale-125 transition-transform"
              onMouseDown={(e) => {
                e.stopPropagation();
                setResizingId(component.id);
                const rect = e.currentTarget.parentElement.getBoundingClientRect();
                setResizeStart({
                  width: rect.width,
                  height: rect.height,
                  x: e.clientX,
                  y: e.clientY,
                  corner: 'sw',
                  componentX: position.x,
                  componentY: position.y,
                });
              }}
              title="Resize from bottom-left"
            />
            {/* Bottom-right corner */}
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize z-20 hover:scale-125 transition-transform"
              onMouseDown={(e) => {
                e.stopPropagation();
                setResizingId(component.id);
                const rect = e.currentTarget.parentElement.getBoundingClientRect();
                setResizeStart({
                  width: rect.width,
                  height: rect.height,
                  x: e.clientX,
                  y: e.clientY,
                  corner: 'se',
                  componentX: position.x,
                  componentY: position.y,
                });
              }}
              title="Resize from bottom-right"
            />
          </>
        )}

        {/* Component Toolbar */}
        <div className={`absolute -top-10 right-0 gap-1 bg-base-200 p-1 rounded shadow-lg z-10 ${
          selectedId === component.id ? 'flex' : 'hidden group-hover:flex'
        }`}>
          {isContainer && (
            <div className="relative">
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setShowAddMenu(showAddMenu === component.id ? null : component.id);
                }}
                className="btn btn-xs btn-info"
                title="Add child component"
              >
                ➕
              </button>
              {showAddMenu === component.id && (
                <div className="absolute top-full right-0 mt-1 bg-base-100 border border-base-300 rounded shadow-lg p-2 z-50 w-48 max-h-64 overflow-y-auto">
                  <div className="text-xs font-bold text-gray-500 mb-1">ADD COMPONENT:</div>
                  <button onClick={(e) => { e.stopPropagation(); addComponent('heading', component.id); setShowAddMenu(null); }} className="btn btn-xs btn-block justify-start mb-1">📝 Heading</button>
                  <button onClick={(e) => { e.stopPropagation(); addComponent('text', component.id); setShowAddMenu(null); }} className="btn btn-xs btn-block justify-start mb-1">📄 Text</button>
                  <button onClick={(e) => { e.stopPropagation(); addComponent('button', component.id); setShowAddMenu(null); }} className="btn btn-xs btn-block justify-start mb-1">🔘 Button</button>
                  <button onClick={(e) => { e.stopPropagation(); addComponent('image', component.id); setShowAddMenu(null); }} className="btn btn-xs btn-block justify-start mb-1">🖼️ Image</button>
                  {component.type === 'form-container' && (
                    <>
                      <div className="divider my-1"></div>
                      <div className="text-xs font-bold text-gray-500 mb-1">FORM FIELDS:</div>
                      <button onClick={(e) => { e.stopPropagation(); addComponent('form-input', component.id); setShowAddMenu(null); }} className="btn btn-xs btn-block justify-start mb-1">📝 Input</button>
                      <button onClick={(e) => { e.stopPropagation(); addComponent('form-textarea', component.id); setShowAddMenu(null); }} className="btn btn-xs btn-block justify-start mb-1">📄 Textarea</button>
                      <button onClick={(e) => { e.stopPropagation(); addComponent('form-select', component.id); setShowAddMenu(null); }} className="btn btn-xs btn-block justify-start mb-1">📑 Select</button>
                      <button onClick={(e) => { e.stopPropagation(); addComponent('form-checkbox', component.id); setShowAddMenu(null); }} className="btn btn-xs btn-block justify-start mb-1">☑️ Checkbox</button>
                      <button onClick={(e) => { e.stopPropagation(); addComponent('form-radio-group', component.id); setShowAddMenu(null); }} className="btn btn-xs btn-block justify-start mb-1">🔘 Radio</button>
                      <button onClick={(e) => { e.stopPropagation(); addComponent('form-file', component.id); setShowAddMenu(null); }} className="btn btn-xs btn-block justify-start mb-1">📎 File</button>
                      <button onClick={(e) => { e.stopPropagation(); addComponent('form-date', component.id); setShowAddMenu(null); }} className="btn btn-xs btn-block justify-start mb-1">📅 Date</button>
                      <button onClick={(e) => { e.stopPropagation(); addComponent('form-submit', component.id); setShowAddMenu(null); }} className="btn btn-xs btn-block justify-start mb-1">✅ Submit</button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          {(component.type === 'heading' || component.type === 'text' || component.type === 'button') && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditingId(component.id); }}
              className="btn btn-xs btn-info"
              title="Edit text (or double-click)"
            >
              ✏️
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); duplicateComponent(component.id); }}
            className="btn btn-xs"
            title="Duplicate"
          >
            📋
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); deleteComponent(component.id); }}
            className="btn btn-xs btn-error"
            title="Delete"
          >
            🗑️
          </button>
        </div>

        {/* Render Component Content */}
        {component.type === 'heading' && (
          editingId === component.id ? (
            <input
              type="text"
              className={`${component.className} w-full border-2 border-primary bg-white px-2`}
              value={component.content}
              onChange={(e) => updateComponent(component.id, { content: e.target.value })}
              onBlur={() => setEditingId(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setEditingId(null);
                if (e.key === 'Escape') setEditingId(null);
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h2 
              className={component.className}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingId(component.id);
              }}
            >
              {component.content}
            </h2>
          )
        )}
        {component.type === 'text' && (
          <div className="relative">
            {editingId === component.id ? (
              <textarea
                className={`${component.className} w-full min-h-[100px] border-2 border-primary bg-white p-2`}
                value={component.content}
                onChange={(e) => updateComponent(component.id, { content: e.target.value })}
                onBlur={() => setEditingId(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setEditingId(null);
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div 
                className={component.className}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingId(component.id);
                }}
              >
                <ReactMarkdown className="prose prose-sm max-w-none">
                  {component.content}
                </ReactMarkdown>
              </div>
            )}
            
            {/* Width resize handle for text */}
            {selectedId === component.id && !editingId && (
              <div
                className="absolute top-1/2 -right-2 w-4 h-8 bg-primary rounded cursor-e-resize border-2 border-white shadow-lg z-20 -translate-y-1/2"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const parent = e.target.parentElement.parentElement;
                  const rect = parent.getBoundingClientRect();
                  setResizingId(component.id);
                  setResizeStart({
                    width: rect.width,
                    height: rect.height,
                    x: e.clientX,
                    y: e.clientY,
                    aspectRatio: false,
                  });
                }}
                title="Drag to resize width"
              />
            )}
          </div>
        )}
        {component.type === 'button' && (
          editingId === component.id ? (
            <input
              type="text"
              className="input input-bordered input-sm"
              value={component.content}
              onChange={(e) => updateComponent(component.id, { content: e.target.value })}
              onBlur={() => setEditingId(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setEditingId(null);
                if (e.key === 'Escape') setEditingId(null);
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <a 
              href={component.href} 
              className={component.className}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingId(component.id);
              }}
              onClick={(e) => e.preventDefault()}
            >
              {component.content}
            </a>
          )
        )}
        {component.type === 'image' && (
          <div className="relative inline-block">
            <img 
              src={component.content} 
              alt="" 
              className={component.className}
              style={{
                width: component.width !== 'auto' ? component.width : undefined,
                height: component.height !== 'auto' ? component.height : undefined,
                display: 'block',
              }}
              draggable={false}
            />
            
            {/* Resize Handles - Only show when selected */}
            {selectedId === component.id && (
              <>
                {/* Corner Resize Handles */}
                <div
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full cursor-se-resize border-2 border-white shadow-lg z-20"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const img = e.target.previousSibling;
                    const rect = img.getBoundingClientRect();
                    setResizingId(component.id);
                    setResizeStart({
                      width: rect.width,
                      height: rect.height,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  title="Drag to resize"
                />
                
                {/* Width Handle (right middle) */}
                <div
                  className="absolute top-1/2 -right-2 w-4 h-4 bg-primary rounded-full cursor-e-resize border-2 border-white shadow-lg z-20 -translate-y-1/2"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const img = e.target.parentElement.querySelector('img');
                    const rect = img.getBoundingClientRect();
                    setResizingId(component.id);
                    setResizeStart({
                      width: rect.width,
                      height: rect.height,
                      x: e.clientX,
                      y: e.clientY,
                      aspectRatio: false,
                    });
                  }}
                  title="Drag to resize width"
                />
                
                {/* Height Handle (bottom middle) */}
                <div
                  className="absolute -bottom-2 left-1/2 w-4 h-4 bg-primary rounded-full cursor-s-resize border-2 border-white shadow-lg z-20 -translate-x-1/2"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const img = e.target.parentElement.querySelector('img');
                    const rect = img.getBoundingClientRect();
                    setResizingId(component.id);
                    setResizeStart({
                      width: rect.width,
                      height: rect.height,
                      x: e.clientX,
                      y: e.clientY,
                      aspectRatio: false,
                    });
                  }}
                  title="Drag to resize height"
                />
              </>
            )}
          </div>
        )}
        {component.type === 'divider' && (
          <div className={component.className}></div>
        )}
        {component.type === 'spacer' && (
          <div className={component.className}></div>
        )}
        {component.type === 'html' && (
          <div 
            className="html-block" 
            dangerouslySetInnerHTML={{ __html: component.content }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {component.type === 'icon' && (
          <div className="inline-flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {component.iconLibrary === 'custom' ? (
              <div dangerouslySetInnerHTML={{ __html: component.customSvg }} />
            ) : (
              <DynamicIcon 
                library={component.iconLibrary}
                name={component.iconName}
                size={component.size}
                color={component.color}
                className={component.className}
              />
            )}
          </div>
        )}
        {component.type === 'embed' && (
          <div 
            className="embed-container"
            dangerouslySetInnerHTML={{ __html: component.embedCode }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {component.type === 'form-container' && (
          <form 
            className={component.className} 
            onSubmit={(e) => e.preventDefault()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.add('ring-2', 'ring-primary');
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('ring-2', 'ring-primary');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove('ring-2', 'ring-primary');
              const componentType = e.dataTransfer.getData('componentType');
              if (componentType) {
                addComponent(componentType, component.id);
              }
            }}
          >
            {hasChildren ? (
              component.children.map((child, idx) => renderComponent(child, idx, component.children))
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
                <p className="text-sm">Click ➕ to add form fields or drag components here</p>
              </div>
            )}
          </form>
        )}
        {component.type === 'form-input' && (
          <div className="form-control mb-4" onClick={(e) => e.stopPropagation()}>
            <label className="label">
              <span className="label-text">{component.label}</span>
              {component.required && <span className="text-error">*</span>}
            </label>
            <input
              type={component.inputType || 'text'}
              name={component.name}
              placeholder={component.placeholder}
              required={component.required}
              className={component.className}
              disabled
            />
          </div>
        )}
        {component.type === 'form-textarea' && (
          <div className="form-control mb-4" onClick={(e) => e.stopPropagation()}>
            <label className="label">
              <span className="label-text">{component.label}</span>
              {component.required && <span className="text-error">*</span>}
            </label>
            <textarea
              name={component.name}
              placeholder={component.placeholder}
              required={component.required}
              rows={component.rows || 4}
              className={component.className}
              disabled
            />
          </div>
        )}
        {component.type === 'form-select' && (
          <div className="form-control mb-4" onClick={(e) => e.stopPropagation()}>
            <label className="label">
              <span className="label-text">{component.label}</span>
              {component.required && <span className="text-error">*</span>}
            </label>
            <select
              name={component.name}
              required={component.required}
              className={component.className}
              disabled
            >
              <option value="">Select...</option>
              {component.options?.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
        {component.type === 'form-checkbox' && (
          <div className="form-control mb-4" onClick={(e) => e.stopPropagation()}>
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                name={component.name}
                required={component.required}
                className={component.className}
                disabled
              />
              <span className="label-text">{component.label}</span>
            </label>
          </div>
        )}
        {component.type === 'form-radio-group' && (
          <div className="form-control mb-4" onClick={(e) => e.stopPropagation()}>
            <label className="label">
              <span className="label-text">{component.label}</span>
              {component.required && <span className="text-error">*</span>}
            </label>
            {component.options?.map((opt, idx) => (
              <label key={idx} className="label cursor-pointer justify-start gap-2">
                <input
                  type="radio"
                  name={component.name}
                  value={opt}
                  className="radio"
                  disabled
                />
                <span className="label-text">{opt}</span>
              </label>
            ))}
          </div>
        )}
        {component.type === 'form-file' && (
          <div className="form-control mb-4" onClick={(e) => e.stopPropagation()}>
            <label className="label">
              <span className="label-text">{component.label}</span>
              {component.required && <span className="text-error">*</span>}
            </label>
            <input
              type="file"
              name={component.name}
              accept={component.accept}
              required={component.required}
              className={component.className}
              disabled
            />
          </div>
        )}
        {component.type === 'form-date' && (
          <div className="form-control mb-4" onClick={(e) => e.stopPropagation()}>
            <label className="label">
              <span className="label-text">{component.label}</span>
              {component.required && <span className="text-error">*</span>}
            </label>
            <input
              type="date"
              name={component.name}
              required={component.required}
              className={component.className}
              disabled
            />
          </div>
        )}
        {component.type === 'form-submit' && (
          <button 
            type="submit" 
            className={component.className}
            disabled
            onClick={(e) => e.stopPropagation()}
          >
            {component.content}
          </button>
        )}
        {component.type === 'columns' && (
          <div 
            className={component.className}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.add('ring-2', 'ring-primary');
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('ring-2', 'ring-primary');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove('ring-2', 'ring-primary');
              const componentType = e.dataTransfer.getData('componentType');
              if (componentType) {
                addComponent(componentType, component.id);
              }
            }}
          >
            {hasChildren ? (
              component.children.map((child, idx) => renderComponent(child, idx, component.children))
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
                <p className="text-sm">Click ➕ to add content or drag components here</p>
              </div>
            )}
          </div>
        )}
        {component.type === 'container' && (
          <div 
            className={component.className}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.add('ring-2', 'ring-primary');
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('ring-2', 'ring-primary');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove('ring-2', 'ring-primary');
              const componentType = e.dataTransfer.getData('componentType');
              if (componentType) {
                addComponent(componentType, component.id);
              }
            }}
          >
            {hasChildren ? (
              component.children.map((child, idx) => renderComponent(child, idx, component.children))
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
                <p className="text-sm">Click ➕ to add content or drag components here</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-base-100">
      {/* Header */}
      <div className="border-b border-base-300 px-6 py-4 flex items-center justify-between bg-base-200">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="btn btn-sm btn-ghost">
            ← Back
          </button>
          <div>
            <h1 className="text-xl font-bold">{page?.name || 'Page Builder'}</h1>
            <p className="text-xs text-gray-500">/{page?.slug}</p>
          </div>
        </div>
        
        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Device Selector */}
          <select 
            value={device} 
            onChange={(e) => setDevice(e.target.value)}
            className="select select-sm select-bordered"
          >
            {Object.keys(devicePresets).map(d => (
              <option key={d} value={d}>{d} ({devicePresets[d]}px)</option>
            ))}
          </select>
          
          {/* Zoom Control */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="btn btn-xs"
              title="Zoom Out"
            >
              −
            </button>
            <span className="text-xs px-2">{zoom}%</span>
            <button 
              onClick={() => setZoom(Math.min(150, zoom + 10))}
              className="btn btn-xs"
              title="Zoom In"
            >
              +
            </button>
          </div>
          
          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`btn btn-sm ${showGrid ? 'btn-primary' : 'btn-ghost'}`}
            title="Toggle 12-Column Grid"
          >
            {showGrid ? '🔲' : '⬜'}
          </button>

          {/* Full Width Toggle */}
          <button
            onClick={() => setFullWidth(!fullWidth)}
            className={`btn btn-sm ${fullWidth ? 'btn-primary' : 'btn-ghost'}`}
            title="Toggle Full Width"
          >
            {fullWidth ? '⬅️➡️' : '↔️'}
          </button>
          
          {/* Save Button */}
          <button
            onClick={handleSave}
            className="btn btn-primary btn-sm"
            disabled={saving}
          >
            {saving ? '💾 Saving...' : '💾 Save Page'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Component Palette */}
        {!fullWidth && (
        <div className="w-64 bg-base-100 border-r border-base-300 p-4 overflow-y-auto">
          <h3 className="text-lg font-bold mb-4">📦 Components</h3>
          
          <div className="mb-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Layout</h4>
            <div className="space-y-2">
              <button
                onClick={() => addComponent('columns')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'columns')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                ⚏ 2 Columns
              </button>
              <button
                onClick={() => addComponent('container')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'container')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                📦 Container
              </button>
            </div>
          </div>

          <div className="divider my-2"></div>

          <div className="mb-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Content</h4>
            <div className="space-y-2">
              <button
                onClick={() => addComponent('heading')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'heading')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                📝 Heading
              </button>
              <button
                onClick={() => addComponent('text')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'text')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
              📄 Text
            </button>
            <button
              onClick={() => addComponent('button')}
              draggable="true"
              onDragStart={(e) => e.dataTransfer.setData('componentType', 'button')}
              className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
            >
              🔘 Button
            </button>
            <button
              onClick={() => addComponent('image')}
              draggable="true"
              onDragStart={(e) => e.dataTransfer.setData('componentType', 'image')}
              className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
            >
              🖼️ Image
            </button>
            </div>
          </div>

          <div className="divider my-2"></div>

          <div className="mb-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Spacing</h4>
            <div className="space-y-2">
              <button
                onClick={() => addComponent('divider')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'divider')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                ➖ Divider
              </button>
              <button
                onClick={() => addComponent('spacer')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'spacer')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                ⬜ Spacer
              </button>
            </div>
          </div>

          <div className="divider my-2"></div>

          <div className="mb-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Advanced</h4>
            <div className="space-y-2">
              <button
                onClick={() => addComponent('html')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'html')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                🔧 HTML Block
              </button>
              <button
                onClick={() => addComponent('icon')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'icon')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                ⭐ Icon
              </button>
              <button
                onClick={() => addComponent('embed')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'embed')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                📺 Embed
              </button>
            </div>
          </div>

          <div className="divider my-2"></div>

          <div className="mb-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Forms</h4>
            <div className="space-y-2">
              <button
                onClick={() => addComponent('form-container')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'form-container')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                📋 Form
              </button>
              <button
                onClick={() => addComponent('form-input')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'form-input')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                📝 Input Field
              </button>
              <button
                onClick={() => addComponent('form-textarea')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'form-textarea')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                📄 Text Area
              </button>
              <button
                onClick={() => addComponent('form-select')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'form-select')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                📑 Dropdown
              </button>
              <button
                onClick={() => addComponent('form-checkbox')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'form-checkbox')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                ☑️ Checkbox
              </button>
              <button
                onClick={() => addComponent('form-radio-group')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'form-radio-group')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                🔘 Radio Group
              </button>
              <button
                onClick={() => addComponent('form-file')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'form-file')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                📎 File Upload
              </button>
              <button
                onClick={() => addComponent('form-date')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'form-date')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                📅 Date Picker
              </button>
              <button
                onClick={() => addComponent('form-submit')}
                draggable="true"
                onDragStart={(e) => e.dataTransfer.setData('componentType', 'form-submit')}
                className="btn btn-sm btn-block justify-start cursor-grab active:cursor-grabbing"
              >
                ✅ Submit Button
              </button>
            </div>
          </div>
          
          <div className="divider my-4"></div>
          <div className="alert alert-info text-xs space-y-1">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-xs">
                <p className="font-semibold mb-1">💡 Tips:</p>
                <p>• Double-click text to edit</p>
                <p>• Drag components from sidebar to canvas or containers</p>
                <p>• Drag elements to position (auto-snaps to grid & elements)</p>
                <p>• Click ➕ on containers to add nested components</p>
                <p>• Hold <kbd className="kbd kbd-xs">Alt</kbd> while dragging to disable snapping</p>
                <p>• <kbd className="kbd kbd-xs">Enter</kbd> to edit / <kbd className="kbd kbd-xs">Delete</kbd> to remove</p>
                <p>• <kbd className="kbd kbd-xs">Esc</kbd> to deselect</p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Center - Canvas */}
        <div className="flex-1 overflow-auto bg-gray-50 p-8">
          <div 
            className="mx-auto bg-white shadow-xl rounded-lg min-h-[800px] relative"
            style={{ 
              width: fullWidth ? '100%' : `${devicePresets[device]}px`,
              maxWidth: fullWidth ? 'none' : undefined,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center', 
              minHeight: '800px',
              backgroundImage: `
                repeating-linear-gradient(0deg, #edf2f7 0, #edf2f7 1px, transparent 1px, transparent 20px),
                repeating-linear-gradient(90deg, #edf2f7 0, #edf2f7 1px, transparent 1px, transparent 20px),
                repeating-linear-gradient(0deg, #cbd5e0 0, #cbd5e0 1px, transparent 1px, transparent 100px),
                repeating-linear-gradient(90deg, #cbd5e0 0, #cbd5e0 1px, transparent 1px, transparent 100px)
              `,
              backgroundSize: '20px 20px, 20px 20px, 100px 100px, 100px 100px'
            }}
            onClick={() => setSelectedId(null)}
          >
            {/* 12-Column Bootstrap Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none z-0" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 0 }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-full border-r border-blue-200/30"
                    style={{ backgroundColor: i % 2 === 0 ? 'rgba(59, 130, 246, 0.02)' : 'rgba(59, 130, 246, 0.01)' }}
                  />
                ))}
              </div>
            )}

            {components.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                <div className="text-center">
                  <p className="text-xl mb-2">👈 Click a component to add it</p>
                  <p className="text-sm">Drag components to position them anywhere!</p>
                </div>
              </div>
            ) : null}
            
            {/* Alignment guide lines */}
            {activeGuides.x !== null && (
              <div 
                className="absolute top-0 bottom-0 w-px bg-primary/60 pointer-events-none z-50 transition-opacity"
                style={{ left: `${activeGuides.x}px` }}
              />
            )}
            {activeGuides.y !== null && (
              <div 
                className="absolute left-0 right-0 h-px bg-primary/60 pointer-events-none z-50 transition-opacity"
                style={{ top: `${activeGuides.y}px` }}
              />
            )}
            
            {/* Render all components with absolute positioning */}
            {components.map((component, index) => renderComponent(component, index, components))}
          </div>
        </div>

        {/* Right Sidebar - Properties (collapsible) */}
        {!fullWidth && (
        <div 
          className={`bg-base-100 border-l border-base-300 overflow-hidden transition-[width] duration-300 ease-in-out ${
            selectedComponent ? 'w-80' : 'w-0'
          }`}
        >
          {selectedComponent ? (
            <div className="p-4 overflow-y-auto h-full">
              <h3 className="text-lg font-bold mb-4">⚙️ Properties</h3>
              <div className="mb-2">
                <div className="badge badge-primary">{selectedComponent.type}</div>
              </div>

              {/* Tabbed Interface */}
              <div className="tabs tabs-boxed mb-4">
                <button
                  type="button"
                  className={`tab ${activeTab === 'content' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('content')}
                >
                  Content
                </button>
                <button
                  type="button"
                  className={`tab ${activeTab === 'style' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('style')}
                >
                  Style
                </button>
                <button
                  type="button"
                  className={`tab ${activeTab === 'advanced' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('advanced')}
                >
                  Advanced
                </button>
              </div>

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  {(selectedComponent.type === 'heading' || selectedComponent.type === 'text' || selectedComponent.type === 'button') && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Content</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered"
                      value={selectedComponent.content}
                      onChange={(e) => updateComponent(selectedId, { content: e.target.value })}
                      rows={selectedComponent.type === 'text' ? 6 : 3}
                    />
                    {selectedComponent.type === 'text' && (
                      <label className="label">
                        <span className="label-text-alt">✨ Markdown supported: **bold**, *italic*, [link](url), etc.</span>
                      </label>
                    )}
                  </div>
                )}

                {selectedComponent.type === 'button' && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Link URL</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={selectedComponent.href || ''}
                      onChange={(e) => updateComponent(selectedId, { href: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                {selectedComponent.type === 'image' && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Image URL</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={selectedComponent.content}
                      onChange={(e) => updateComponent(selectedId, { content: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Width</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={selectedComponent.width || 'auto'}
                        onChange={(e) => updateComponent(selectedId, { width: e.target.value })}
                        placeholder="auto, 100px, 50%"
                      />
                      <label className="label">
                        <span className="label-text-alt">Drag handles to resize</span>
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Height</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={selectedComponent.height || 'auto'}
                        onChange={(e) => updateComponent(selectedId, { height: e.target.value })}
                        placeholder="auto, 100px, 50%"
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Alignment</span>
                    </label>
                    <div className="btn-group w-full">
                      <button
                        className={`btn btn-sm flex-1 ${selectedComponent.className?.includes('float-left') ? 'btn-primary' : ''}`}
                        onClick={() => {
                          const classes = selectedComponent.className?.replace(/float-(left|right)|mx-auto/g, '').trim() || '';
                          updateComponent(selectedId, { className: `${classes} float-left mr-4`.trim() });
                        }}
                        title="Float left"
                      >
                        ⬅️
                      </button>
                      <button
                        className={`btn btn-sm flex-1 ${selectedComponent.className?.includes('mx-auto') ? 'btn-primary' : ''}`}
                        onClick={() => {
                          const classes = selectedComponent.className?.replace(/float-(left|right)|mx-auto/g, '').trim() || '';
                          updateComponent(selectedId, { className: `${classes} mx-auto block`.trim() });
                        }}
                        title="Center"
                      >
                        ↔️
                      </button>
                      <button
                        className={`btn btn-sm flex-1 ${selectedComponent.className?.includes('float-right') ? 'btn-primary' : ''}`}
                        onClick={() => {
                          const classes = selectedComponent.className?.replace(/float-(left|right)|mx-auto/g, '').trim() || '';
                          updateComponent(selectedId, { className: `${classes} float-right ml-4`.trim() });
                        }}
                        title="Float right"
                      >
                        ➡️
                      </button>
                    </div>
                    <label className="label">
                      <span className="label-text-alt">Position image in layout</span>
                    </label>
                  </div>
                </>
              )}

                  {/* HTML Block */}
                  {selectedComponent.type === 'html' && (
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">HTML Code</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered font-mono text-xs"
                        rows={12}
                        value={selectedComponent.content}
                        onChange={(e) => updateComponent(selectedId, { content: e.target.value })}
                        placeholder="<div>Your HTML here</div>"
                      />
                      <label className="label">
                        <span className="label-text-alt">⚠️ Be careful with custom HTML</span>
                      </label>
                    </div>
                  )}

                  {/* Icon */}
                  {selectedComponent.type === 'icon' && (
                    <>
                      <IconPicker
                        value={selectedComponent}
                        onChange={(newProps) => updateComponent(selectedId, newProps)}
                      />
                      <div className="form-control mt-4">
                        <label className="label">
                          <span className="label-text font-semibold">Size (px)</span>
                        </label>
                        <input
                          type="number"
                          className="input input-bordered"
                          value={selectedComponent.size || 24}
                          onChange={(e) => updateComponent(selectedId, { size: e.target.value })}
                        />
                      </div>
                      <div className="form-control mt-4">
                        <label className="label">
                          <span className="label-text font-semibold">Color</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={selectedComponent.color || '#000000'}
                          onChange={(e) => updateComponent(selectedId, { color: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {/* Embed */}
                  {selectedComponent.type === 'embed' && (
                    <EmbedHelper
                      value={selectedComponent}
                      onChange={(newProps) => updateComponent(selectedId, newProps)}
                    />
                  )}

                  {/* Form Container */}
                  {selectedComponent.type === 'form-container' && (
                    <>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Action URL</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={selectedComponent.action || ''}
                          onChange={(e) => updateComponent(selectedId, { action: e.target.value })}
                          placeholder="/api/forms/submit"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Method</span>
                        </label>
                        <select
                          className="select select-bordered"
                          value={selectedComponent.method || 'POST'}
                          onChange={(e) => updateComponent(selectedId, { method: e.target.value })}
                        >
                          <option value="POST">POST</option>
                          <option value="GET">GET</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Form Input/Select/Textarea/etc */}
                  {(selectedComponent.type === 'form-input' || selectedComponent.type === 'form-textarea' || 
                    selectedComponent.type === 'form-select' || selectedComponent.type === 'form-checkbox' ||
                    selectedComponent.type === 'form-radio-group' || selectedComponent.type === 'form-file' ||
                    selectedComponent.type === 'form-date') && (
                    <>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Label</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={selectedComponent.label || ''}
                          onChange={(e) => updateComponent(selectedId, { label: e.target.value })}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Name</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={selectedComponent.name || ''}
                          onChange={(e) => updateComponent(selectedId, { name: e.target.value })}
                        />
                      </div>
                      {(selectedComponent.type === 'form-input' || selectedComponent.type === 'form-textarea') && (
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Placeholder</span>
                          </label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={selectedComponent.placeholder || ''}
                            onChange={(e) => updateComponent(selectedId, { placeholder: e.target.value })}
                          />
                        </div>
                      )}
                      {(selectedComponent.type === 'form-select' || selectedComponent.type === 'form-radio-group') && (
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Options (one per line)</span>
                          </label>
                          <textarea
                            className="textarea textarea-bordered"
                            rows={4}
                            value={(selectedComponent.options || []).join('\n')}
                            onChange={(e) => updateComponent(selectedId, { options: e.target.value.split('\n').filter(o => o.trim()) })}
                          />
                        </div>
                      )}
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">Required</span>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={selectedComponent.required || false}
                            onChange={(e) => updateComponent(selectedId, { required: e.target.checked })}
                          />
                        </label>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Style Tab */}
              {activeTab === 'style' && (
                <div className="space-y-6">
                  <ColorPicker
                    label="Background Color"
                    value={selectedComponent.styles?.backgroundColor}
                    onChange={(color) => updateComponentStyle('backgroundColor', color)}
                    showBrandColors={true}
                  />
                  <ColorPicker
                    label="Text Color"
                    value={selectedComponent.styles?.color}
                    onChange={(color) => updateComponentStyle('color', color)}
                    showBrandColors={true}
                  />
                  <TypographyControl
                    value={selectedComponent.styles || {}}
                    onChange={(styles) => updateComponent(selectedId, { styles: { ...selectedComponent.styles, ...styles } })}
                  />
                  <SpacingControl
                    label="Padding"
                    value={selectedComponent.styles?.padding}
                    onChange={(padding) => updateComponentStyle('padding', padding)}
                    property="padding"
                  />
                  <SpacingControl
                    label="Margin"
                    value={selectedComponent.styles?.margin}
                    onChange={(margin) => updateComponentStyle('margin', margin)}
                    property="margin"
                  />
                  <BorderControl
                    value={selectedComponent.styles || {}}
                    onChange={(styles) => updateComponent(selectedId, { styles: { ...selectedComponent.styles, ...styles } })}
                  />
                  <ShadowControl
                    value={selectedComponent.styles?.boxShadow}
                    onChange={(boxShadow) => updateComponentStyle('boxShadow', boxShadow)}
                  />
                  <DisplayControl
                    value={selectedComponent.styles || {}}
                    onChange={(styles) => updateComponent(selectedId, { styles: { ...selectedComponent.styles, ...styles } })}
                  />
                </div>
              )}

              {/* Advanced Tab */}
              {activeTab === 'advanced' && (
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Width</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={selectedComponent.width || 'auto'}
                      onChange={(e) => updateComponent(selectedId, { width: e.target.value })}
                      placeholder="auto, 100px, 50%"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Height</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={selectedComponent.height || 'auto'}
                      onChange={(e) => updateComponent(selectedId, { height: e.target.value })}
                      placeholder="auto, 100px, 50%"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">CSS Classes</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={selectedComponent.className || ''}
                      onChange={(e) => updateComponent(selectedId, { className: e.target.value })}
                      placeholder="text-xl font-bold"
                    />
                    <label className="label">
                      <span className="label-text-alt">Use Tailwind CSS classes</span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Custom CSS</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered font-mono text-xs"
                      rows={8}
                      value={selectedComponent.customCss || ''}
                      onChange={(e) => updateComponent(selectedId, { customCss: e.target.value })}
                      placeholder=".my-element { color: red; }"
                    />
                    <label className="label">
                      <span className="label-text-alt">⚠️ Advanced: inline CSS for this component</span>
                    </label>
                  </div>

                  <div className="divider"></div>

                  <button
                    onClick={() => deleteComponent(selectedId)}
                    className="btn btn-error btn-block btn-sm"
                  >
                    🗑️ Delete Component
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
        )}
      </div>

      {/* Context Menu */}
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        component={contextMenu.targetId ? findComponent(contextMenu.targetId) : null}
        onClose={() => setContextMenu({ ...contextMenu, visible: false })}
        onAddChild={() => {
          if (contextMenu.targetId) {
            setShowAddMenu(contextMenu.targetId);
          }
        }}
        onDuplicate={() => {
          if (contextMenu.targetId) {
            duplicateComponent(contextMenu.targetId);
          }
        }}
        onDelete={() => {
          if (contextMenu.targetId) {
            deleteComponent(contextMenu.targetId);
          }
        }}
        onEditText={() => {
          if (contextMenu.targetId) {
            setEditingId(contextMenu.targetId);
          }
        }}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
      />
    </div>
  );
}

