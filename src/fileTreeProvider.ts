import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FileTreeItem, ExplorerSortConfig } from './types';
import { SortEngine } from './sortEngine';
import { ConfigManager } from './configManager';

/**
 * 파일 트리 데이터 프로바이더
 */
export class FileTreeProvider implements vscode.TreeDataProvider<FileTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<FileTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  
  private workspaceRoot: string;
  private config: ExplorerSortConfig;
  
  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.config = ConfigManager.getConfig();
    
    // 설정 변경 감지
    ConfigManager.onConfigChange(() => {
      this.config = ConfigManager.getConfig();
      this.refresh();
    });
    
    // 파일 시스템 변경 감지
    const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
    fileWatcher.onDidCreate(() => this.refresh());
    fileWatcher.onDidDelete(() => this.refresh());
    fileWatcher.onDidChange(() => this.refresh());
  }
  
  /**
   * 트리 새로고침
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  
  /**
   * TreeItem 가져오기
   */
  getTreeItem(element: FileTreeItem): vscode.TreeItem {
    return element;
  }
  
  /**
   * 자식 요소 가져오기
   */
  async getChildren(element?: FileTreeItem): Promise<FileTreeItem[]> {
    if (!this.workspaceRoot) {
      return [];
    }
    
    const dirPath = element
      ? element.resourceUri.fsPath
      : this.workspaceRoot;
    
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    
    try {
      const items = await this.readDirectory(dirPath);
      const sortedItems = SortEngine.sortItems(
        items,
        this.config.rules,
        dirPath,
        this.config.defaultSort
      );
      
      return sortedItems;
    } catch (error) {
      console.error('디렉토리 읽기 실패:', error);
      return [];
    }
  }
  
  /**
   * 디렉토리 읽기
   */
  private async readDirectory(dirPath: string): Promise<FileTreeItem[]> {
    const entries = fs.readdirSync(dirPath);
    const items: FileTreeItem[] = [];
    
    for (const entry of entries) {
      // 숨김 파일 필터링
      if (!this.config.showHiddenFiles && entry.startsWith('.')) {
        continue;
      }
      
      const fullPath = path.join(dirPath, entry);
      const stat = fs.statSync(fullPath);
      const isDirectory = stat.isDirectory();
      
      const item: FileTreeItem = {
        label: entry,
        resourceUri: vscode.Uri.file(fullPath),
        type: isDirectory ? 'directory' : 'file',
        priority: 0,
        originalName: entry,
        collapsibleState: isDirectory
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None,
        command: isDirectory
          ? undefined
          : {
              command: 'explorerSort.openFile',
              title: 'Open File',
              arguments: [vscode.Uri.file(fullPath)]
            },
        iconPath: isDirectory
          ? vscode.ThemeIcon.Folder
          : vscode.ThemeIcon.File,
        contextValue: isDirectory ? 'directory' : 'file'
      };
      
      items.push(item);
    }
    
    return items;
  }
  
  /**
   * 부모 요소 가져오기 (드래그 앤 드롭에 필요)
   */
  getParent(element: FileTreeItem): vscode.ProviderResult<FileTreeItem> {
    const parentPath = path.dirname(element.resourceUri.fsPath);
    
    if (parentPath === this.workspaceRoot) {
      return undefined;
    }
    
    const parentStat = fs.statSync(parentPath);
    if (!parentStat.isDirectory()) {
      return undefined;
    }
    
    return {
      label: path.basename(parentPath),
      resourceUri: vscode.Uri.file(parentPath),
      type: 'directory',
      priority: 0,
      originalName: path.basename(parentPath),
      collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
      contextValue: 'directory'
    };
  }
}
