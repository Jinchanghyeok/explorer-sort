import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FileTreeProvider } from './fileTreeProvider';
import { DragDropController } from './dragDropController';
import { CutFileDecorationProvider } from './cutDecorationProvider';
import { I18n } from './i18n';
import { FileTreeItem } from './types';

let clipboard: FileTreeItem | undefined;
let clipboardMode: 'copy' | 'cut' | undefined;
let compareFile: vscode.Uri | undefined;
let cutDecorationProvider: CutFileDecorationProvider;

export function activate(context: vscode.ExtensionContext) {
  console.log('🌍 VS Code Language:', vscode.env.language);
  
  // 국제화 초기화
  I18n.init();
  
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showWarningMessage(I18n.t('messages.noWorkspace'));
    return;
  }
  
  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const workspaceName = path.basename(workspaceRoot);
  
  const treeProvider = new FileTreeProvider(workspaceRoot);
  const dragDropController = new DragDropController(treeProvider);
  
  cutDecorationProvider = new CutFileDecorationProvider();
  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(cutDecorationProvider)
  );
  
  const treeView = vscode.window.createTreeView('explorerSort', {
    treeDataProvider: treeProvider,
    dragAndDropController: dragDropController,
    canSelectMany: false
  });
  
  treeView.title = `${workspaceName}_SORT`;
  
  // 모든 명령 등록
  context.subscriptions.push(
    treeView,
    
    vscode.commands.registerCommand('explorerSort.refresh', () => {
      treeProvider.refresh();
      vscode.window.showInformationMessage(I18n.t('messages.refreshed'));
    }),
    
    vscode.commands.registerCommand('explorerSort.collapseAll', () => 
      vscode.commands.executeCommand('workbench.actions.treeView.explorerSort.collapseAll')),
    
    vscode.commands.registerCommand('explorerSort.openFile', async (uri: vscode.Uri) => {
      await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(uri));
    }),
    
    vscode.commands.registerCommand('explorerSort.openToSide', async (item: FileTreeItem) => {
      await vscode.window.showTextDocument(
        await vscode.workspace.openTextDocument(item.resourceUri), 
        vscode.ViewColumn.Beside
      );
    }),
    
    vscode.commands.registerCommand('explorerSort.openWith', (item: FileTreeItem) => 
      vscode.commands.executeCommand('vscode.openWith', item.resourceUri)),
    
    vscode.commands.registerCommand('explorerSort.revealInExplorer', (item: FileTreeItem) => 
      vscode.commands.executeCommand('revealInExplorer', item.resourceUri)),
    
    vscode.commands.registerCommand('explorerSort.newFile', async (item?: FileTreeItem) => {
      const dir = item?.type === 'directory' ? item.resourceUri.fsPath : workspaceRoot;
      const name = await vscode.window.showInputBox({ prompt: I18n.t('prompts.fileName') });
      if (name) {
        const p = path.join(dir, name);
        fs.writeFileSync(p, '');
        treeProvider.refresh();
        await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(vscode.Uri.file(p)));
        vscode.window.showInformationMessage(I18n.t('messages.fileCreated', name));
      }
    }),
    
    vscode.commands.registerCommand('explorerSort.newFolder', async (item?: FileTreeItem) => {
      const dir = item?.type === 'directory' ? item.resourceUri.fsPath : workspaceRoot;
      const name = await vscode.window.showInputBox({ prompt: I18n.t('prompts.folderName') });
      if (name) {
        fs.mkdirSync(path.join(dir, name), { recursive: true });
        treeProvider.refresh();
        vscode.window.showInformationMessage(I18n.t('messages.folderCreated', name));
      }
    }),
    
    vscode.commands.registerCommand('explorerSort.rename', async (item: FileTreeItem) => {
      const oldPath = item.resourceUri.fsPath;
      const oldName = path.basename(oldPath);
      const ext = path.extname(oldName);
      const nameWithoutExt = path.basename(oldName, ext);
      
      // Task 3: 확장자 제외하고 파일명만 선택
      const newName = await vscode.window.showInputBox({ 
        prompt: `${I18n.t('prompts.newName')}: ${oldName}`, 
        value: oldName,
        valueSelection: [0, nameWithoutExt.length] // 확장자 제외 선택
      });
      
      if (newName && newName !== oldName) {
        fs.renameSync(oldPath, path.join(path.dirname(oldPath), newName));
        treeProvider.refresh();
        vscode.window.showInformationMessage(I18n.t('messages.renamed', oldName, newName));
      }
    }),
    
    vscode.commands.registerCommand('explorerSort.delete', async (item: FileTreeItem) => {
      const itemName = path.basename(item.resourceUri.fsPath);
      const confirm = await vscode.window.showWarningMessage(
        I18n.t('prompts.confirmDelete'), 
        { modal: true }, 
        I18n.t('prompts.delete')
      );
      if (confirm === I18n.t('prompts.delete')) {
        fs.rmSync(item.resourceUri.fsPath, { recursive: true });
        treeProvider.refresh();
        vscode.window.showInformationMessage(I18n.t('messages.deleted', itemName));
      }
    }),
    
    vscode.commands.registerCommand('explorerSort.cut', (item: FileTreeItem) => {
      if (clipboard && clipboardMode === 'cut') {
        cutDecorationProvider.removeCutFile(clipboard.resourceUri);
      }
      clipboard = item;
      clipboardMode = 'cut';
      cutDecorationProvider.addCutFile(item.resourceUri);
      vscode.window.showInformationMessage(I18n.t('messages.cut', path.basename(item.resourceUri.fsPath)));
    }),
    
    vscode.commands.registerCommand('explorerSort.copy', (item: FileTreeItem) => {
      clipboard = item;
      clipboardMode = 'copy';
      vscode.window.showInformationMessage(I18n.t('messages.copied', path.basename(item.resourceUri.fsPath)));
    }),
    
    vscode.commands.registerCommand('explorerSort.paste', (item?: FileTreeItem) => {
      if (!clipboard) return;
      const targetDir = item?.type === 'directory' ? item.resourceUri.fsPath : workspaceRoot;
      const src = clipboard.resourceUri.fsPath;
      const dest = path.join(targetDir, path.basename(src));
      
      if (clipboardMode === 'cut') {
        fs.renameSync(src, dest);
        cutDecorationProvider.removeCutFile(clipboard.resourceUri);
        clipboard = undefined;
        clipboardMode = undefined;
      } else {
        fs.statSync(src).isDirectory() ? copyDir(src, dest) : fs.copyFileSync(src, dest);
      }
      treeProvider.refresh();
      vscode.window.showInformationMessage(I18n.t('messages.pasted', path.basename(src)));
    }),
    
    vscode.commands.registerCommand('explorerSort.copyPath', (item: FileTreeItem) => {
      vscode.env.clipboard.writeText(item.resourceUri.fsPath);
      vscode.window.showInformationMessage(I18n.t('messages.pathCopied'));
    }),
    
    vscode.commands.registerCommand('explorerSort.copyRelativePath', (item: FileTreeItem) => {
      vscode.env.clipboard.writeText(path.relative(workspaceRoot, item.resourceUri.fsPath));
      vscode.window.showInformationMessage(I18n.t('messages.relativePathCopied'));
    }),
    
    vscode.commands.registerCommand('explorerSort.selectForCompare', (item: FileTreeItem) => {
      compareFile = item.resourceUri;
      vscode.window.showInformationMessage(I18n.t('messages.selectedForCompare'));
    }),
    
    vscode.commands.registerCommand('explorerSort.compareWithSelected', (item: FileTreeItem) => {
      if (!compareFile) {
        vscode.window.showWarningMessage(I18n.t('messages.selectFileFirst'));
        return;
      }
      vscode.commands.executeCommand('vscode.diff', compareFile, item.resourceUri);
    }),
    
    vscode.commands.registerCommand('explorerSort.openTimeline', (item: FileTreeItem) => 
      vscode.commands.executeCommand('timeline.openTimeline', item.resourceUri)),
    
    vscode.commands.registerCommand('explorerSort.openInTerminal', (item: FileTreeItem) => {
      if (item.type === 'directory') {
        vscode.window.createTerminal({ cwd: item.resourceUri.fsPath }).show();
      }
    }),
    
    vscode.commands.registerCommand('explorerSort.revealInFinder', (item: FileTreeItem) => 
      vscode.commands.executeCommand('revealFileInOS', item.resourceUri)),
    
    vscode.commands.registerCommand('explorerSort.duplicate', async (item: FileTreeItem) => {
      const src = item.resourceUri.fsPath;
      const ext = path.extname(src);
      const base = path.basename(src, ext);
      const name = await vscode.window.showInputBox({ 
        prompt: I18n.t('prompts.duplicateName'),
        value: `${base}-copy${ext}` 
      });
      if (name) {
        const dest = path.join(path.dirname(src), name);
        fs.statSync(src).isDirectory() ? copyDir(src, dest) : fs.copyFileSync(src, dest);
        treeProvider.refresh();
        vscode.window.showInformationMessage(I18n.t('messages.duplicated', name));
      }
    }),
    
    // Task 2: Add Sort Rule
    vscode.commands.registerCommand('explorerSort.addSortRule', async () => {
      const ruleName = await vscode.window.showInputBox({
        prompt: I18n.t('prompts.ruleName'),
        placeHolder: 'e.g., FSD Structure'
      });
      if (!ruleName) return;
      
      const pathPattern = await vscode.window.showInputBox({
        prompt: I18n.t('prompts.pathPattern'),
        placeHolder: '**',
        value: '**'
      });
      if (!pathPattern) return;
      
      const priorities: { condition: string; priority: number }[] = [];
      let priorityValue = 1000;
      
      while (true) {
        const condition = await vscode.window.showInputBox({
          prompt: I18n.t('prompts.conditionName'),
          placeHolder: "name === 'app'"
        });
        if (!condition) break;
        
        const priority = await vscode.window.showInputBox({
          prompt: I18n.t('prompts.priorityValue'),
          value: priorityValue.toString(),
          validateInput: (value) => {
            const num = parseInt(value);
            if (isNaN(num)) return 'Please enter a number';
            return null;
          }
        });
        if (!priority) break;
        
        priorities.push({
          condition,
          priority: parseInt(priority)
        });
        
        priorityValue -= 1;
        
        const addMore = await vscode.window.showQuickPick(
          ['Yes', 'No'],
          { placeHolder: I18n.t('prompts.addMoreConditions') }
        );
        if (addMore !== 'Yes') break;
      }
      
      if (priorities.length === 0) {
        vscode.window.showWarningMessage('No priorities added. Rule not created.');
        return;
      }
      
      const newRule = {
        name: ruleName,
        pathPattern,
        priorities
      };
      
      const config = vscode.workspace.getConfiguration('explorerSort');
      const rules = config.get<any[]>('rules', []);
      rules.push(newRule);
      await config.update('rules', rules, vscode.ConfigurationTarget.Workspace);
      
      treeProvider.refresh();
      vscode.window.showInformationMessage(I18n.t('messages.sortRuleAdded', ruleName));
    }),
    
    // Task 5: Move Priority Up
    vscode.commands.registerCommand('explorerSort.moveUp', async (item: FileTreeItem) => {
      const fileName = path.basename(item.resourceUri.fsPath);
      const parentPath = path.dirname(item.resourceUri.fsPath);
      const relativePath = path.relative(workspaceRoot, parentPath);
      const pattern = relativePath ? `**/${relativePath}/**` : '**';
      
      // Get current priority or default 0
      const config = vscode.workspace.getConfiguration('explorerSort');
      const rules = config.get<any[]>('rules', []);
      let currentPriority = 0;
      
      for (const rule of rules) {
        for (const p of rule.priorities) {
          if (p.condition === `name === '${fileName}'`) {
            currentPriority = p.priority;
            break;
          }
        }
      }
      
      const newPriority = currentPriority + 100;
      
      // Update or create rule
      let ruleIndex = rules.findIndex(r => r.pathPattern === pattern);
      if (ruleIndex === -1) {
        rules.push({
          name: `Auto-generated for ${pattern}`,
          pathPattern: pattern,
          priorities: [{ condition: `name === '${fileName}'`, priority: newPriority }]
        });
      } else {
        const priorityIndex = rules[ruleIndex].priorities.findIndex(
          (p: any) => p.condition === `name === '${fileName}'`
        );
        if (priorityIndex === -1) {
          rules[ruleIndex].priorities.push({ condition: `name === '${fileName}'`, priority: newPriority });
        } else {
          rules[ruleIndex].priorities[priorityIndex].priority = newPriority;
        }
      }
      
      await config.update('rules', rules, vscode.ConfigurationTarget.Workspace);
      treeProvider.refresh();
      vscode.window.showInformationMessage(I18n.t('messages.priorityUpdated', `${fileName}: ${newPriority}`));
    }),
    
    // Task 5: Move Priority Down
    vscode.commands.registerCommand('explorerSort.moveDown', async (item: FileTreeItem) => {
      const fileName = path.basename(item.resourceUri.fsPath);
      const parentPath = path.dirname(item.resourceUri.fsPath);
      const relativePath = path.relative(workspaceRoot, parentPath);
      const pattern = relativePath ? `**/${relativePath}/**` : '**';
      
      const config = vscode.workspace.getConfiguration('explorerSort');
      const rules = config.get<any[]>('rules', []);
      let currentPriority = 0;
      
      for (const rule of rules) {
        for (const p of rule.priorities) {
          if (p.condition === `name === '${fileName}'`) {
            currentPriority = p.priority;
            break;
          }
        }
      }
      
      const newPriority = currentPriority - 100;
      
      let ruleIndex = rules.findIndex(r => r.pathPattern === pattern);
      if (ruleIndex === -1) {
        rules.push({
          name: `Auto-generated for ${pattern}`,
          pathPattern: pattern,
          priorities: [{ condition: `name === '${fileName}'`, priority: newPriority }]
        });
      } else {
        const priorityIndex = rules[ruleIndex].priorities.findIndex(
          (p: any) => p.condition === `name === '${fileName}'`
        );
        if (priorityIndex === -1) {
          rules[ruleIndex].priorities.push({ condition: `name === '${fileName}'`, priority: newPriority });
        } else {
          rules[ruleIndex].priorities[priorityIndex].priority = newPriority;
        }
      }
      
      await config.update('rules', rules, vscode.ConfigurationTarget.Workspace);
      treeProvider.refresh();
      vscode.window.showInformationMessage(I18n.t('messages.priorityUpdated', `${fileName}: ${newPriority}`));
    }),
    
    // Task 5: Set Priority Manually
    vscode.commands.registerCommand('explorerSort.setPriority', async (item: FileTreeItem) => {
      const fileName = path.basename(item.resourceUri.fsPath);
      const parentPath = path.dirname(item.resourceUri.fsPath);
      const relativePath = path.relative(workspaceRoot, parentPath);
      const pattern = relativePath ? `**/${relativePath}/**` : '**';
      
      const config = vscode.workspace.getConfiguration('explorerSort');
      const rules = config.get<any[]>('rules', []);
      let currentPriority = 0;
      
      for (const rule of rules) {
        for (const p of rule.priorities) {
          if (p.condition === `name === '${fileName}'`) {
            currentPriority = p.priority;
            break;
          }
        }
      }
      
      const priorityStr = await vscode.window.showInputBox({
        prompt: I18n.t('prompts.priorityValue'),
        value: currentPriority.toString(),
        validateInput: (value) => {
          const num = parseInt(value);
          if (isNaN(num)) return 'Please enter a number';
          return null;
        }
      });
      
      if (!priorityStr) return;
      const newPriority = parseInt(priorityStr);
      
      let ruleIndex = rules.findIndex(r => r.pathPattern === pattern);
      if (ruleIndex === -1) {
        rules.push({
          name: `Auto-generated for ${pattern}`,
          pathPattern: pattern,
          priorities: [{ condition: `name === '${fileName}'`, priority: newPriority }]
        });
      } else {
        const priorityIndex = rules[ruleIndex].priorities.findIndex(
          (p: any) => p.condition === `name === '${fileName}'`
        );
        if (priorityIndex === -1) {
          rules[ruleIndex].priorities.push({ condition: `name === '${fileName}'`, priority: newPriority });
        } else {
          rules[ruleIndex].priorities[priorityIndex].priority = newPriority;
        }
      }
      
      await config.update('rules', rules, vscode.ConfigurationTarget.Workspace);
      treeProvider.refresh();
      vscode.window.showInformationMessage(I18n.t('messages.priorityUpdated', `${fileName}: ${newPriority}`));
    })
  );
}

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src)) {
    const s = path.join(src, e);
    const d = path.join(dest, e);
    fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

export function deactivate() {}