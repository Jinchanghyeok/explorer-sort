# Contributing to Explorer Sort

First off, thank you for considering contributing to Explorer Sort! It's people like you that make this extension better for everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code:

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome diverse perspectives and experiences
- **Be constructive**: Focus on what is best for the community
- **Be patient**: Remember that people have different skill levels

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **VS Code**: Latest stable version
- **Git**: For version control

### Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/explorer-sort.git
cd explorer-sort

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL-OWNER/explorer-sort.git

# Install dependencies
npm install
```

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When reporting bugs, include:**

- **Clear title**: Short, descriptive title
- **Reproduction steps**: Step-by-step instructions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**:
  - OS and version (e.g., macOS 14.0, Windows 11, Ubuntu 22.04)
  - VS Code version
  - Extension version
- **Screenshots/Videos**: If applicable
- **Error messages**: Copy from Developer Tools console

**Example:**

```markdown
## Bug: Drag and drop not working in nested folders

**Steps to reproduce:**
1. Open a workspace with nested folders (depth > 3)
2. Try to drag a file from level 4 to level 2
3. Nothing happens

**Expected:** File should move to the target folder
**Actual:** Drag operation fails silently

**Environment:**
- OS: macOS 14.0
- VS Code: 1.85.0
- Extension: 0.0.1

**Console Error:**
```
TypeError: Cannot read property 'path' of undefined
```
```

### 💡 Suggesting Enhancements

**When suggesting features, include:**

- **Use case**: Why is this needed?
- **Current behavior**: What happens now?
- **Proposed behavior**: What should happen?
- **Alternatives**: Have you considered other solutions?
- **Examples**: Show examples from other tools if applicable

**Example:**

```markdown
## Feature: Sort by Git status

**Use Case:** 
As a developer, I want to see modified files first so that I can focus on my current work.

**Proposed Behavior:**
Add a sort option "gitStatus" that orders files as:
1. Modified files
2. Untracked files
3. Unchanged files

**Alternative:**
Could use custom priorities, but a built-in option would be more convenient.

**Example:**
Similar to GitHub Desktop's file list ordering.
```

### 📝 Improving Documentation

Documentation improvements are always welcome!

- Fix typos and grammar
- Clarify unclear explanations
- Add more examples
- Translate to other languages
- Update outdated information

### 💻 Contributing Code

#### Types of Contributions

1. **Bug fixes**: Fix reported issues
2. **New features**: Add functionality discussed in issues
3. **Performance**: Optimize existing code
4. **Refactoring**: Improve code structure
5. **Tests**: Add or improve test coverage
6. **Localization**: Add translations

## 🛠️ Development Setup

### Initial Setup

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-compile)
npm run watch
```

### Testing Your Changes

1. **Run in Debug Mode**:
   - Open the project in VS Code
   - Press `F5` (or `Run > Start Debugging`)
   - A new VS Code window opens with your extension loaded

2. **Test Your Feature**:
   - In the Extension Development Host window
   - Open a workspace
   - Test your changes thoroughly
   - Check the Debug Console for logs

3. **Check for Errors**:
   - Open Developer Tools (`Help > Toggle Developer Tools`)
   - Check Console tab for JavaScript errors
   - Check Network tab if applicable

### Project Structure

```
src/
├── extension.ts           # Main entry point
├── fileTreeProvider.ts    # Tree view provider
├── sortEngine.ts          # Sorting logic
├── configManager.ts       # Configuration handling
├── dragDropController.ts  # Drag & drop logic
├── cutDecorationProvider.ts # Visual decorations
├── i18n.ts               # Internationalization
└── types.ts              # TypeScript types
```

### Key Files to Know

- **extension.ts**: Register commands and initialize providers
- **fileTreeProvider.ts**: Manage tree view data
- **sortEngine.ts**: Core sorting algorithm
- **package.json**: Extension manifest (commands, configuration, etc.)
- **package.nls.json**: English translations
- **package.nls.ko.json**: Korean translations

## 📋 Coding Guidelines

### TypeScript Style

```typescript
// ✅ Good: Clear, typed, documented
/**
 * Sorts files based on priority rules
 * @param files - Array of file items to sort
 * @param rules - Sorting rules to apply
 * @returns Sorted array of files
 */
function sortFiles(files: FileTreeItem[], rules: SortRule[]): FileTreeItem[] {
  return files.sort((a, b) => {
    const priorityA = calculatePriority(a, rules);
    const priorityB = calculatePriority(b, rules);
    return priorityB - priorityA;
  });
}

// ❌ Bad: Unclear, untyped, no documentation
function sort(f: any, r: any): any {
  return f.sort((a: any, b: any) => b.p - a.p);
}
```

### Code Style Rules

1. **Use TypeScript**: Always add type annotations
2. **Descriptive names**: Use clear, meaningful names
3. **Single responsibility**: Each function should do one thing
4. **Comments**: Explain "why", not "what"
5. **Error handling**: Always handle errors gracefully
6. **Avoid any**: Use proper types instead of `any`

### Formatting

We don't have a formatter configured yet, but follow these guidelines:

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Use them
- **Line length**: Try to keep under 100 characters
- **Trailing commas**: Use them in multi-line arrays/objects

### Example Code Style

```typescript
// ✅ Good
export class FileTreeProvider implements vscode.TreeDataProvider<FileTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<FileTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(
    private workspaceRoot: string,
    private configManager: ConfigManager
  ) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  async getChildren(element?: FileTreeItem): Promise<FileTreeItem[]> {
    if (!element) {
      return this.getWorkspaceRootItems();
    }
    return this.getChildItems(element);
  }
}

// ❌ Bad
export class FileTreeProvider implements vscode.TreeDataProvider<FileTreeItem> {
  private _onDidChangeTreeData=new vscode.EventEmitter<FileTreeItem|undefined>()
  readonly onDidChangeTreeData=this._onDidChangeTreeData.event
  constructor(private workspaceRoot:string,private configManager:ConfigManager){}
  refresh(){this._onDidChangeTreeData.fire(undefined)}
  async getChildren(element?:FileTreeItem):Promise<FileTreeItem[]>{
    if(!element)return this.getWorkspaceRootItems()
    return this.getChildItems(element)
  }
}
```

## 📝 Commit Guidelines

### Commit Message Format

Use conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes
- **i18n**: Internationalization/localization

### Examples

```bash
# Good commits
feat(sort): add sort by git status option
fix(drag-drop): handle nested folder edge case
docs(readme): add configuration examples
i18n(ko): update Korean translations
refactor(tree-provider): simplify file loading logic

# With body
feat(config): add custom icon support

- Add iconPath configuration option
- Support custom file type icons
- Update documentation

Closes #123
```

### Commit Message Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- First line should be 50 characters or less
- Reference issues and PRs when relevant
- Provide context in the body if needed

## 🔄 Pull Request Process

### Before Submitting

- [ ] Test your changes thoroughly
- [ ] Update documentation if needed
- [ ] Add/update translations (both .json files)
- [ ] Follow code style guidelines
- [ ] Write clear commit messages
- [ ] Ensure no console.log statements left (except intentional logging)

### Submitting a PR

1. **Create a feature branch**:
```bash
git checkout -b feature/my-awesome-feature
```

2. **Make your changes**:
```bash
# Edit files
npm run compile
# Test in VS Code
git add .
git commit -m "feat: add awesome feature"
```

3. **Keep your fork up to date**:
```bash
git fetch upstream
git rebase upstream/main
```

4. **Push to your fork**:
```bash
git push origin feature/my-awesome-feature
```

5. **Open a Pull Request**:
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template

### PR Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123
Related to #456

## Testing
How did you test these changes?

1. Tested with workspaces of different sizes
2. Verified drag-drop functionality
3. Checked console for errors

## Screenshots (if applicable)
Add screenshots to demonstrate changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Translations updated
- [ ] No console warnings/errors
- [ ] Tested in Extension Development Host
```

### PR Review Process

1. **Automated checks**: CI/CD will run (when configured)
2. **Code review**: Maintainer will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, maintainer will merge

### After Your PR is Merged

1. Delete your feature branch:
```bash
git branch -d feature/my-awesome-feature
git push origin --delete feature/my-awesome-feature
```

2. Update your fork:
```bash
git checkout main
git pull upstream main
git push origin main
```

## 🌍 Internationalization (i18n)

### Adding New Strings

1. **Add to `package.nls.json`** (English):
```json
{
  "commands.myNewCommand": "My New Command",
  "messages.myNewMessage": "Operation completed successfully"
}
```

2. **Add to `package.nls.ko.json`** (Korean):
```json
{
  "commands.myNewCommand": "새로운 명령",
  "messages.myNewMessage": "작업이 성공적으로 완료되었습니다"
}
```

3. **Use in code**:
```typescript
import { I18n } from './i18n';

vscode.window.showInformationMessage(
  I18n.t('messages.myNewMessage')
);
```

### Translation Guidelines

- Keep translations concise
- Maintain consistent terminology
- Test in both languages
- Use placeholders for dynamic content: `{0}`, `{1}`, etc.

## 🧪 Testing

### Manual Testing Checklist

- [ ] Basic sorting functionality
- [ ] Drag and drop in various scenarios
- [ ] All context menu commands
- [ ] Configuration changes are applied
- [ ] Keyboard shortcuts work
- [ ] Works with hidden files
- [ ] Works with large directories (1000+ files)
- [ ] No memory leaks (check Task Manager)
- [ ] No console errors

### Future: Automated Testing

We plan to add:
- Unit tests with Jest
- Integration tests with VS Code Test API
- E2E tests for common workflows

## 📚 Additional Resources

### VS Code Extension Development

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guides](https://code.visualstudio.com/api/extension-guides/overview)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

### Tools & Libraries

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Micromatch Documentation](https://github.com/micromatch/micromatch)
- [VS Code Tree View API](https://code.visualstudio.com/api/extension-guides/tree-view)

## ❓ Questions?

If you have questions:

1. Check existing [Issues](https://github.com/yourusername/explorer-sort/issues)
2. Check [Discussions](https://github.com/yourusername/explorer-sort/discussions)
3. Open a new issue with the `question` label

## 🎉 Recognition

Contributors will be:
- Listed in the README
- Credited in release notes
- Added to the Contributors section on GitHub

Thank you for contributing to Explorer Sort! 🚀
