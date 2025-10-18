# Page Builder NPM Package Extraction Guide

## Overview
This guide outlines how to extract the Page Builder into a standalone npm package that can be published to npmjs.com.

## Package Structure

```
packages/page-builder/
├── package.json
├── vite.config.ts
├── README.md
├── LICENSE
├── tsconfig.json (optional, for TypeScript support)
├── src/
│   ├── index.jsx              # Main export file
│   ├── PageBuilder.jsx        # Main builder component
│   ├── Renderer.jsx           # Public page renderer
│   ├── styles.css             # Core styles
│   ├── components/
│   │   ├── StyleControls.jsx
│   │   ├── IconPicker.jsx
│   │   ├── EmbedHelper.jsx
│   │   ├── DynamicIcon.jsx
│   │   └── ContextMenu.jsx
│   └── utils/
│       └── helpers.js
└── dist/                      # Build output (generated)
```

## Step 1: Create Package Directory

```bash
mkdir -p packages/page-builder/src/components
cd packages/page-builder
```

## Step 2: Create package.json

```json
{
  "name": "@hizidan/page-builder",
  "version": "1.0.0",
  "description": "A visual drag-and-drop page builder for React with support for custom components, responsive design, and advanced styling",
  "main": "./dist/page-builder.cjs",
  "module": "./dist/page-builder.es.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/page-builder.es.js",
      "require": "./dist/page-builder.cjs"
    },
    "./styles.css": "./dist/style.css"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "page-builder",
    "visual-editor",
    "drag-and-drop",
    "react",
    "wysiwyg",
    "website-builder",
    "cms"
  ],
  "author": "Zidan",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/page-builder.git"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "peerDependenciesMeta": {
    "tailwindcss": {
      "optional": true
    },
    "daisyui": {
      "optional": true
    }
  },
  "dependencies": {
    "react-markdown": "^9.0.1",
    "react-colorful": "^6.0.0",
    "@heroicons/react": "^2.2.0",
    "lucide-react": "^0.546.0",
    "react-hook-form": "^7.51.5",
    "@hookform/resolvers": "^3.4.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.0"
  }
}
```

## Step 3: Create vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.jsx'),
      name: 'PageBuilder',
      formats: ['es', 'cjs'],
      fileName: (format) => `page-builder.${format === 'es' ? 'es.js' : 'cjs'}`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-markdown',
        'react-colorful',
        '@heroicons/react/24/outline',
        'lucide-react',
        'react-hook-form',
        '@hookform/resolvers',
        'zod'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime'
        }
      }
    },
    sourcemap: true,
    minify: 'esbuild'
  }
});
```

## Step 4: Create src/index.jsx

```jsx
// Main exports
export { default as PageBuilder } from './PageBuilder';
export { default as Renderer } from './Renderer';

// Component types and utilities
export const ComponentTypes = {
  HEADING: 'heading',
  TEXT: 'text',
  BUTTON: 'button',
  IMAGE: 'image',
  COLUMNS: 'columns',
  CONTAINER: 'container',
  DIVIDER: 'divider',
  SPACER: 'spacer',
  HTML: 'html',
  ICON: 'icon',
  EMBED: 'embed',
  FORM_CONTAINER: 'form-container',
  FORM_INPUT: 'form-input',
  FORM_TEXTAREA: 'form-textarea',
  FORM_SELECT: 'form-select',
  FORM_CHECKBOX: 'form-checkbox',
  FORM_RADIO_GROUP: 'form-radio-group',
  FORM_FILE: 'form-file',
  FORM_DATE: 'form-date',
  FORM_SUBMIT: 'form-submit'
};

// Export version
export const VERSION = '1.0.0';
```

## Step 5: Decouple from Application Context

### Remove Direct Dependencies
- Remove `useNavigate`, `useParams` from React Router
- Remove `pagesApi` direct imports
- Replace with props-based API calls

### Example Refactored PageBuilder.jsx

```jsx
export default function PageBuilder({
  pageId,
  initialComponents = [],
  onSave,
  onBack,
  pageName = 'Page Builder',
  pageSlug = '',
  brandColors = [],
  iconLibraries = { heroicons: true, lucide: true },
  customComponents = [],
  ...props
}) {
  // Component logic here, using props instead of context
}
```

## Step 6: Create README.md

```markdown
# @hizidan/page-builder

A powerful visual drag-and-drop page builder for React applications.

## Features

- 🎨 Visual drag-and-drop interface
- 📱 Responsive design with device preview
- 🖼️ Rich component library (text, images, forms, icons, embeds)
- 🎨 Advanced styling controls (colors, typography, spacing, borders, shadows)
- 📐 Smart snapping and alignment guides
- 🔧 Context menu for quick actions
- 🖱️ Intuitive corner resize handles
- 📦 Container auto-sizing
- 🌈 Brand color integration
- ⌨️ Keyboard shortcuts

## Installation

\`\`\`bash
npm install @hizidan/page-builder
# or
yarn add @hizidan/page-builder
\`\`\`

### Peer Dependencies

This package requires:
- React ^18.0.0
- React DOM ^18.0.0

Optional (for styling):
- Tailwind CSS
- DaisyUI

## Usage

### Basic Example

\`\`\`jsx
import { PageBuilder, Renderer } from '@hizidan/page-builder';
import '@hizidan/page-builder/styles.css';

function App() {
  const [components, setComponents] = useState([]);

  const handleSave = async (pageData) => {
    // Save to your backend
    await fetch('/api/pages', {
      method: 'POST',
      body: JSON.stringify(pageData)
    });
  };

  return (
    <PageBuilder
      pageId="my-page-id"
      initialComponents={components}
      onSave={handleSave}
      onBack={() => window.history.back()}
      pageName="My Page"
      pageSlug="/my-page"
      brandColors={['#3b82f6', '#10b981', '#f59e0b']}
    />
  );
}
```

### Rendering Pages

\`\`\`jsx
import { Renderer } from '@hizidan/page-builder';

function PublicPage({ pageData }) {
  return (
    <Renderer
      components={pageData.canvasJson?.components || []}
    />
  );
}
\`\`\`

## API Reference

### PageBuilder Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `pageId` | string | Yes | Unique identifier for the page |
| `initialComponents` | array | Yes | Initial component tree |
| `onSave` | function | Yes | Callback when save is triggered |
| `onBack` | function | No | Callback for back button |
| `pageName` | string | No | Display name for the page |
| `pageSlug` | string | No | URL slug for the page |
| `brandColors` | array | No | Array of hex color strings |
| `iconLibraries` | object | No | Enable/disable icon libraries |
| `customComponents` | array | No | Add custom component types |

### Renderer Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `components` | array | Yes | Component tree to render |

## Styling

The package includes minimal CSS for core functionality. For full styling support:

1. Install Tailwind CSS and DaisyUI
2. Import the package styles:

\`\`\`jsx
import '@hizidan/page-builder/styles.css';
\`\`\`

## License

MIT © Zidan

## Contributing

Contributions welcome! Please read our contributing guidelines first.
\`\`\`

## Step 7: Create LICENSE

```
MIT License

Copyright (c) 2025 Zidan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

## Step 8: Build the Package

```bash
cd packages/page-builder
npm install
npm run build
```

## Step 9: Test Locally

```bash
# In your main app's package.json
{
  "dependencies": {
    "@hizidan/page-builder": "file:./packages/page-builder"
  }
}
```

## Step 10: Publish to NPM

```bash
# Login to npm
npm login

# Publish
npm publish --access public
```

## Migration Checklist

- [ ] Copy all builder files to packages/page-builder/src/
- [ ] Remove app-specific dependencies
- [ ] Replace context usage with props
- [ ] Create prop-based API callbacks
- [ ] Build and test locally
- [ ] Update main app to use package
- [ ] Test all features work via package
- [ ] Write comprehensive tests
- [ ] Publish to npm

## Maintenance

- Keep dependencies updated
- Version bumps follow semantic versioning
- Document breaking changes in CHANGELOG.md
- Maintain backward compatibility when possible

## Future Enhancements

- TypeScript support
- Headless/unstyled option
- More component types
- Undo/redo functionality
- Component templates library
- Collaborative editing
- Animation builder

