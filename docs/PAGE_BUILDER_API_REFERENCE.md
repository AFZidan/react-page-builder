# Page Builder API Reference

## Table of Contents

1. [Component Props](#component-props)
2. [Callback Functions](#callback-functions)
3. [Data Structures](#data-structures)
4. [Component Types](#component-types)
5. [Styling API](#styling-api)
6. [Configuration Options](#configuration-options)
7. [Event Handlers](#event-handlers)
8. [Utility Functions](#utility-functions)

## Component Props

### PageBuilder Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `pageId` | `string` | ✅ | - | Unique identifier for the page |
| `initialComponents` | `Component[]` | ✅ | `[]` | Array of initial components |
| `onSave` | `(data: PageData) => Promise<void>` | ✅ | - | Callback when page is saved |
| `onBack` | `() => void` | ✅ | - | Callback when back button is clicked |
| `pageName` | `string` | ❌ | `'Page Builder'` | Display name for the page |
| `pageSlug` | `string` | ❌ | `''` | URL slug for the page |
| `brandColors` | `string[]` | ❌ | `[]` | Array of brand color hex values |
| `theme` | `ThemeConfig` | ❌ | `{}` | Custom theme configuration |
| `autoSave` | `AutoSaveConfig` | ❌ | `undefined` | Auto-save configuration |
| `gridConfig` | `GridConfig` | ❌ | `undefined` | Grid system configuration |
| `deviceConfig` | `DeviceConfig` | ❌ | `undefined` | Device preview configuration |
| `debug` | `boolean` | ❌ | `false` | Enable debug mode |
| `customComponents` | `Record<string, CustomComponent>` | ❌ | `{}` | Custom component definitions |

### Renderer Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `components` | `Component[]` | ✅ | - | Array of components to render |
| `isDraft` | `boolean` | ❌ | `false` | Whether this is a draft page |
| `showDraftBanner` | `boolean` | ❌ | `true` | Show draft banner if isDraft |
| `pageName` | `string` | ❌ | `''` | Name of the page |
| `pageSlug` | `string` | ❌ | `''` | Slug of the page |

## Callback Functions

### onSave Callback

```typescript
type PageData = {
  pageId: string;
  components: Component[];
  metadata: PageMetadata;
  version: string;
  timestamp: string;
};

const handleSave = async (data: PageData) => {
  try {
    const response = await fetch(`/api/pages/${data.pageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        canvasJson: {
          components: data.components,
          metadata: data.metadata,
          version: data.version
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save page');
    }
    
    console.log('Page saved successfully');
  } catch (error) {
    console.error('Save error:', error);
    throw error; // Re-throw to show error in UI
  }
};
```

### onBack Callback

```typescript
const handleBack = () => {
  // Navigate back to pages list
  window.history.back();
  
  // Or using React Router:
  // navigate('/admin/pages');
  
  // Or custom navigation:
  // window.location.href = '/admin/pages';
};
```

## Data Structures

### Component Interface

```typescript
interface Component {
  id: string;
  type: ComponentType;
  content?: string;
  styles: ComponentStyles;
  position: Position;
  size: Size;
  props?: Record<string, any>;
  children?: Component[];
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number | 'auto';
  height: number | 'auto';
}

interface ComponentStyles {
  [key: string]: string | number;
  // Common styles:
  // fontSize?: string;
  // color?: string;
  // backgroundColor?: string;
  // padding?: string;
  // margin?: string;
  // border?: string;
  // borderRadius?: string;
  // textAlign?: string;
  // fontWeight?: string;
  // fontFamily?: string;
}
```

### PageMetadata Interface

```typescript
interface PageMetadata {
  createdAt: string;
  updatedAt: string;
  author?: string;
  version: number;
  tags?: string[];
  description?: string;
  [key: string]: any; // Allow custom metadata
}
```

### Theme Configuration

```typescript
interface ThemeConfig {
  colors?: {
    primary?: string;
    secondary?: string;
    success?: string;
    danger?: string;
    warning?: string;
    info?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
    mono?: string;
  };
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  borderRadius?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
}
```

### Auto-save Configuration

```typescript
interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // milliseconds
  onSave: (data: PageData) => Promise<void>;
  onError?: (error: Error) => void;
  showNotification?: boolean;
}
```

### Grid Configuration

```typescript
interface GridConfig {
  enabled: boolean;
  columns: number;
  gutter: number;
  margin: number;
  color: string;
  snapToGrid: boolean;
  showGrid: boolean;
}
```

### Device Configuration

```typescript
interface DeviceConfig {
  mobile: DeviceSize;
  tablet: DeviceSize;
  desktop: DeviceSize;
}

interface DeviceSize {
  width: number;
  height: number;
  name: string;
}
```

## Component Types

### Text Components

#### heading

```typescript
interface HeadingComponent extends Component {
  type: 'heading';
  content: string;
  props: {
    level: 1 | 2 | 3 | 4 | 5 | 6; // h1, h2, h3, h4, h5, h6
  };
  styles: {
    fontSize: string;
    fontWeight: string;
    color: string;
    textAlign: string;
    lineHeight: string;
  };
}
```

#### text

```typescript
interface TextComponent extends Component {
  type: 'text';
  content: string;
  props: {
    textAlign: 'left' | 'center' | 'right' | 'justify';
    maxWidth?: string;
  };
  styles: {
    fontSize: string;
    color: string;
    lineHeight: string;
    fontFamily: string;
  };
}
```

### Interactive Components

#### button

```typescript
interface ButtonComponent extends Component {
  type: 'button';
  content: string;
  props: {
    href?: string;
    target?: '_blank' | '_self';
    onClick?: string; // JavaScript code as string
    disabled?: boolean;
  };
  styles: {
    backgroundColor: string;
    color: string;
    padding: string;
    borderRadius: string;
    border: string;
    fontSize: string;
    fontWeight: string;
  };
}
```

#### image

```typescript
interface ImageComponent extends Component {
  type: 'image';
  props: {
    src: string;
    alt: string;
    objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    loading?: 'lazy' | 'eager';
  };
  styles: {
    width: string;
    height: string;
    borderRadius: string;
    objectFit: string;
  };
}
```

### Layout Components

#### container

```typescript
interface ContainerComponent extends Component {
  type: 'container';
  props: {
    flexDirection: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
    flexWrap: 'nowrap' | 'wrap' | 'wrap-reverse';
    gap?: string;
  };
  styles: {
    padding: string;
    margin: string;
    backgroundColor: string;
    borderRadius: string;
    minHeight: string;
  };
  children: Component[];
}
```

#### columns

```typescript
interface ColumnsComponent extends Component {
  type: 'columns';
  props: {
    columnCount: number;
    gap: string;
    responsive?: boolean;
  };
  styles: {
    display: string;
    gridTemplateColumns: string;
    gap: string;
  };
  children: Component[];
}
```

### Form Components

#### form-container

```typescript
interface FormContainerComponent extends Component {
  type: 'form-container';
  props: {
    action: string;
    method: 'GET' | 'POST';
    enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data';
    target?: '_blank' | '_self' | '_parent' | '_top';
  };
  styles: {
    padding: string;
    backgroundColor: string;
    borderRadius: string;
    border: string;
  };
  children: Component[];
}
```

#### form-input

```typescript
interface FormInputComponent extends Component {
  type: 'form-input';
  props: {
    name: string;
    type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    value?: string;
  };
  styles: {
    width: string;
    padding: string;
    border: string;
    borderRadius: string;
    fontSize: string;
    fontFamily: string;
  };
}
```

#### form-textarea

```typescript
interface FormTextareaComponent extends Component {
  type: 'form-textarea';
  props: {
    name: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    rows?: number;
    cols?: number;
    maxLength?: number;
    minLength?: number;
  };
  styles: {
    width: string;
    padding: string;
    border: string;
    borderRadius: string;
    fontSize: string;
    fontFamily: string;
    resize: 'none' | 'both' | 'horizontal' | 'vertical';
  };
}
```

#### form-select

```typescript
interface FormSelectComponent extends Component {
  type: 'form-select';
  props: {
    name: string;
    options: Array<{ value: string; label: string; }>;
    multiple?: boolean;
    required?: boolean;
    disabled?: boolean;
    defaultValue?: string;
  };
  styles: {
    width: string;
    padding: string;
    border: string;
    borderRadius: string;
    fontSize: string;
    fontFamily: string;
  };
}
```

#### form-checkbox

```typescript
interface FormCheckboxComponent extends Component {
  type: 'form-checkbox';
  props: {
    name: string;
    label: string;
    value?: string;
    checked?: boolean;
    required?: boolean;
    disabled?: boolean;
  };
  styles: {
    fontSize: string;
    color: string;
  };
}
```

#### form-radio-group

```typescript
interface FormRadioGroupComponent extends Component {
  type: 'form-radio-group';
  props: {
    name: string;
    options: Array<{ value: string; label: string; }>;
    defaultValue?: string;
    required?: boolean;
    disabled?: boolean;
  };
  styles: {
    fontSize: string;
    color: string;
  };
}
```

#### form-file

```typescript
interface FormFileComponent extends Component {
  type: 'form-file';
  props: {
    name: string;
    accept?: string; // e.g., "image/*", ".pdf", "image/jpeg,image/png"
    multiple?: boolean;
    required?: boolean;
    disabled?: boolean;
    maxSize?: number; // in bytes
  };
  styles: {
    fontSize: string;
    color: string;
  };
}
```

#### form-date

```typescript
interface FormDateComponent extends Component {
  type: 'form-date';
  props: {
    name: string;
    type: 'date' | 'datetime-local' | 'time';
    min?: string;
    max?: string;
    required?: boolean;
    disabled?: boolean;
    defaultValue?: string;
  };
  styles: {
    width: string;
    padding: string;
    border: string;
    borderRadius: string;
    fontSize: string;
    fontFamily: string;
  };
}
```

#### form-submit

```typescript
interface FormSubmitComponent extends Component {
  type: 'form-submit';
  content: string;
  props: {
    type: 'submit' | 'button' | 'reset';
    disabled?: boolean;
    onClick?: string; // JavaScript code as string
  };
  styles: {
    backgroundColor: string;
    color: string;
    padding: string;
    borderRadius: string;
    border: string;
    fontSize: string;
    fontWeight: string;
    cursor: string;
  };
}
```

### Advanced Components

#### html

```typescript
interface HtmlComponent extends Component {
  type: 'html';
  props: {
    html: string;
    sanitize?: boolean; // Default: true
  };
  styles: {
    width: string;
    height: string;
  };
}
```

#### icon

```typescript
interface IconComponent extends Component {
  type: 'icon';
  props: {
    iconName: string;
    library: 'heroicons' | 'lucide';
    size?: number;
    color?: string;
  };
  styles: {
    width: string;
    height: string;
    color: string;
    fontSize: string;
  };
}
```

#### embed

```typescript
interface EmbedComponent extends Component {
  type: 'embed';
  props: {
    src: string;
    title?: string;
    allowFullscreen?: boolean;
    sandbox?: string;
  };
  styles: {
    width: string;
    height: string;
    border: string;
    borderRadius: string;
  };
}
```

## Styling API

### CSS Properties Support

The page builder supports all standard CSS properties. Here are the most commonly used ones:

```typescript
interface ComponentStyles {
  // Layout
  display?: string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  
  // Flexbox
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: string;
  
  // Grid
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridGap?: string;
  
  // Sizing
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  
  // Spacing
  margin?: string;
  padding?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  
  // Typography
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: string;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  
  // Colors
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  
  // Borders
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRadius?: string;
  borderTopLeftRadius?: string;
  borderTopRightRadius?: string;
  borderBottomLeftRadius?: string;
  borderBottomRightRadius?: string;
  
  // Shadows
  boxShadow?: string;
  textShadow?: string;
  
  // Effects
  opacity?: number;
  transform?: string;
  transition?: string;
  filter?: string;
  
  // Overflow
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';
}
```

### Responsive Design

```typescript
interface ResponsiveStyles {
  mobile?: ComponentStyles;
  tablet?: ComponentStyles;
  desktop?: ComponentStyles;
}

// Usage in component
const component: Component = {
  id: 'comp-1',
  type: 'heading',
  content: 'Responsive Heading',
  styles: {
    fontSize: '1.5rem', // Default (desktop)
    color: '#333'
  },
  responsive: {
    mobile: {
      fontSize: '1.2rem',
      textAlign: 'center'
    },
    tablet: {
      fontSize: '1.3rem'
    }
  },
  position: { x: 100, y: 50 },
  size: { width: 400, height: 60 }
};
```

## Configuration Options

### Custom Components

```typescript
interface CustomComponent {
  render: (props: {
    component: Component;
    isBuilder: boolean;
    onUpdate: (updates: Partial<Component>) => void;
  }) => React.ReactNode;
  defaultProps: Partial<Component>;
  category: string;
  icon: React.ReactNode;
  description: string;
}

const customComponents: Record<string, CustomComponent> = {
  'custom-card': {
    render: ({ component, isBuilder }) => (
      <div className="custom-card" style={component.styles}>
        <h3>{component.props.title}</h3>
        <p>{component.props.description}</p>
        <img src={component.props.imageUrl} alt={component.props.alt} />
      </div>
    ),
    defaultProps: {
      type: 'custom-card',
      props: {
        title: 'Card Title',
        description: 'Card description',
        imageUrl: '',
        alt: 'Card image'
      },
      styles: {
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fff'
      }
    },
    category: 'Layout',
    icon: <div>📋</div>,
    description: 'A customizable card component'
  }
};
```

### Keyboard Shortcuts

```typescript
interface KeyboardShortcuts {
  [key: string]: () => void;
}

const defaultShortcuts: KeyboardShortcuts = {
  'Delete': () => deleteSelectedComponent(),
  'Backspace': () => deleteSelectedComponent(),
  'Enter': () => editSelectedComponent(),
  'Escape': () => deselectComponent(),
  'Ctrl+z': () => undo(),
  'Ctrl+y': () => redo(),
  'Ctrl+s': () => save(),
  'Ctrl+d': () => duplicateSelectedComponent(),
  'ArrowUp': () => moveComponent(0, -10),
  'ArrowDown': () => moveComponent(0, 10),
  'ArrowLeft': () => moveComponent(-10, 0),
  'ArrowRight': () => moveComponent(10, 0),
  'Shift+ArrowUp': () => resizeComponent(0, -10),
  'Shift+ArrowDown': () => resizeComponent(0, 10),
  'Shift+ArrowLeft': () => resizeComponent(-10, 0),
  'Shift+ArrowRight': () => resizeComponent(10, 0)
};
```

## Event Handlers

### Component Events

```typescript
interface ComponentEvents {
  onClick?: (component: Component, event: MouseEvent) => void;
  onDoubleClick?: (component: Component, event: MouseEvent) => void;
  onMouseEnter?: (component: Component, event: MouseEvent) => void;
  onMouseLeave?: (component: Component, event: MouseEvent) => void;
  onFocus?: (component: Component, event: FocusEvent) => void;
  onBlur?: (component: Component, event: FocusEvent) => void;
  onChange?: (component: Component, event: Event) => void;
}
```

### Page Builder Events

```typescript
interface PageBuilderEvents {
  onComponentAdd?: (component: Component) => void;
  onComponentUpdate?: (component: Component, updates: Partial<Component>) => void;
  onComponentDelete?: (componentId: string) => void;
  onComponentSelect?: (component: Component | null) => void;
  onComponentDuplicate?: (component: Component) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: (data: PageData) => void;
  onError?: (error: Error) => void;
}
```

## Utility Functions

### Component Utilities

```typescript
// Generate unique component ID
function generateComponentId(): string;

// Clone component with new ID
function cloneComponent(component: Component): Component;

// Validate component structure
function validateComponent(component: Component): boolean;

// Get component default props
function getComponentDefaults(type: ComponentType): Partial<Component>;

// Calculate component bounds
function getComponentBounds(component: Component): DOMRect;

// Check if component is inside container
function isComponentInside(component: Component, container: Component): boolean;
```

### Style Utilities

```typescript
// Parse CSS value to number
function parseCSSValue(value: string): number;

// Convert pixels to other units
function pxToRem(px: number): string;
function pxToEm(px: number): string;

// Generate CSS from component styles
function generateCSS(styles: ComponentStyles): string;

// Merge style objects
function mergeStyles(...styles: ComponentStyles[]): ComponentStyles;

// Validate CSS property
function isValidCSSProperty(property: string, value: string): boolean;
```

### Data Utilities

```typescript
// Export page data to JSON
function exportPageData(pageData: PageData): string;

// Import page data from JSON
function importPageData(json: string): PageData;

// Validate page data structure
function validatePageData(data: any): boolean;

// Migrate page data between versions
function migratePageData(data: any, fromVersion: string, toVersion: string): any;

// Generate page preview
function generatePreview(components: Component[]): string;
```

---

This API reference provides comprehensive information about all the interfaces, types, and functions available in the Page Builder package. For implementation examples, see the main documentation and quick start guide.
