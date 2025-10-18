# Page Builder Integration Examples

## Table of Contents
1. [Complete React App Integration](#complete-react-app-integration)
2. [Next.js Integration](#nextjs-integration)
3. [Express.js Backend](#expressjs-backend)
4. [NestJS Backend](#nestjs-backend)
5. [MongoDB Integration](#mongodb-integration)
6. [PostgreSQL Integration](#postgresql-integration)
7. [File-based Storage](#file-based-storage)
8. [Authentication Integration](#authentication-integration)
9. [Multi-tenant Setup](#multi-tenant-setup)
10. [Advanced Features](#advanced-features)

## Complete React App Integration

### App Structure
```
src/
├── components/
│   ├── PageBuilder/
│   │   ├── PageBuilderWrapper.jsx
│   │   └── PageRenderer.jsx
│   ├── Layout/
│   │   ├── Header.jsx
│   │   └── Sidebar.jsx
│   └── Common/
│       ├── Loading.jsx
│       └── ErrorBoundary.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── PagesList.jsx
│   ├── PageEditor.jsx
│   └── PageViewer.jsx
├── services/
│   ├── api.js
│   └── storage.js
├── hooks/
│   ├── usePages.js
│   └── usePageBuilder.js
└── App.jsx
```

### Main App Component
```jsx
// App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PageProvider } from './contexts/PageContext';
import Dashboard from './pages/Dashboard';
import PagesList from './pages/PagesList';
import PageEditor from './pages/PageEditor';
import PageViewer from './pages/PageViewer';
import ErrorBoundary from './components/Common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <PageProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pages" element={<PagesList />} />
              <Route path="/pages/:id/edit" element={<PageEditor />} />
              <Route path="/pages/:id/view" element={<PageViewer />} />
            </Routes>
          </div>
        </Router>
      </PageProvider>
    </ErrorBoundary>
  );
}

export default App;
```

### Page Context
```jsx
// contexts/PageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { pageService } from '../services/api';

const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPages = async () => {
    setLoading(true);
    try {
      const data = await pageService.getAll();
      setPages(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPage = async (pageData) => {
    try {
      const newPage = await pageService.create(pageData);
      setPages(prev => [...prev, newPage]);
      return newPage;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updatePage = async (id, updates) => {
    try {
      const updatedPage = await pageService.update(id, updates);
      setPages(prev => prev.map(p => p.id === id ? updatedPage : p));
      return updatedPage;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deletePage = async (id) => {
    try {
      await pageService.delete(id);
      setPages(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  return (
    <PageContext.Provider value={{
      pages,
      loading,
      error,
      loadPages,
      createPage,
      updatePage,
      deletePage
    }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePages = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePages must be used within PageProvider');
  }
  return context;
};
```

### Page Editor Component
```jsx
// pages/PageEditor.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageBuilder } from '@hizidan/page-builder';
import { usePages } from '../contexts/PageContext';
import Loading from '../components/Common/Loading';

function PageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pages, updatePage } = usePages();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const currentPage = pages.find(p => p.id === id);
    if (currentPage) {
      setPage(currentPage);
      setLoading(false);
    }
  }, [id, pages]);

  const handleSave = async (pageData) => {
    setSaving(true);
    try {
      await updatePage(id, {
        canvasJson: pageData,
        updatedAt: new Date().toISOString()
      });
      
      // Show success notification
      console.log('Page saved successfully');
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/pages');
  };

  if (loading) {
    return <Loading />;
  }

  if (!page) {
    return (
      <div className="error-page">
        <h2>Page not found</h2>
        <button onClick={handleBack}>Back to Pages</button>
      </div>
    );
  }

  return (
    <div className="page-editor">
      {saving && (
        <div className="save-indicator">
          Saving...
        </div>
      )}
      
      <PageBuilder
        pageId={page.id}
        initialComponents={page.canvasJson?.components || []}
        onSave={handleSave}
        onBack={handleBack}
        pageName={page.name}
        pageSlug={page.slug}
        brandColors={['#3B82F6', '#EF4444', '#10B981', '#F59E0B']}
        autoSave={{
          enabled: true,
          interval: 30000,
          onSave: handleSave
        }}
      />
    </div>
  );
}

export default PageEditor;
```

### API Service
```jsx
// services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Pages API
  async getAll() {
    return this.request('/pages');
  }

  async getById(id) {
    return this.request(`/pages/${id}`);
  }

  async create(data) {
    return this.request('/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id, data) {
    return this.request(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id) {
    return this.request(`/pages/${id}`, {
      method: 'DELETE',
    });
  }
}

export const pageService = new ApiService();
```

## Next.js Integration

### Next.js App Structure
```
pages/
├── api/
│   └── pages/
│       ├── index.js
│       ├── [id].js
│       └── [id]/save.js
├── admin/
│   ├── pages/
│   │   ├── index.js
│   │   ├── [id]/edit.js
│   │   └── new.js
│   └── dashboard.js
├── [slug].js
└── _app.js

components/
├── PageBuilder/
│   ├── PageBuilderWrapper.jsx
│   └── PageRenderer.jsx
└── Layout/
    └── AdminLayout.jsx
```

### API Routes
```javascript
// pages/api/pages/index.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const pages = await prisma.page.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, slug, title, canvasJson } = req.body;
      
      const page = await prisma.page.create({
        data: {
          name,
          slug,
          title,
          canvasJson: canvasJson || { components: [] },
          status: 'DRAFT'
        }
      });
      
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// pages/api/pages/[id].js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const page = await prisma.page.findUnique({
        where: { id }
      });
      
      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }
      
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const page = await prisma.page.update({
        where: { id },
        data: {
          ...req.body,
          updatedAt: new Date()
        }
      });
      
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.page.delete({
        where: { id }
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
```

### Page Editor (Next.js)
```jsx
// pages/admin/pages/[id]/edit.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Dynamic import to avoid SSR issues
const PageBuilder = dynamic(() => import('@hizidan/page-builder'), {
  ssr: false,
  loading: () => <div>Loading page builder...</div>
});

export default function PageEditor() {
  const router = useRouter();
  const { id } = router.query;
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPage();
    }
  }, [id]);

  const loadPage = async () => {
    try {
      const response = await fetch(`/api/pages/${id}`);
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
      await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canvasJson: pageData,
          updatedAt: new Date().toISOString()
        })
      });
      
      console.log('Page saved successfully');
    } catch (error) {
      console.error('Failed to save page:', error);
    }
  };

  const handleBack = () => {
    router.push('/admin/pages');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!page) {
    return <div>Page not found</div>;
  }

  return (
    <>
      <Head>
        <title>Edit {page.name}</title>
      </Head>
      
      <PageBuilder
        pageId={page.id}
        initialComponents={page.canvasJson?.components || []}
        onSave={handleSave}
        onBack={handleBack}
        pageName={page.name}
        pageSlug={page.slug}
        brandColors={['#3B82F6', '#EF4444', '#10B981']}
      />
    </>
  );
}
```

### Dynamic Page Rendering
```jsx
// pages/[slug].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const Renderer = dynamic(() => import('@hizidan/page-builder').then(mod => ({ default: mod.Renderer })), {
  ssr: false,
  loading: () => <div>Loading page...</div>
});

export default function DynamicPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadPage();
    }
  }, [slug]);

  const loadPage = async () => {
    try {
      const response = await fetch(`/api/pages/slug/${slug}?status=published`);
      const pageData = await response.json();
      setPage(pageData);
    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!page) {
    return <div>Page not found</div>;
  }

  return (
    <>
      <Head>
        <title>{page.title}</title>
        <meta name="description" content={page.description} />
      </Head>
      
      <div className="page-container">
        <Renderer
          components={page.canvasJson?.components || []}
          isDraft={false}
          pageName={page.name}
          pageSlug={page.slug}
        />
      </div>
    </>
  );
}
```

## Express.js Backend

### Complete Express Server
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Verify JWT token here
  // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  //   if (err) return res.status(403).json({ error: 'Invalid token' });
  //   req.user = user;
  //   next();
  // });
  
  // For demo purposes, just pass through
  req.user = { id: 'user-1' };
  next();
};

// Routes
app.get('/api/pages', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    const where = status ? { status } : {};
    
    const pages = await prisma.page.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pages/:id', async (req, res) => {
  try {
    const page = await prisma.page.findUnique({
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

app.get('/api/pages/slug/:slug', async (req, res) => {
  try {
    const { includeHidden = false } = req.query;
    
    const page = await prisma.page.findFirst({
      where: {
        slug: req.params.slug,
        status: includeHidden ? undefined : 'PUBLISHED'
      }
    });
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pages', authenticateToken, async (req, res) => {
  try {
    const { name, slug, title, description, canvasJson } = req.body;
    
    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug }
    });
    
    if (existingPage) {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    
    const page = await prisma.page.create({
      data: {
        name,
        slug,
        title,
        description,
        canvasJson: canvasJson || { components: [] },
        status: 'DRAFT',
        authorId: req.user.id
      }
    });
    
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/pages/:id', authenticateToken, async (req, res) => {
  try {
    const { name, slug, title, description, canvasJson, status } = req.body;
    
    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existingPage) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    // Check if new slug conflicts with existing pages
    if (slug && slug !== existingPage.slug) {
      const slugConflict = await prisma.page.findUnique({
        where: { slug }
      });
      
      if (slugConflict) {
        return res.status(400).json({ error: 'Slug already exists' });
      }
    }
    
    const page = await prisma.page.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(title && { title }),
        ...(description && { description }),
        ...(canvasJson && { canvasJson }),
        ...(status && { status }),
        updatedAt: new Date()
      }
    });
    
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/pages/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.page.delete({
      where: { id: req.params.id }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-save endpoint
app.post('/api/pages/:id/autosave', authenticateToken, async (req, res) => {
  try {
    const { canvasJson } = req.body;
    
    await prisma.page.update({
      where: { id: req.params.id },
      data: {
        canvasJson,
        updatedAt: new Date()
      }
    });
    
    res.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

## NestJS Backend

### Pages Module
```typescript
// pages.module.ts
import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
```

### Pages Service
```typescript
// pages.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async create(createPageDto: CreatePageDto, userId: string) {
    const { slug } = createPageDto;
    
    // Check if slug already exists
    const existingPage = await this.prisma.page.findUnique({
      where: { slug }
    });
    
    if (existingPage) {
      throw new ConflictException('Slug already exists');
    }
    
    return this.prisma.page.create({
      data: {
        ...createPageDto,
        authorId: userId,
        status: createPageDto.status || 'DRAFT'
      }
    });
  }

  async findAll(filters: {
    status?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { status, authorId, limit = 50, offset = 0 } = filters;
    
    const where: any = {};
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;
    
    return this.prisma.page.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    
    return page;
  }

  async findBySlug(slug: string, includeHidden = false) {
    const page = await this.prisma.page.findFirst({
      where: {
        slug,
        status: includeHidden ? undefined : 'PUBLISHED'
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    
    return page;
  }

  async update(id: string, updatePageDto: UpdatePageDto, userId: string) {
    // Check if page exists
    const existingPage = await this.prisma.page.findUnique({
      where: { id }
    });
    
    if (!existingPage) {
      throw new NotFoundException('Page not found');
    }
    
    // Check if new slug conflicts
    if (updatePageDto.slug && updatePageDto.slug !== existingPage.slug) {
      const slugConflict = await this.prisma.page.findUnique({
        where: { slug: updatePageDto.slug }
      });
      
      if (slugConflict) {
        throw new ConflictException('Slug already exists');
      }
    }
    
    return this.prisma.page.update({
      where: { id },
      data: {
        ...updatePageDto,
        updatedAt: new Date()
      }
    });
  }

  async remove(id: string, userId: string) {
    const page = await this.prisma.page.findUnique({
      where: { id }
    });
    
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    
    // Check if user owns the page
    if (page.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own pages');
    }
    
    return this.prisma.page.delete({
      where: { id }
    });
  }

  async autosave(id: string, canvasJson: any, userId: string) {
    const page = await this.prisma.page.findUnique({
      where: { id }
    });
    
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    
    return this.prisma.page.update({
      where: { id },
      data: {
        canvasJson,
        updatedAt: new Date()
      }
    });
  }
}
```

### Pages Controller
```typescript
// pages.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPageDto: CreatePageDto, @Request() req) {
    return this.pagesService.create(createPageDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('authorId') authorId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.pagesService.findAll({
      status,
      authorId,
      limit: limit ? parseInt(limit.toString()) : undefined,
      offset: offset ? parseInt(offset.toString()) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(
    @Param('slug') slug: string,
    @Query('includeHidden') includeHidden?: boolean,
  ) {
    return this.pagesService.findBySlug(slug, includeHidden);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
    @Request() req,
  ) {
    return this.pagesService.update(id, updatePageDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.pagesService.remove(id, req.user.id);
  }

  @Post(':id/autosave')
  @UseGuards(JwtAuthGuard)
  autosave(
    @Param('id') id: string,
    @Body('canvasJson') canvasJson: any,
    @Request() req,
  ) {
    return this.pagesService.autosave(id, canvasJson, req.user.id);
  }
}
```

### DTOs
```typescript
// dto/create-page.dto.ts
import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export class CreatePageDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  canvasJson?: any;

  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED'])
  status?: 'DRAFT' | 'PUBLISHED';
}

// dto/update-page.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePageDto } from './create-page.dto';

export class UpdatePageDto extends PartialType(CreatePageDto) {}
```

## MongoDB Integration

### MongoDB Schema
```javascript
// models/Page.js
const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  content: String,
  styles: mongoose.Schema.Types.Mixed,
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  size: {
    width: { type: mongoose.Schema.Types.Mixed, default: 'auto' },
    height: { type: mongoose.Schema.Types.Mixed, default: 'auto' }
  },
  props: mongoose.Schema.Types.Mixed,
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Component' }]
});

const pageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['DRAFT', 'PUBLISHED'], 
    default: 'DRAFT' 
  },
  isHomePage: { type: Boolean, default: false },
  canvasJson: {
    version: { type: String, default: '1.0' },
    components: [componentSchema],
    metadata: {
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      author: String,
      version: { type: Number, default: 1 }
    }
  },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String]
  }
}, {
  timestamps: true
});

// Indexes
pageSchema.index({ slug: 1 });
pageSchema.index({ status: 1 });
pageSchema.index({ authorId: 1 });
pageSchema.index({ 'canvasJson.metadata.createdAt': -1 });

module.exports = mongoose.model('Page', pageSchema);
```

### MongoDB Service
```javascript
// services/pageService.js
const Page = require('../models/Page');

class PageService {
  async create(pageData, userId) {
    const page = new Page({
      ...pageData,
      authorId: userId,
      'canvasJson.metadata.author': userId
    });
    
    return await page.save();
  }

  async findAll(filters = {}) {
    const { status, authorId, limit = 50, offset = 0 } = filters;
    
    const query = {};
    if (status) query.status = status;
    if (authorId) query.authorId = authorId;
    
    return await Page.find(query)
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
  }

  async findById(id) {
    return await Page.findById(id).populate('authorId', 'name email');
  }

  async findBySlug(slug, includeHidden = false) {
    const query = { slug };
    if (!includeHidden) {
      query.status = 'PUBLISHED';
    }
    
    return await Page.findOne(query).populate('authorId', 'name email');
  }

  async update(id, updates, userId) {
    const page = await Page.findById(id);
    
    if (!page) {
      throw new Error('Page not found');
    }
    
    if (page.authorId.toString() !== userId) {
      throw new Error('Unauthorized');
    }
    
    // Update canvas metadata
    if (updates.canvasJson) {
      updates.canvasJson = {
        ...updates.canvasJson,
        metadata: {
          ...updates.canvasJson.metadata,
          updatedAt: new Date(),
          version: (page.canvasJson?.metadata?.version || 0) + 1
        }
      };
    }
    
    return await Page.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  }

  async delete(id, userId) {
    const page = await Page.findById(id);
    
    if (!page) {
      throw new Error('Page not found');
    }
    
    if (page.authorId.toString() !== userId) {
      throw new Error('Unauthorized');
    }
    
    return await Page.findByIdAndDelete(id);
  }

  async autosave(id, canvasJson, userId) {
    const page = await Page.findById(id);
    
    if (!page) {
      throw new Error('Page not found');
    }
    
    if (page.authorId.toString() !== userId) {
      throw new Error('Unauthorized');
    }
    
    page.canvasJson = {
      ...canvasJson,
      metadata: {
        ...canvasJson.metadata,
        updatedAt: new Date(),
        version: (page.canvasJson?.metadata?.version || 0) + 1
      }
    };
    
    return await page.save();
  }
}

module.exports = new PageService();
```

## PostgreSQL Integration

### Prisma Schema
```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      UserRole @default(USER)
  pages     Page[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Page {
  id          String     @id @default(uuid())
  name        String
  slug        String     @unique
  title       String
  description String?
  status      PageStatus @default(DRAFT)
  isHomePage  Boolean    @default(false)
  canvasJson  Json?
  metadata    Json?
  authorId    String
  author      User       @relation(fields: [authorId], references: [id], onDelete: Cascade)
  tags        String[]
  seo         Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("pages")
  @@index([slug])
  @@index([status])
  @@index([authorId])
}

enum UserRole {
  USER
  ADMIN
}

enum PageStatus {
  DRAFT
  PUBLISHED
}
```

### Prisma Service
```typescript
// prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

## File-based Storage

### File Storage Service
```javascript
// services/fileStorage.js
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FileStorageService {
  constructor(baseDir = './storage/pages') {
    this.baseDir = baseDir;
    this.draftsDir = path.join(baseDir, 'drafts');
    this.publishedDir = path.join(baseDir, 'published');
    this.templatesDir = path.join(baseDir, 'templates');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.mkdir(this.draftsDir, { recursive: true });
    await fs.mkdir(this.publishedDir, { recursive: true });
    await fs.mkdir(this.templatesDir, { recursive: true });
  }

  async create(pageData) {
    const id = crypto.randomUUID();
    const page = {
      id,
      ...pageData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.savePage(page);
    return page;
  }

  async findAll(status = 'DRAFT') {
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
      
      return pages.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (error) {
      return [];
    }
  }

  async findById(id, status = 'DRAFT') {
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

  async findBySlug(slug, includeHidden = false) {
    const statuses = includeHidden ? ['DRAFT', 'PUBLISHED'] : ['PUBLISHED'];
    
    for (const status of statuses) {
      const pages = await this.findAll(status);
      const page = pages.find(p => p.slug === slug);
      if (page) return page;
    }
    
    throw new Error('Page not found');
  }

  async update(id, updates) {
    const page = await this.findById(id);
    
    const updatedPage = {
      ...page,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.savePage(updatedPage);
    return updatedPage;
  }

  async delete(id) {
    const statuses = ['DRAFT', 'PUBLISHED'];
    
    for (const status of statuses) {
      const dir = status === 'PUBLISHED' ? this.publishedDir : this.draftsDir;
      const filePath = path.join(dir, `${id}.json`);
      
      try {
        await fs.unlink(filePath);
        return { success: true };
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }
    
    throw new Error('Page not found');
  }

  async savePage(page) {
    const dir = page.status === 'PUBLISHED' ? this.publishedDir : this.draftsDir;
    const filePath = path.join(dir, `${page.id}.json`);
    
    await fs.writeFile(filePath, JSON.stringify(page, null, 2));
  }

  async autosave(id, canvasJson) {
    const page = await this.findById(id);
    
    page.canvasJson = {
      ...canvasJson,
      metadata: {
        ...canvasJson.metadata,
        updatedAt: new Date().toISOString(),
        version: (page.canvasJson?.metadata?.version || 0) + 1
      }
    };
    page.updatedAt = new Date().toISOString();

    await this.savePage(page);
    return page;
  }

  async publish(id) {
    const page = await this.findById(id, 'DRAFT');
    
    // Remove from drafts
    await this.delete(id);
    
    // Add to published
    page.status = 'PUBLISHED';
    page.updatedAt = new Date().toISOString();
    
    await this.savePage(page);
    return page;
  }

  async unpublish(id) {
    const page = await this.findById(id, 'PUBLISHED');
    
    // Remove from published
    await this.delete(id);
    
    // Add to drafts
    page.status = 'DRAFT';
    page.updatedAt = new Date().toISOString();
    
    await this.savePage(page);
    return page;
  }
}

module.exports = FileStorageService;
```

## Authentication Integration

### JWT Authentication
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = { authenticateToken, requireRole };
```

### Role-based Access Control
```javascript
// routes/pages.js
const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const pageService = require('../services/pageService');

const router = express.Router();

// Public routes
router.get('/published/:slug', async (req, res) => {
  try {
    const page = await pageService.findBySlug(req.params.slug, false);
    res.json(page);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Protected routes
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const pages = await pageService.findAll({
      authorId: req.user.role === 'ADMIN' ? undefined : req.user.id
    });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const page = await pageService.create(req.body, req.user.id);
    res.json(page);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const page = await pageService.update(req.params.id, req.body, req.user.id);
    res.json(page);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin only routes
router.delete('/:id', requireRole(['ADMIN']), async (req, res) => {
  try {
    await pageService.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

## Multi-tenant Setup

### Tenant-aware Service
```javascript
// services/multiTenantPageService.js
class MultiTenantPageService {
  constructor() {
    this.storage = new Map(); // In production, use Redis or database
  }

  getTenantStorage(tenantId) {
    if (!this.storage.has(tenantId)) {
      this.storage.set(tenantId, new FileStorageService(`./storage/${tenantId}/pages`));
    }
    return this.storage.get(tenantId);
  }

  async create(tenantId, pageData, userId) {
    const storage = this.getTenantStorage(tenantId);
    return await storage.create({
      ...pageData,
      tenantId,
      authorId: userId
    });
  }

  async findAll(tenantId, filters = {}) {
    const storage = this.getTenantStorage(tenantId);
    const pages = await storage.findAll(filters.status);
    
    return pages.filter(page => page.tenantId === tenantId);
  }

  async findById(tenantId, id, status = 'DRAFT') {
    const storage = this.getTenantStorage(tenantId);
    const page = await storage.findById(id, status);
    
    if (page.tenantId !== tenantId) {
      throw new Error('Page not found');
    }
    
    return page;
  }

  async update(tenantId, id, updates, userId) {
    const storage = this.getTenantStorage(tenantId);
    const page = await storage.findById(id);
    
    if (page.tenantId !== tenantId) {
      throw new Error('Page not found');
    }
    
    if (page.authorId !== userId) {
      throw new Error('Unauthorized');
    }
    
    return await storage.update(id, updates);
  }

  async delete(tenantId, id, userId) {
    const storage = this.getTenantStorage(tenantId);
    const page = await storage.findById(id);
    
    if (page.tenantId !== tenantId) {
      throw new Error('Page not found');
    }
    
    if (page.authorId !== userId) {
      throw new Error('Unauthorized');
    }
    
    return await storage.delete(id);
  }
}

module.exports = new MultiTenantPageService();
```

### Tenant Middleware
```javascript
// middleware/tenant.js
const getTenantFromRequest = (req) => {
  // Extract tenant from subdomain
  const host = req.get('host');
  const subdomain = host.split('.')[0];
  
  // Or extract from header
  // const tenantId = req.get('X-Tenant-ID');
  
  // Or extract from JWT token
  // const tenantId = req.user?.tenantId;
  
  return subdomain;
};

const tenantMiddleware = (req, res, next) => {
  const tenantId = getTenantFromRequest(req);
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID required' });
  }
  
  req.tenantId = tenantId;
  next();
};

module.exports = { tenantMiddleware, getTenantFromRequest };
```

## Advanced Features

### Real-time Collaboration
```javascript
// services/collaborationService.js
const EventEmitter = require('events');
const WebSocket = require('ws');

class CollaborationService extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map(); // pageId -> Set of connections
    this.userSessions = new Map(); // connection -> user info
  }

  addConnection(ws, pageId, userId) {
    if (!this.connections.has(pageId)) {
      this.connections.set(pageId, new Set());
    }
    
    this.connections.get(pageId).add(ws);
    this.userSessions.set(ws, { userId, pageId });
    
    // Notify others that user joined
    this.broadcastToPage(pageId, {
      type: 'user_joined',
      userId,
      timestamp: new Date().toISOString()
    }, ws);
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(ws, message);
      } catch (error) {
        console.error('Invalid message:', error);
      }
    });
    
    ws.on('close', () => {
      this.removeConnection(ws, pageId);
    });
  }

  handleMessage(ws, message) {
    const session = this.userSessions.get(ws);
    if (!session) return;

    const { type, data } = message;
    
    switch (type) {
      case 'component_update':
        this.broadcastToPage(session.pageId, {
          type: 'component_updated',
          componentId: data.componentId,
          updates: data.updates,
          userId: session.userId,
          timestamp: new Date().toISOString()
        }, ws);
        break;
        
      case 'cursor_move':
        this.broadcastToPage(session.pageId, {
          type: 'cursor_moved',
          position: data.position,
          userId: session.userId,
          timestamp: new Date().toISOString()
        }, ws);
        break;
    }
  }

  broadcastToPage(pageId, message, excludeWs = null) {
    const connections = this.connections.get(pageId);
    if (!connections) return;

    connections.forEach(ws => {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  removeConnection(ws, pageId) {
    const session = this.userSessions.get(ws);
    if (!session) return;

    const connections = this.connections.get(pageId);
    if (connections) {
      connections.delete(ws);
      
      if (connections.size === 0) {
        this.connections.delete(pageId);
      } else {
        // Notify others that user left
        this.broadcastToPage(pageId, {
          type: 'user_left',
          userId: session.userId,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    this.userSessions.delete(ws);
  }
}

module.exports = new CollaborationService();
```

### Version History
```javascript
// services/versionService.js
class VersionService {
  constructor(storageService) {
    this.storage = storageService;
    this.versionDir = './storage/versions';
  }

  async saveVersion(pageId, canvasJson, userId, comment = '') {
    const versionId = crypto.randomUUID();
    const version = {
      id: versionId,
      pageId,
      canvasJson,
      userId,
      comment,
      createdAt: new Date().toISOString()
    };

    const versionPath = path.join(this.versionDir, `${pageId}`, `${versionId}.json`);
    await fs.mkdir(path.dirname(versionPath), { recursive: true });
    await fs.writeFile(versionPath, JSON.stringify(version, null, 2));

    return version;
  }

  async getVersions(pageId) {
    const versionsDir = path.join(this.versionDir, pageId);
    
    try {
      const files = await fs.readdir(versionsDir);
      const versions = await Promise.all(
        files
          .filter(file => file.endsWith('.json'))
          .map(async (file) => {
            const data = await fs.readFile(path.join(versionsDir, file), 'utf8');
            return JSON.parse(data);
          })
      );
      
      return versions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      return [];
    }
  }

  async restoreVersion(pageId, versionId, userId) {
    const versionPath = path.join(this.versionDir, pageId, `${versionId}.json`);
    
    try {
      const versionData = await fs.readFile(versionPath, 'utf8');
      const version = JSON.parse(versionData);
      
      // Update the page with version data
      const updatedPage = await this.storage.update(pageId, {
        canvasJson: version.canvasJson,
        updatedAt: new Date().toISOString()
      });
      
      // Save current state as a new version
      await this.saveVersion(pageId, version.canvasJson, userId, `Restored from version ${versionId}`);
      
      return updatedPage;
    } catch (error) {
      throw new Error('Version not found');
    }
  }
}

module.exports = VersionService;
```

### Performance Optimization
```javascript
// services/cacheService.js
const Redis = require('redis');

class CacheService {
  constructor() {
    this.redis = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    this.redis.on('error', (err) => console.error('Redis error:', err));
  }

  async get(key) {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key) {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidatePage(pageId) {
    const patterns = [
      `page:${pageId}`,
      `page:${pageId}:*`,
      'pages:list:*'
    ];
    
    for (const pattern of patterns) {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }
  }
}

module.exports = new CacheService();
```

---

This comprehensive integration guide covers various backend implementations, authentication patterns, multi-tenancy, and advanced features. Choose the approach that best fits your project requirements and scale.
