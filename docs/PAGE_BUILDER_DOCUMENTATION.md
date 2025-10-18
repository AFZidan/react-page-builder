# Page Builder Package Documentation

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Basic Usage](#basic-usage)
4. [API Configuration](#api-configuration)
5. [Database Integration](#database-integration)
6. [JSON File Storage](#json-file-storage)
7. [Retrieving Saved Pages](#retrieving-saved-pages)
8. [Component API](#component-api)
9. [Styling & Customization](#styling--customization)
10. [Advanced Features](#advanced-features)
11. [Troubleshooting](#troubleshooting)
12. [Examples](#examples)

## Overview

The Page Builder Package is a React-based visual page builder that allows users to create, edit, and manage web pages through a drag-and-drop interface. It supports multiple storage backends (database, JSON files) and provides a flexible API for integration.

### Key Features
- 🎨 **Visual Drag & Drop Interface**
- 📱 **Responsive Design Tools**
- 🎯 **Component Library** (Text, Images, Buttons, Forms, etc.)
- 💾 **Flexible Storage Options** (Database, JSON files)
- 🔧 **Customizable API Integration**
- 🎨 **Advanced Styling Controls**
- 📐 **Grid System & Alignment Tools**
- ⌨️ **Keyboard Shortcuts**

## Installation

### NPM Package Installation
```bash
npm install @ahmedzidan/page-builder
```

### Dependencies
The package requires these peer dependencies:
```bash
npm install react react-dom
npm install react-colorful @heroicons/react lucide-react
npm install react-hook-form @hookform/resolvers zod
npm install react-markdown
```

## Basic Usage

### Simple Integration
```jsx
import { PageBuilder } from '@ahmedzidan/page-builder';

function App() {
  const handleSave = async (data) => {
    console.log('Page data:', data);
    // Handle saving logic here
  };

  const handleBack = () => {
    console.log('Navigate back');
  };

  return (
    <PageBuilder
      pageId="page-123"
      initialComponents={[]}
      onSave={handleSave}
      onBack={handleBack}
      pageName="My Page"
      pageSlug="my-page"
      brandColors={['#3B82F6', '#EF4444', '#10B981']}
    />
  );
}
```

### With Custom Configuration
```jsx
import { PageBuilder } from '@ahmedzidan/page-builder';

function MyPageBuilder() {
  const config = {
    pageId: "unique-page-id",
    initialComponents: [
      {
        id: "comp-1",
        type: "heading",
        content: "Welcome to My Page",
        styles: {
          fontSize: "2rem",
          color: "#333",
          textAlign: "center"
        },
        position: { x: 100, y: 50 },
        size: { width: 400, height: 60 }
      }
    ],
    onSave: handlePageSave,
    onBack: handleNavigation,
    pageName: "Homepage",
    pageSlug: "home",
    brandColors: ["#FF6B6B", "#4ECDC4", "#45B7D1"],
    // Optional: Custom API endpoints
    apiConfig: {
      saveEndpoint: "/api/pages/save",
      loadEndpoint: "/api/pages/load"
    }
  };

  return <PageBuilder {...config} />;
}
```

## API Configuration

### Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `pageId` | string | Yes | Unique identifier for the page |
| `initialComponents` | array | Yes | Array of initial components |
| `onSave` | function | Yes | Callback when page is saved |
| `onBack` | function | Yes | Callback when back button is clicked |
| `pageName` | string | No | Display name for the page |
| `pageSlug` | string | No | URL slug for the page |
| `brandColors` | array | No | Array of brand color hex values |

### Save Callback Function
```jsx
const handleSave = async (pageData) => {
  const {
    components,    // Array of all components
    metadata,      // Page metadata
    version,       // Builder version
    timestamp      // Save timestamp
  } = pageData;

  try {
    // Save to your backend
    const response = await fetch('/api/pages/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pageId: pageData.pageId,
        components: components,
        metadata: metadata
      })
    });

    if (response.ok) {
      console.log('Page saved successfully');
    }
  } catch (error) {
    console.error('Failed to save page:', error);
  }
};
```

### Back Callback Function
```jsx
const handleBack = () => {
  // Navigate back to pages list or dashboard
  window.location.href = '/admin/pages';
  // Or using React Router:
  // navigate('/admin/pages');
};
```

## Database Integration

### Database Schema Examples

#### PostgreSQL/MySQL Schema
```sql
-- Pages table
CREATE TABLE pages (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('DRAFT', 'PUBLISHED') DEFAULT 'DRAFT',
    is_home_page BOOLEAN DEFAULT FALSE,
    canvas_json JSON,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Example canvas_json structure:
{
  "version": "1.0",
  "components": [
    {
      "id": "comp-1",
      "type": "heading",
      "content": "Welcome",
      "styles": {
        "fontSize": "2rem",
        "color": "#333"
      },
      "position": { "x": 100, "y": 50 },
      "size": { "width": 400, "height": 60 }
    }
  ],
  "metadata": {
    "lastModified": "2024-01-15T10:30:00Z",
    "author": "admin"
  }
}
```

#### MongoDB Schema
```javascript
// Pages collection
{
  _id: ObjectId,
  name: String,
  slug: String,
  title: String,
  description: String,
  status: String, // 'DRAFT' or 'PUBLISHED'
  isHomePage: Boolean,
  canvasJson: {
    version: String,
    components: [
      {
        id: String,
        type: String,
        content: String,
        styles: Object,
        position: { x: Number, y: Number },
        size: { width: Number, height: Number }
      }
    ],
    metadata: Object
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Backend API Implementation

#### NestJS Example
```typescript
// pages.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PagesService } from './pages.service';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  async createPage(@Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(createPageDto);
  }

  @Get(':id')
  async getPage(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Put(':id')
  async updatePage(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.pagesService.update(id, updatePageDto);
  }

  @Delete(':id')
  async deletePage(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
}

// pages.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.page.create({
      data: {
        name: data.name,
        slug: data.slug,
        title: data.title,
        canvasJson: data.canvasJson || { components: [] },
        status: data.status || 'DRAFT'
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.page.findUnique({
      where: { id }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.page.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async remove(id: string) {
    return this.prisma.page.delete({
      where: { id }
    });
  }
}
```

#### Express.js Example
```javascript
// pages.routes.js
const express = require('express');
const router = express.Router();

// Save page
router.post('/pages', async (req, res) => {
  try {
    const { pageId, components, metadata } = req.body;
    
    const page = await db.pages.upsert({
      where: { id: pageId },
      update: {
        canvasJson: { components, metadata },
        updatedAt: new Date()
      },
      create: {
        id: pageId,
        name: metadata.name || 'Untitled Page',
        slug: metadata.slug || pageId,
        title: metadata.title || 'Untitled',
        canvasJson: { components, metadata },
        status: 'DRAFT'
      }
    });
    
    res.json({ success: true, page });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Load page
router.get('/pages/:id', async (req, res) => {
  try {
    const page = await db.pages.findUnique({
      where: { id: req.params.id }
    });
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## JSON File Storage

### File Structure
```
pages/
├── drafts/
│   ├── page-123.json
│   └── page-456.json
├── published/
│   ├── home.json
│   └── about.json
└── templates/
    ├── landing-page.json
    └── contact-page.json
```

### JSON File Format
```json
{
  "id": "page-123",
  "name": "Homepage",
  "slug": "home",
  "title": "Welcome to Our Site",
  "status": "PUBLISHED",
  "isHomePage": true,
  "canvasJson": {
    "version": "1.0",
    "components": [
      {
        "id": "comp-1",
        "type": "heading",
        "content": "Welcome to Our Amazing Site",
        "styles": {
          "fontSize": "3rem",
          "fontWeight": "bold",
          "color": "#2563EB",
          "textAlign": "center",
          "margin": "2rem 0"
        },
        "position": { "x": 200, "y": 100 },
        "size": { "width": 600, "height": 80 }
      },
      {
        "id": "comp-2",
        "type": "button",
        "content": "Get Started",
        "styles": {
          "backgroundColor": "#10B981",
          "color": "white",
          "padding": "12px 24px",
          "borderRadius": "8px",
          "border": "none",
          "fontSize": "1.1rem"
        },
        "position": { "x": 350, "y": 300 },
        "size": { "width": 140, "height": 48 }
      }
    ],
    "metadata": {
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T14:45:00Z",
      "author": "admin",
      "version": 1
    }
  }
}
```

### File-based Backend Implementation
```javascript
// file-storage.js
const fs = require('fs').promises;
const path = require('path');

class FileStorage {
  constructor(baseDir = './pages') {
    this.baseDir = baseDir;
    this.draftsDir = path.join(baseDir, 'drafts');
    this.publishedDir = path.join(baseDir, 'published');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.mkdir(this.draftsDir, { recursive: true });
    await fs.mkdir(this.publishedDir, { recursive: true });
  }

  async savePage(pageData) {
    const { id, status = 'DRAFT' } = pageData;
    const dir = status === 'PUBLISHED' ? this.publishedDir : this.draftsDir;
    const filePath = path.join(dir, `${id}.json`);
    
    await fs.writeFile(filePath, JSON.stringify(pageData, null, 2));
    return pageData;
  }

  async loadPage(id, status = 'DRAFT') {
    const dir = status === 'PUBLISHED' ? this.publishedDir : this.draftsDir;
    const filePath = path.join(dir, `${id}.json`);
    
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('Page not found');
      }
      throw error;
    }
  }

  async listPages(status = 'DRAFT') {
    const dir = status === 'PUBLISHED' ? this.publishedDir : this.draftsDir;
    
    try {
      const files = await fs.readdir(dir);
      const pages = await Promise.all(
        files
          .filter(file => file.endsWith('.json'))
          .map(async (file) => {
            const data = await fs.readFile(path.join(dir, file), 'utf8');
            return JSON.parse(data);
          })
      );
      return pages;
    } catch (error) {
      return [];
    }
  }
}

module.exports = FileStorage;
```

## Retrieving Saved Pages

### Loading Pages in the Builder

```jsx
import { PageBuilder } from '@ahmedzidan/page-builder';
import { useState, useEffect } from 'react';

function PageEditor({ pageId }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage();
  }, [pageId]);

  const loadPage = async () => {
    try {
      const response = await fetch(`/api/pages/${pageId}`);
      const pageData = await response.json();
      
      setPage(pageData);
    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (pageData) => {
    try {
      await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canvasJson: pageData
        })
      });
      console.log('Page saved successfully');
    } catch (error) {
      console.error('Failed to save page:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!page) {
    return <div>Page not found</div>;
  }

  return (
    <PageBuilder
      pageId={pageId}
      initialComponents={page.canvasJson?.components || []}
      onSave={handleSave}
      onBack={() => window.history.back()}
      pageName={page.name}
      pageSlug={page.slug}
      brandColors={page.brandColors || []}
    />
  );
}
```

### Using the Renderer Component

```jsx
import { Renderer } from '@ahmedzidan/page-builder';

function PublishedPage({ pageId }) {
  const [page, setPage] = useState(null);

  useEffect(() => {
    loadPublishedPage();
  }, [pageId]);

  const loadPublishedPage = async () => {
    try {
      const response = await fetch(`/api/pages/${pageId}?status=published`);
      const pageData = await response.json();
      setPage(pageData);
    } catch (error) {
      console.error('Failed to load page:', error);
    }
  };

  if (!page) {
    return <div>Page not found</div>;
  }

  return (
    <div className="published-page">
      <h1>{page.title}</h1>
      <Renderer
        components={page.canvasJson.components}
        isDraft={false}
        pageName={page.name}
        pageSlug={page.slug}
      />
    </div>
  );
}
```

## Component API

### Component Structure
```javascript
const component = {
  id: "unique-component-id",
  type: "heading", // Component type
  content: "Component content",
  styles: {
    // CSS styles
    fontSize: "2rem",
    color: "#333",
    backgroundColor: "#fff"
  },
  position: { x: 100, y: 50 }, // Absolute position
  size: { width: 400, height: 60 }, // Component dimensions
  // Component-specific properties
  props: {
    // Additional component data
  }
};
```

### Supported Component Types

| Type | Description | Special Properties |
|------|-------------|-------------------|
| `heading` | Text heading | `level` (1-6) |
| `text` | Paragraph text | `textAlign`, `fontWeight` |
| `button` | Clickable button | `href`, `target`, `onClick` |
| `image` | Image display | `src`, `alt`, `objectFit` |
| `container` | Layout container | `flexDirection`, `justifyContent` |
| `columns` | Column layout | `columnCount` |
| `form-container` | Form wrapper | `action`, `method` |
| `form-input` | Text input | `type`, `placeholder`, `required` |
| `form-textarea` | Text area | `rows`, `placeholder` |
| `form-select` | Dropdown | `options`, `multiple` |
| `form-checkbox` | Checkbox | `checked`, `label` |
| `form-radio-group` | Radio buttons | `options`, `selected` |
| `form-file` | File upload | `accept`, `multiple` |
| `form-date` | Date picker | `min`, `max` |
| `form-submit` | Submit button | `text` |
| `html` | Raw HTML | `html` |
| `icon` | Icon display | `iconName`, `library` |
| `embed` | Iframe embed | `src`, `width`, `height` |

### Creating Custom Components

```jsx
// Custom component registration
const customComponents = {
  'custom-card': {
    render: ({ component, isBuilder }) => (
      <div className="custom-card" style={component.styles}>
        <h3>{component.title}</h3>
        <p>{component.description}</p>
        <img src={component.imageUrl} alt={component.alt} />
      </div>
    ),
    defaultProps: {
      title: "Card Title",
      description: "Card description",
      imageUrl: "",
      alt: "Card image",
      styles: {
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px"
      }
    }
  }
};

// Usage in PageBuilder
<PageBuilder
  customComponents={customComponents}
  // ... other props
/>
```

## Styling & Customization

### CSS Custom Properties
```css
:root {
  --page-builder-primary: #3B82F6;
  --page-builder-secondary: #6B7280;
  --page-builder-success: #10B981;
  --page-builder-danger: #EF4444;
  --page-builder-warning: #F59E0B;
  --page-builder-canvas-bg: #F9FAFB;
  --page-builder-panel-bg: #FFFFFF;
  --page-builder-border: #E5E7EB;
}
```

### Custom Theme
```jsx
const customTheme = {
  colors: {
    primary: '#8B5CF6',
    secondary: '#64748B',
    success: '#059669',
    danger: '#DC2626',
    warning: '#D97706'
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  }
};

<PageBuilder
  theme={customTheme}
  // ... other props
/>
```

### Custom CSS Classes
```css
/* Override default styles */
.page-builder-canvas {
  background: linear-gradient(45deg, #f0f0f0, #ffffff);
}

.page-builder-sidebar {
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
}

.component-selected {
  outline: 2px solid #3B82F6 !important;
  outline-offset: 2px;
}
```

## Advanced Features

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Delete` | Delete selected component |
| `Enter` | Edit selected component |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+S` | Save page |
| `Ctrl+D` | Duplicate component |
| `Arrow Keys` | Move selected component |
| `Shift+Arrow` | Resize selected component |

### Device Preview
```jsx
const deviceConfig = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 }
};

<PageBuilder
  deviceConfig={deviceConfig}
  defaultDevice="desktop"
  // ... other props
/>
```

### Grid System
```jsx
const gridConfig = {
  enabled: true,
  columns: 12,
  gutter: 20,
  margin: 40,
  color: '#E5E7EB',
  snapToGrid: true
};

<PageBuilder
  gridConfig={gridConfig}
  // ... other props
/>
```

### Auto-save
```jsx
const autoSaveConfig = {
  enabled: true,
  interval: 30000, // 30 seconds
  onSave: async (data) => {
    // Auto-save implementation
    await fetch('/api/pages/autosave', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

<PageBuilder
  autoSave={autoSaveConfig}
  // ... other props
/>
```

## Troubleshooting

### Common Issues

#### 1. Components Not Loading
**Problem:** Components appear blank or don't render
**Solution:** Check that all required dependencies are installed and properly imported.

#### 2. Save Function Not Working
**Problem:** Page data not being saved
**Solution:** Ensure the `onSave` callback is properly implemented and handles errors.

#### 3. Styling Issues
**Problem:** Components don't look as expected
**Solution:** Check CSS conflicts and ensure custom styles are properly applied.

#### 4. Import Errors
**Problem:** Package imports fail
**Solution:** Verify package installation and peer dependencies.

### Debug Mode
```jsx
<PageBuilder
  debug={true}
  onDebug={(data) => console.log('Debug info:', data)}
  // ... other props
/>
```

### Error Boundaries
```jsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PageBuilder {...props} />
    </ErrorBoundary>
  );
}
```

## Examples

### Complete Integration Example
```jsx
// App.jsx
import React, { useState, useEffect } from 'react';
import { PageBuilder, Renderer } from '@ahmedzidan/page-builder';

function App() {
  const [currentPage, setCurrentPage] = useState(null);
  const [pages, setPages] = useState([]);
  const [view, setView] = useState('list'); // 'list', 'builder', 'preview'

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const response = await fetch('/api/pages');
      const pagesData = await response.json();
      setPages(pagesData);
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  };

  const handleSavePage = async (pageData) => {
    try {
      const response = await fetch(`/api/pages/${currentPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canvasJson: pageData,
          updatedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('Page saved successfully!');
        setView('list');
        loadPages();
      }
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page');
    }
  };

  const handleCreatePage = async () => {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Page',
          slug: `page-${Date.now()}`,
          title: 'New Page',
          canvasJson: { components: [] }
        })
      });

      const newPage = await response.json();
      setCurrentPage(newPage);
      setView('builder');
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  const handleEditPage = (page) => {
    setCurrentPage(page);
    setView('builder');
  };

  const handlePreviewPage = (page) => {
    setCurrentPage(page);
    setView('preview');
  };

  const renderContent = () => {
    switch (view) {
      case 'builder':
        return (
          <PageBuilder
            pageId={currentPage.id}
            initialComponents={currentPage.canvasJson?.components || []}
            onSave={handleSavePage}
            onBack={() => setView('list')}
            pageName={currentPage.name}
            pageSlug={currentPage.slug}
            brandColors={['#3B82F6', '#EF4444', '#10B981']}
          />
        );

      case 'preview':
        return (
          <div className="preview-mode">
            <div className="preview-header">
              <button onClick={() => setView('list')}>← Back to Pages</button>
              <h2>Preview: {currentPage.name}</h2>
            </div>
            <Renderer
              components={currentPage.canvasJson?.components || []}
              isDraft={currentPage.status === 'DRAFT'}
              pageName={currentPage.name}
              pageSlug={currentPage.slug}
            />
          </div>
        );

      default:
        return (
          <div className="pages-list">
            <div className="list-header">
              <h1>Pages</h1>
              <button onClick={handleCreatePage} className="btn-primary">
                Create New Page
              </button>
            </div>
            <div className="pages-grid">
              {pages.map(page => (
                <div key={page.id} className="page-card">
                  <h3>{page.name}</h3>
                  <p>Status: {page.status}</p>
                  <div className="page-actions">
                    <button onClick={() => handleEditPage(page)}>
                      Edit
                    </button>
                    <button onClick={() => handlePreviewPage(page)}>
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app">
      {renderContent()}
    </div>
  );
}

export default App;
```

### API Routes Example (Express.js)
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for demo (replace with database)
let pages = [];

// Get all pages
app.get('/api/pages', (req, res) => {
  res.json(pages);
});

// Get page by ID
app.get('/api/pages/:id', (req, res) => {
  const page = pages.find(p => p.id === req.params.id);
  if (!page) {
    return res.status(404).json({ error: 'Page not found' });
  }
  res.json(page);
});

// Create new page
app.post('/api/pages', (req, res) => {
  const { name, slug, title, canvasJson } = req.body;
  
  const newPage = {
    id: `page-${Date.now()}`,
    name: name || 'Untitled Page',
    slug: slug || `page-${Date.now()}`,
    title: title || 'Untitled',
    status: 'DRAFT',
    isHomePage: false,
    canvasJson: canvasJson || { components: [] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  pages.push(newPage);
  res.json(newPage);
});

// Update page
app.put('/api/pages/:id', (req, res) => {
  const pageIndex = pages.findIndex(p => p.id === req.params.id);
  
  if (pageIndex === -1) {
    return res.status(404).json({ error: 'Page not found' });
  }
  
  pages[pageIndex] = {
    ...pages[pageIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(pages[pageIndex]);
});

// Delete page
app.delete('/api/pages/:id', (req, res) => {
  const pageIndex = pages.findIndex(p => p.id === req.params.id);
  
  if (pageIndex === -1) {
    return res.status(404).json({ error: 'Page not found' });
  }
  
  pages.splice(pageIndex, 1);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Support

For questions, issues, or contributions:
- GitHub Issues: [Create an issue](https://github.com/hizidan/hizidan.com/issues)
- Documentation: [View docs](https://github.com/hizidan/hizidan.com/tree/main/packages/page-builder)
- Email: support@hizidan.com

## License

MIT License - see [LICENSE](https://github.com/hizidan/hizidan.com/blob/main/packages/page-builder/LICENSE) file for details.
