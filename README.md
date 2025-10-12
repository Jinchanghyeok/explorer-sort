# Explorer Sort

A powerful VS Code extension that allows you to sort files and folders with custom rules and reorder them using drag & drop.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## ✨ Features

### 🎯 Core Capabilities

- **Condition-Based Sorting**: Sort files/folders based on path patterns and custom conditions
- **Drag & Drop Reordering**: Intuitively reorder items by dragging and dropping
- **Automatic Configuration**: Priority settings are automatically saved on drop
- **Real-Time Sync**: Automatically detects and reflects file system changes
- **Internationalization**: Full support for Korean and English
- **Visual Feedback**: Cut files are displayed in gray for better visibility
- **Full File Operations**: Copy, cut, paste, rename, delete, duplicate, and more

### 🏗️ Perfect for Modern Architecture

Ideal for maintaining structured architectures like FSD (Feature-Sliced Design):

```json
{
  "explorerSort.rules": [
    {
      "name": "FSD Structure",
      "pathPattern": "**/src/**",
      "priorities": [
        { "condition": "name === 'app'", "priority": 1000 },
        { "condition": "name === 'pages'", "priority": 999 },
        { "condition": "name === 'widgets'", "priority": 998 },
        { "condition": "name === 'features'", "priority": 997 },
        { "condition": "name === 'entities'", "priority": 996 },
        { "condition": "name === 'shared'", "priority": 995 }
      ]
    }
  ]
}
```

## 📦 Installation

### For Development

1. Clone the repository:

```bash
git clone https://github.com/yourusername/explorer-sort.git
cd explorer-sort
```

2. Install dependencies:

```bash
npm install
```

3. Compile the extension:

```bash
npm run compile
```

4. Run in debug mode:

- Press `F5` (or go to `Run > Start Debugging`)
- A new VS Code window will open with the extension loaded

### For Users

*Coming soon to VS Code Marketplace*

## 🚀 Usage

### Basic Usage

1. Open a workspace in VS Code
2. Find the **{WorkspaceName}_SORT** view in the left sidebar
3. Drag and drop files/folders to reorder them
4. Settings are automatically saved to `.vscode/settings.json`

### Manual Configuration

Edit `.vscode/settings.json` in your workspace:

```json
{
  "explorerSort.rules": [
    {
      "name": "My Custom Rule",
      "pathPattern": "**/components/**",
      "priorities": [
        { "condition": "name.endsWith('.tsx')", "priority": 100 },
        { "condition": "name.endsWith('.css')", "priority": 50 }
      ]
    }
  ],
  "explorerSort.defaultSort": "name",
  "explorerSort.showHiddenFiles": true
}
```

## ⚙️ Configuration

| Setting                          | Type    | Default    | Description                                 |
| -------------------------------- | ------- | ---------- | ------------------------------------------- |
| `explorerSort.rules`           | Array   | `[]`     | Array of sorting rules                      |
| `explorerSort.defaultSort`     | String  | `"name"` | Default sorting method (name/type/modified) |
| `explorerSort.showHiddenFiles` | Boolean | `true`   | Show hidden files                           |

### Rule Structure

```typescript
{
  "name": "Rule Name",
  "pathPattern": "**/path/**",  // Glob pattern
  "priorities": [
    {
      "condition": "JavaScript expression",  // e.g., "name === 'app'"
      "priority": 1000  // Higher number = higher priority
    }
  ]
}
```

### Condition Expressions

Available expressions for priority conditions:

```javascript
// Exact name matching
"name === 'app'"

// Type matching
"type === 'directory'"

// String operations
"name.startsWith('test')"
"name.endsWith('.ts')"
"name.includes('component')"

// Regex matching
"/^[A-Z]/.test(name)"
```

## 🏗️ Project Structure

```
explorer-sort/
├── src/
│   ├── extension.ts              # Main entry point
│   ├── fileTreeProvider.ts       # File tree data provider
│   ├── sortEngine.ts             # Sorting logic engine
│   ├── configManager.ts          # Configuration management
│   ├── dragDropController.ts     # Drag & drop handling
│   ├── cutDecorationProvider.ts  # Visual feedback for cut files
│   ├── i18n.ts                   # Internationalization
│   └── types.ts                  # TypeScript type definitions
├── package.json                   # Extension manifest
├── tsconfig.json                  # TypeScript configuration
└── README.md
```

## 🛠️ Development

### Scripts

```bash
# Compile TypeScript to JavaScript
npm run compile

# Watch mode (auto-compile on save)
npm run watch

# Prepare for publishing
npm run vscode:prepublish
```

### Debug

1. Open the project in VS Code
2. Press `F5` to launch Extension Development Host
3. Test your changes in the new window
4. Use `console.log()` for debugging (check Debug Console)

### Adding New Features

1. **New Command**: Add to `package.json` contributes.commands and implement in `extension.ts`
2. **New Configuration**: Add to `package.json` contributes.configuration
3. **Localization**: Add translations to `package.nls.json` and `package.nls.ko.json`

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

1. **🐛 Report Bugs**

   - Check if the issue already exists
   - Provide clear reproduction steps
   - Include your VS Code version and OS
2. **💡 Suggest Features**

   - Open an issue with the `enhancement` label
   - Describe the use case and expected behavior
   - Explain how it would benefit users
3. **📝 Improve Documentation**

   - Fix typos or unclear explanations
   - Add examples and use cases
   - Translate to other languages
4. **💻 Submit Code**

   - Fork the repository
   - Create a feature branch (`git checkout -b feature/amazing-feature`)
   - Commit your changes (`git commit -m 'Add amazing feature'`)
   - Push to the branch (`git push origin feature/amazing-feature`)
   - Open a Pull Request

### Pull Request Guidelines

- ✅ Follow the existing code style
- ✅ Update documentation if needed
- ✅ Add/update translations for new strings
- ✅ Test your changes thoroughly
- ✅ Write clear commit messages

### Development Setup

```bash
# Fork and clone your fork
git clone https://github.com/YOUR-USERNAME/explorer-sort.git

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL-OWNER/explorer-sort.git

# Create a feature branch
git checkout -b feature/my-feature

# Make your changes and test
npm install
npm run compile
# Press F5 to test

# Commit and push
git commit -am "Add my feature"
git push origin feature/my-feature
```

## 📋 Roadmap

- [ ] Publish to VS Code Marketplace
- [ ] Add more sorting algorithms (by file size, by git status, etc.)
- [ ] Custom icon support for file types
- [ ] Workspace-specific sorting profiles
- [ ] Import/export sorting configurations
- [ ] Performance optimization for large projects
- [ ] Add unit tests and integration tests

## 🐛 Known Issues

- None yet! Please report any bugs you find.

## 📄 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 👥 Authors

- Jin Chang- *Initial work* -https://github.com/JinChangHyeok

## 🙏 Acknowledgments

- Inspired by VS Code's native Explorer
- Built with [VS Code Extension API](https://code.visualstudio.com/api)
- Uses [micromatch](https://github.com/micromatch/micromatch) for pattern matching

## 📞 Support

- 📧 Email: jinchang9807@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/Jinchanghyeok/explorer-sort/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Jinchanghyeok/explorer-sort/discussions)

---

**Made with ❤️ for the VS Code community**

If you find this extension helpful, please ⭐ star the repository!
