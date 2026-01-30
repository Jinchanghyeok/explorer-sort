# Change Log

All notable changes to the "explorer-sort" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.5] - 2026-01-30

### Added

- **Find in Folder**: Right-click on any folder to search for files within that folder
  - Integrates with VS Code's native search panel
  - Automatically filters search scope to the selected folder
  - Accessible via context menu on directory items
- **Reveal Active File Command**: New command to quickly locate the currently active file in the Explorer Sort view
  - Keyboard shortcut: `Ctrl+Cmd+E` (Mac) / `Ctrl+Alt+E` (Windows/Linux)
  - Automatically expands folders and selects the active file
  - Shows helpful messages when no file is active or file is not in workspace
  - Fully customizable keyboard binding
- **Advanced File Filtering**: Powerful new filtering system to hide unwanted files and folders
  - **`explorerSort.excludePatterns`**: Array of glob patterns to exclude files/folders (e.g., `["node_modules", "dist", ".env"]`)
  - **`explorerSort.respectGitignore`**: Automatically respect `.gitignore` rules (default: `false`)
  - **`explorerSort.respectVsCodeExclude`**: Respect VS Code's `files.exclude` settings (default: `true`)
  - Supports complex glob patterns like `**/*.test.ts`, `**/build/**`
  - Real-time updates when configuration changes

### Improved

- **Search Integration**: "Find in Folder" now opens search panel in ready-to-search state (previously required manual trigger)
- **Pattern Matching**: Enhanced pattern matching using micromatch library for exclude patterns
- **Configuration System**: Extended configuration interface to support new filtering options

### Technical

- Added `ignore` library (v5.3.1) for `.gitignore` parsing
- Created new `FilterEngine` class for centralized filtering logic
- Extended `ExplorerSortConfig` interface with filtering properties
- Improved TypeScript type definitions for new features

## [0.1.4] - 2025-01-30

### Added

- GitHub Sponsors support for project sustainability

### Documentation

- Updated README with GitHub Sponsors badge and support section
- Added offset feature details and examples

## [0.1.2] - 2024-10-13

### Fixed

- **View Name Display**: Fixed the view name not displaying correctly in the Explorer sidebar
  - Changed hardcoded `"EXPLORER_SORT"` to localized `"%views.explorerSort.name%"`
  - Added proper translations in `package.nls.json` and `package.nls.ko.json`
  - Resolves "No data provider registered" error on extension activation

## [0.1.1] - 2024-10-13

### Internal

- Version bump (not published to Marketplace)

## [0.1.0] - 2024-10-13

### Added

- **Custom Rule-Based Sorting**: Sort files and folders based on custom rules with condition expressions
- **Drag & Drop Reordering**: Intuitively reorder items by dragging and dropping
- **Automatic Configuration**: Priority settings are automatically saved on drop
- **Offset Positioning**: Fine-grained positioning relative to reference files within the same priority group
- **Real-Time Sync**: Automatically detects and reflects file system changes
- **Internationalization**: Full support for Korean and English languages
- **Visual Feedback**: Cut files are displayed in gray for better visibility
- **Full File Operations**:
  - Copy, cut, paste files and folders
  - Rename, delete, duplicate operations
  - Create new files and folders
  - Open files in various ways (side-by-side, with specific editor)
  - Reveal in Explorer/Finder
  - Open in integrated terminal
  - Compare files
  - Timeline view
  - Copy path and relative path
- **Configuration Options**:
  - `explorerSort.rules`: Array of sorting rules with glob patterns and priority conditions
  - `explorerSort.defaultSort`: Default sorting method (name/type/modified)
  - `explorerSort.showHiddenFiles`: Toggle visibility of hidden files
- **Keyboard Shortcuts**: Standard shortcuts for cut (Cmd/Ctrl+X), copy (Cmd/Ctrl+C), paste (Cmd/Ctrl+V), delete, rename, and priority adjustments
- **Context Menu Integration**: Full context menu support for all file operations
- **Condition Expressions**: Support for various condition types:
  - Exact name matching: `name === 'app'`
  - Type matching: `type === 'directory'`
  - String operations: `startsWith()`, `endsWith()`, `includes()`
- **Architecture Support**: Perfect for structured architectures like FSD (Feature-Sliced Design)

### Features Highlights

- **Pattern Matching**: Uses micromatch library for powerful glob pattern matching
- **Priority System**: Higher priority numbers appear at the top
- **Reference-based Positioning**: Position items relative to specific reference files
- **Multi-language UI**: Seamlessly switch between English and Korean based on VS Code locale
- **Tree View Integration**: Custom tree view in Explorer sidebar with folder icon
- **Workspace-aware**: Works with VS Code workspaces and respects workspace settings

### Technical Details

- Built with TypeScript for type safety
- VS Code API 1.85.0 compatibility
- Efficient file watching and tree data management
- Custom decoration provider for visual feedback
- Robust drag-and-drop controller with action selection

### Known Limitations

- Offset positioning is constrained within the same priority level
- Condition expressions use regex-based parsing (limited to predefined patterns)
- No automated tests yet (manual testing only)

[unreleased]: https://github.com/Jinchanghyeok/explorer-sort/compare/v0.1.5...HEAD
[0.1.5]: https://github.com/Jinchanghyeok/explorer-sort/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/Jinchanghyeok/explorer-sort/compare/v0.1.2...v0.1.4
[0.1.2]: https://github.com/Jinchanghyeok/explorer-sort/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/Jinchanghyeok/explorer-sort/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Jinchanghyeok/explorer-sort/releases/tag/v0.1.0
