# Page Builder Package - Quick Reference

## 📦 Package Location

```
/var/www/Zidan/hizidan.com/packages/page-builder/
```

## 📁 Package Structure

```
packages/page-builder/
├── package.json           # Package metadata and dependencies
├── vite.config.js         # Build configuration
├── README.md             # Full documentation
├── LICENSE               # MIT License
├── .npmignore           # Files to exclude from npm
├── PACKAGE_INFO.md      # This file
└── src/
    ├── index.jsx         # Main export file
    ├── PageBuilder.jsx   # Main builder component
    ├── Renderer.jsx      # Public page renderer
    └── components/       # Builder UI components
        ├── ContextMenu.jsx
        ├── StyleControls.jsx
        ├── IconPicker.jsx
        ├── EmbedHelper.jsx
        └── DynamicIcon.jsx
```

## 🚀 Current Status

✅ **Package Created** - All files copied and ready
❌ **Not Built Yet** - Need to run `npm install` and `npm run build`
❌ **Not Published** - Not yet published to npmjs.com
✅ **Original App Working** - Your current app continues to work normally

## 🔨 To Build the Package

```bash
# Navigate to package directory
cd /var/www/Zidan/hizidan.com/packages/page-builder

# Install dependencies
npm install

# Build the package
npm run build

# The built files will be in dist/
```

## 📤 To Publish to NPM (When Ready)

```bash
# 1. Login to npm (first time only)
npm login

# 2. Test the package locally first
npm pack
# This creates a .tgz file you can test

# 3. Publish to npm
npm publish --access public

# 4. Update version for future releases
npm version patch  # or minor, or major
npm publish --access public
```

## 🧪 To Test Locally Before Publishing

```bash
# In the package directory
npm pack

# In another project
npm install /path/to/hizidan-page-builder-1.0.0.tgz
```

## 🔗 To Use in Your Current App (Optional)

If you want to test using the package in your own app:

```bash
# In your main app's package.json, add:
{
  "dependencies": {
    "@ahmedzidan/page-builder": "file:./packages/page-builder"
  }
}

# Then run:
npm install
```

## 📝 Important Notes

1. **Two Versions Exist:**
   - **Working Version**: `frontend/src/pages/admin/PageBuilder.jsx` (currently in use)
   - **Package Version**: `packages/page-builder/src/PageBuilder.jsx` (standalone copy)

2. **No Dependencies Between Them:**
   - Updating one doesn't affect the other
   - They're independent copies

3. **When to Sync:**
   - If you make improvements to the working version
   - Copy changes to package before publishing
   - Or vice versa if you improve the package

4. **Before Publishing:**
   - Test the build process
   - Update version number
   - Review README for accuracy
   - Test installation in a fresh project

## 🎯 Next Steps (Optional)

### Short Term
- [ ] Test build process (`npm run build`)
- [ ] Verify all components export correctly
- [ ] Test in a separate React project

### Medium Term
- [ ] Add TypeScript support
- [ ] Add unit tests
- [ ] Create demo/playground
- [ ] Add more documentation

### Long Term
- [ ] Publish to npm
- [ ] Create GitHub repository
- [ ] Set up CI/CD
- [ ] Build community

## 🐛 Known Limitations

1. **App-Specific Dependencies**: 
   - Currently imports from `../../lib/api`
   - Needs refactoring to use props instead

2. **Router Dependencies**:
   - Uses `useNavigate`, `useParams` from react-router
   - Should be replaced with prop-based callbacks

3. **Missing Types**:
   - No TypeScript definitions yet
   - Would benefit from `.d.ts` files

## 📚 Resources

- **Full Documentation**: See `README.md`
- **NPM Publishing Guide**: See `PAGE_BUILDER_NPM_PACKAGE_GUIDE.md` in project root
- **Feature List**: See `PAGE_BUILDER_ENHANCEMENTS_SUMMARY.md` in project root

## 💡 Tips

- Keep package and working version in sync manually
- Test builds locally before publishing
- Use semantic versioning (major.minor.patch)
- Document breaking changes in changelog
- Consider creating a separate Git repository for the package

---

**Package Version**: 1.0.0  
**Created**: 2025  
**License**: MIT  
**Author**: Zidan

