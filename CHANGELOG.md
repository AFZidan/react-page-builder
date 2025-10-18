# Changelog

All notable changes to the Page Builder package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-18

### Added

- Initial release of @ahmedzidan/page-builder
- Visual drag-and-drop page builder component
- 20+ built-in component types (text, images, forms, containers, etc.)
- Device preview with Mobile (375px), Tablet (768px), Desktop (1440px) presets
- Zoom control (50%-150%)
- 12-column Bootstrap grid overlay for alignment
- Full-width canvas mode
- Corner resize handles on all elements
- Auto-sizing containers that fit children automatically
- Smart snapping and magnetic alignment guides
- Right-click context menu with quick actions
- Keyboard shortcuts (Enter, Delete, Escape, Alt+Drag)
- Advanced styling controls:
  - Color pickers with brand color integration
  - Typography controls (font size, weight, family, line height)
  - Spacing controls (padding, margin)
  - Border controls (width, style, color, radius)
  - Shadow controls
  - Display controls
- Icon library integration (Heroicons + Lucide React)
- Embed support (YouTube, Google Maps, custom iframes)
- Form builder with validation
- HTML block support
- Markdown rendering for text components
- Inline text editing
- Properties panel with tabbed interface (Content/Style/Advanced)
- Drag-and-drop from component palette
- Visual feedback (borders, highlights, cursor changes)
- LocalStorage persistence for preferences
- Component duplication
- Bring to front/send to back
- Custom CSS field for advanced users

### Component Library

- **Layout**: Container, 2-Column Grid
- **Content**: Heading, Text, Button, Image
- **Spacing**: Divider, Spacer
- **Advanced**: HTML Block, Icon, Embed
- **Forms**: Form Container, Input, Textarea, Select, Checkbox, Radio Group, File Upload, Date Picker, Submit Button

### Features

- Drag elements from anywhere (not just handles)
- Auto-select on drag start
- Smart initial positioning (no overlaps)
- Container auto-resize on child add/move/resize
- Live width/height sync in properties panel
- Full-width mode (hide sidebars)
- Device preview presets
- Zoom control with visual scaling
- 12-column grid overlay (toggleable)
- Right-click context menu
- Persistent preferences (localStorage)

### Developer Experience

- Clean component API
- Prop-based configuration
- Minimal CSS dependencies
- TypeScript-ready structure
- Comprehensive documentation
- MIT licensed

[1.0.0]: https://github.com/AFZidan/react-page-builder/releases/tag/v1.0.0
