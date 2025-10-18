# Page Builder Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Package
```bash
npm install @ahmedzidan/page-builder
```

### 2. Basic Usage
```jsx
import { PageBuilder } from '@ahmedzidan/page-builder';

function MyApp() {
  const handleSave = (data) => {
    console.log('Save this:', data);
    // POST to your API endpoint
  };

  return (
    <PageBuilder
      pageId="my-page-123"
      initialComponents={[]}
      onSave={handleSave}
      onBack={() => console.log('Go back')}
      pageName="My Page"
      pageSlug="my-page"
      brandColors={['#3B82F6', '#EF4444']}
    />
  );
}
```

## 📊 Data Structure

### Page Data Format
```javascript
{
  pageId: "unique-id",
  components: [
    {
      id: "comp-1",
      type: "heading",
      content: "Hello World",
      styles: {
        fontSize: "2rem",
        color: "#333"
      },
      position: { x: 100, y: 50 },
      size: { width: 400, height: 60 }
    }
  ],
  metadata: {
    createdAt: "2024-01-15T10:30:00Z",
    author: "admin"
  }
}
```

## 🗄️ Database Setup

### SQL Schema
```sql
CREATE TABLE pages (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    slug VARCHAR(255),
    canvas_json JSON,
    status ENUM('DRAFT', 'PUBLISHED'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints
```javascript
// Save page
POST /api/pages/:id
{
  "components": [...],
  "metadata": {...}
}

// Load page
GET /api/pages/:id
Response: { id, name, canvas_json, ... }
```

## 🎨 Component Types

| Type | Use Case | Example |
|------|----------|---------|
| `heading` | Page titles | "Welcome to Our Site" |
| `text` | Paragraphs | "Lorem ipsum..." |
| `button` | CTAs | "Get Started" |
| `image` | Photos/graphics | Logo, banner |
| `container` | Layout wrapper | Column sections |
| `form-input` | User input | Name, email fields |

## 🔧 Common Configurations

### Auto-save
```jsx
<PageBuilder
  autoSave={{
    enabled: true,
    interval: 30000, // 30 seconds
    onSave: (data) => fetch('/api/autosave', { method: 'POST', body: JSON.stringify(data) })
  }}
/>
```

### Custom Styling
```jsx
<PageBuilder
  theme={{
    colors: { primary: '#8B5CF6', secondary: '#64748B' },
    fonts: { heading: 'Inter, sans-serif' }
  }}
/>
```

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| Components not loading | Check dependencies: `react-colorful`, `lucide-react`, `@heroicons/react` |
| Save not working | Verify `onSave` callback returns Promise |
| Styling issues | Check CSS conflicts, use `!important` if needed |
| Import errors | Ensure all peer dependencies installed |

## 📝 Example API Implementation

### Express.js
```javascript
// Save page
app.post('/api/pages/:id', (req, res) => {
  const { components, metadata } = req.body;
  
  // Save to database
  db.pages.update(req.params.id, {
    canvas_json: { components, metadata },
    updated_at: new Date()
  });
  
  res.json({ success: true });
});

// Load page
app.get('/api/pages/:id', (req, res) => {
  const page = db.pages.findById(req.params.id);
  res.json(page);
});
```

### React Integration
```jsx
function PageEditor({ pageId }) {
  const [page, setPage] = useState(null);

  useEffect(() => {
    fetch(`/api/pages/${pageId}`)
      .then(res => res.json())
      .then(setPage);
  }, [pageId]);

  const handleSave = async (data) => {
    await fetch(`/api/pages/${pageId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  };

  return (
    <PageBuilder
      pageId={pageId}
      initialComponents={page?.canvas_json?.components || []}
      onSave={handleSave}
      onBack={() => window.history.back()}
      pageName={page?.name}
    />
  );
}
```

## 🎯 Key Features Checklist

- ✅ Drag & drop interface
- ✅ Component library (text, images, buttons, forms)
- ✅ Responsive design tools
- ✅ Custom styling controls
- ✅ Grid system & alignment
- ✅ Device preview (mobile/tablet/desktop)
- ✅ Keyboard shortcuts
- ✅ Auto-save functionality
- ✅ Export to JSON/Database

## 📞 Need Help?

- 📖 Full docs: `PAGE_BUILDER_DOCUMENTATION.md`
- 🐛 Issues: Create GitHub issue
- 💬 Support: support@hizidan.com

---
*This guide covers the essentials. For advanced usage, see the full documentation.*
