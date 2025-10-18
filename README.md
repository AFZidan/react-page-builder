# @ahmedzidan/page-builder

A powerful visual drag-and-drop page builder for React applications with advanced features and Bootstrap grid support.

## ✨ Features

- 🎨 **Visual Drag-and-Drop** - Intuitive interface with drag from anywhere
- 📱 **Responsive Design** - Device preview (Mobile/Tablet/Desktop) with zoom
- 📐 **12-Column Grid** - Bootstrap-compatible grid overlay for precise alignment
- 🖼️ **Rich Components** - Text, images, buttons, containers, forms, icons, embeds, HTML blocks
- 🎨 **Advanced Styling** - Colors, typography, spacing, borders, shadows with visual controls
- 📏 **Smart Snapping** - Magnetic alignment guides and grid snapping
- 🖱️ **Corner Resize** - Intuitive resize handles on all elements
- 📦 **Auto-Container Sizing** - Containers automatically fit their children
- 🔧 **Context Menu** - Right-click for quick actions
- ⌨️ **Keyboard Shortcuts** - Enter to edit, Delete to remove, Esc to deselect
- 🌈 **Brand Colors** - Integrate your brand colors into the color picker
- 🔄 **Live Preview** - Real-time updates as you design

## 📦 Installation

```bash
npm install @ahmedzidan/page-builder
# or
yarn add @ahmedzidan/page-builder
# or
pnpm add @ahmedzidan/page-builder
```

### Peer Dependencies

This package requires:

- `react` ^18.0.0
- `react-dom` ^18.0.0

Optional (for full styling support):

- `tailwindcss` ^3.0.0
- `daisyui` ^4.0.0

## 🚀 Quick Start

### Basic Usage

```jsx
import { PageBuilder } from '@ahmedzidan/page-builder';
import '@ahmedzidan/page-builder/styles.css';

function App() {
  const [components, setComponents] = useState([]);

  const handleSave = async (pageData) => {
    // Save to your backend
    console.log('Saving page:', pageData);
    await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pageData)
    });
  };

  return (
    <PageBuilder
      pageId="my-page-123"
      initialComponents={components}
      onSave={handleSave}
      onBack={() => window.history.back()}
      pageName="My Awesome Page"
      pageSlug="/my-awesome-page"
    />
  );
}
```

### Rendering Pages

```jsx
import { Renderer } from '@ahmedzidan/page-builder';

function PublicPage({ pageData }) {
  return (
    <div>
      <Renderer components={pageData.components} />
    </div>
  );
}
```

## 📖 API Reference

### PageBuilder Component

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `pageId` | string | Yes | - | Unique identifier for the page |
| `initialComponents` | array | Yes | `[]` | Initial component tree |
| `onSave` | function | Yes | - | Callback when save button is clicked |
| `onBack` | function | No | - | Callback for back button |
| `pageName` | string | No | `"Page Builder"` | Display name for the page |
| `pageSlug` | string | No | `""` | URL slug for the page |
| `brandColors` | array | No | `[]` | Array of hex color strings for color picker |
| `iconLibraries` | object | No | `{heroicons: true, lucide: true}` | Enable/disable icon libraries |

### Renderer Component

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `components` | array | Yes | Component tree to render |

### Component Data Structure

```typescript
interface Component {
  id: string;
  type: string;
  content?: string;
  className?: string;
  width?: string;
  height?: string;
  position?: { x: number; y: number };
  styles?: {
    backgroundColor?: string;
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    padding?: string;
    margin?: string;
    borderWidth?: string;
    borderColor?: string;
    borderRadius?: string;
    // ... more style properties
  };
  children?: Component[];
}
```

## 🎨 Styling

The package includes minimal CSS for core functionality. For full styling support:

1. **Install Tailwind CSS and DaisyUI:**

```bash
npm install -D tailwindcss daisyui
```

2. **Configure Tailwind:**

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@ahmedzidan/page-builder/**/*.{js,jsx}'
  ],
  plugins: [require('daisyui')],
}
```

3. **Import styles:**

```jsx
import '@ahmedzidan/page-builder/styles.css';
```

## 🎯 Examples

### With Brand Colors

```jsx
<PageBuilder
  pageId="branded-page"
  initialComponents={[]}
  onSave={handleSave}
  brandColors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
  pageName="Branded Page"
/>
```

### Custom Save Handler

```jsx
const handleSave = async (pageData) => {
  try {
    const response = await api.post('/pages', {
      name: pageData.pageName,
      slug: pageData.pageSlug,
      canvasJson: {
        components: pageData.components
      }
    });
    
    if (response.ok) {
      toast.success('Page saved!');
    }
  } catch (error) {
    toast.error('Failed to save page');
  }
};
```

### With Custom Back Navigation

```jsx
import { useNavigate } from 'react-router-dom';

function MyPageBuilder() {
  const navigate = useNavigate();
  
  return (
    <PageBuilder
      pageId="my-page"
      initialComponents={[]}
      onSave={handleSave}
      onBack={() => navigate('/admin/pages')}
      pageName="My Page"
    />
  );
}
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Click + Drag | Drag element from anywhere |
| Double Click | Edit text element |
| Right Click | Open context menu |
| Enter | Edit selected text element |
| Delete | Delete selected element |
| Escape | Deselect / Close menu |
| Alt + Drag | Disable snapping |

## 🛠️ Toolbar Controls

- **Device Selector** - Switch between Mobile (375px), Tablet (768px), Desktop (1440px)
- **Zoom Controls** - Zoom from 50% to 150%
- **Grid Toggle** - Show/hide 12-column Bootstrap grid
- **Full Width** - Hide sidebars for maximum canvas space
- **Save Button** - Trigger save callback

## 📦 Available Components

### Layout

- **Container** - Generic container for grouping elements
- **2 Columns** - Two-column layout

### Content

- **Heading** - H1-H6 headings
- **Text** - Paragraph text with markdown support
- **Button** - Call-to-action buttons
- **Image** - Images with resize and positioning

### Spacing

- **Divider** - Horizontal divider line
- **Spacer** - Vertical spacing element

### Advanced

- **HTML Block** - Custom HTML content
- **Icon** - Icons from Heroicons or Lucide libraries
- **Embed** - YouTube, Google Maps, or custom iframes

### Forms

- **Form Container** - Form wrapper
- **Input Field** - Text inputs
- **Text Area** - Multi-line text input
- **Dropdown** - Select dropdown
- **Checkbox** - Single checkbox
- **Radio Group** - Radio button group
- **File Upload** - File input
- **Date Picker** - Date input
- **Submit Button** - Form submit button

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © Zidan

## 📚 Documentation

For comprehensive documentation, examples, and integration guides:

- **[📖 Complete Documentation](docs/README.md)** - Full documentation index
- **[🚀 Quick Start Guide](docs/PAGE_BUILDER_QUICK_START.md)** - Get started in 5 minutes
- **[📋 API Reference](docs/PAGE_BUILDER_API_REFERENCE.md)** - Complete TypeScript interfaces
- **[💡 Integration Examples](docs/PAGE_BUILDER_INTEGRATION_EXAMPLES.md)** - Real-world implementations

## 🔗 Links

- [Documentation](docs/README.md)
- [Issues](https://github.com/AFZidan/react-page-builder/issues)
- [Changelog](CHANGELOG.md)

## 💡 Tips

1. Use the 12-column grid overlay for precise alignment
2. Hold Alt while dragging to disable snapping
3. Right-click elements for quick actions
4. Use device preview to test responsive designs
5. Brand colors appear first in the color picker
6. Container elements auto-resize to fit children
7. Press Enter to edit text elements quickly
8. Use full-width mode for complex designs

## 🐛 Troubleshooting

### Styles not appearing?

Make sure you've imported the CSS file and configured Tailwind properly.

### Icons not showing?

Ensure `@heroicons/react` and `lucide-react` are installed.

### Build errors?

Check that all peer dependencies are installed with compatible versions.

## 📧 Support

For support, email <support@hizidan.com> or open an issue on GitHub.

---

Built with ❤️ by Zidan
