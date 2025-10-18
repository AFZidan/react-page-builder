# Page Builder Guide

## Overview
Your website now has a powerful custom page builder that allows you to control the design of any page, including the home page, directly from the admin panel.

## How to Control the Home Page Design

### Step 1: Access the Admin Panel
1. Go to `http://localhost:3000/admin/login`
2. Log in with your admin credentials
3. Navigate to **Pages** in the sidebar

### Step 2: Create a New Page
1. Click the **"New Page"** button
2. Fill in the page details:
   - **Name**: Internal name (e.g., "New Home Page")
   - **Slug**: URL path (e.g., "home" or any slug you want)
   - **Title**: SEO title for the page
   - **Description**: SEO description (optional)
3. Click **"Create Page"**

### Step 3: Design Your Page
You'll be redirected to the **Page Builder** where you can:

#### Available Components:
- **📝 Heading**: Add titles and headlines
- **📄 Text**: Add paragraphs with Markdown support
  - Markdown features: `**bold**`, `*italic*`, `[links](url)`, lists, code, etc.
- **🔘 Button**: Add clickable buttons with custom links
- **🖼️ Image**: Add images by URL
- **➖ Divider**: Add horizontal dividers
- **⬜ Spacer**: Add vertical spacing

#### How to Build:
1. **Add Components**: Click any component in the left sidebar to add it to your page
2. **Edit Components**: Click on a component in the canvas to select it
   - Edit content, links, images in the **Properties Panel** (right sidebar)
   - Customize CSS classes using Tailwind CSS
3. **Reorder Components**: 
   - Drag and drop components to reorder them
   - Or use the ↑/↓ buttons in the toolbar
4. **Component Actions** (hover over any component):
   - ↑ Move up
   - ↓ Move down
   - 📋 Duplicate
   - 🗑️ Delete
5. **Save**: Click the **"💾 Save"** button to save your changes

### Step 4: Set as Home Page
1. Go back to **Pages** in the admin sidebar
2. Find your newly created page in the list
3. Click **"Set as Home"** button in the "Home Page" column
4. Your page is now set as the home page!

### Step 5: Publish
1. Make sure your page is set to **PUBLISHED** status
2. Click **"Publish"** button if it's still in DRAFT status
3. Click **"Preview"** to see your new home page live at `/`

## Understanding DRAFT vs PUBLISHED

### DRAFT Pages:
- **Not visible** in the website navigation bar
- **Not accessible** to regular users (visitors will see "Page not available")
- **Only accessible** to admins/editors (you'll see a yellow warning banner)
- Perfect for working on pages before making them public
- Admins can preview and edit DRAFT pages

### PUBLISHED Pages:
- **Automatically appear** in the website navigation bar
- **Accessible** to all visitors
- Visible in the public navigation menu
- Ready for public viewing

### Navigation Bar Behavior:
- The navigation bar **dynamically loads** published pages from the database
- When you publish a page, it will **automatically appear** in the navigation
- When you unpublish (set to DRAFT), it will **automatically disappear** from navigation
- Home pages don't show in the nav (since "Home" link already exists)
- Custom pages appear after the default navigation items (Home, About, Process, Portfolio, Blog, Book Meeting)

## How the Home Page System Works

### Current Behavior:
- When you visit `/`, the system checks if there's a page marked as "Home Page" in the database
- If a home page exists and is published, it displays your custom page builder design
- If no home page is set in the builder, it falls back to the original static home page design
- Only ONE page can be set as the home page at a time
- Setting a new page as home automatically unsets the previous home page
- DRAFT home pages are only visible to admins (with a warning banner)

### Migrating Your Current Design:
To replicate your current home page design in the page builder:

1. **Take screenshots** of your current homepage sections
2. **Create a new page** in the builder
3. **Add components** to match your current design:
   - Add a heading for "Hi, I'm Zidan"
   - Add a second heading for "Software Engineer & Tech Enthusiast"
   - Add text for the description
   - Add a button for "Say Hello!"
   - Continue building each section
4. **Style with Tailwind CSS**:
   - For large headings: `text-4xl font-bold mb-4`
   - For body text: `text-lg mb-4`
   - For buttons: `btn btn-primary`
   - For containers: `container mx-auto px-4 py-12`

## Advanced Features

### Markdown in Text Components
Text components support full Markdown syntax:
```markdown
**Bold text**
*Italic text*
[Link text](https://example.com)
# Heading 1
## Heading 2
- List item
1. Numbered item
`inline code`
> Blockquote
```

### Custom CSS Classes
You can use any Tailwind CSS class in the "CSS Classes" field:
- Typography: `text-xl`, `text-2xl`, `font-bold`, `font-semibold`
- Colors: `text-gray-600`, `text-primary`, `bg-primary`
- Spacing: `mb-4`, `mt-8`, `px-4`, `py-12`
- Layout: `container`, `mx-auto`, `flex`, `grid`
- Responsive: `md:text-4xl`, `lg:px-8`

### Tips for Best Results
1. **Save frequently**: Click Save after major changes
2. **Preview before publishing**: Use the Preview button to check your design
3. **Use the existing home page as reference**: Keep it open while you build
4. **Mobile responsive**: Test your design on different screen sizes
5. **Start simple**: Begin with basic components, then enhance
6. **Use consistent styling**: Apply similar CSS classes to related components

## Troubleshooting

### Home page not updating?
- Make sure the page is **Published** (not DRAFT)
- Make sure **"Set as Home"** is clicked (you'll see 🏠 HOME badge)
- Clear your browser cache and refresh
- Check the console for any errors

### Components not showing?
- Make sure you've added components from the left sidebar
- Click Save after adding components
- Check that components have content

### Styling not working?
- Verify Tailwind CSS class names are correct
- Use multiple classes separated by spaces
- Check the browser console for errors

## Support
If you encounter any issues or need help with the page builder, check the browser console for error messages and verify all steps above are completed correctly.

