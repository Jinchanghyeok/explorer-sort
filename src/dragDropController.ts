import * as vscode from 'vscode';
import * as path from 'path';
import { FileTreeItem } from './types';
import { ConfigManager } from './configManager';
import { I18n } from './i18n';
import * as micromatch from 'micromatch';

export class DragDropController implements vscode.TreeDragAndDropController<FileTreeItem> {
  dropMimeTypes = ['application/vnd.code.tree.customFileSort'];
  dragMimeTypes = ['application/vnd.code.tree.customFileSort'];

  private treeProvider: any;

  constructor(treeProvider: any) {
    this.treeProvider = treeProvider;
  }

  async handleDrag(
    source: readonly FileTreeItem[],
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): Promise<void> {
    const dragData = source.map(item => ({
      uri: item.resourceUri.toString(),
      type: item.type,
      originalName: item.originalName,
      priority: item.priority,
    }));

    dataTransfer.set(
      'application/vnd.code.tree.customFileSort',
      new vscode.DataTransferItem(dragData)
    );
  }

  async handleDrop(
    target: FileTreeItem | undefined,
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): Promise<void> {
    const transferItem = dataTransfer.get('application/vnd.code.tree.customFileSort');
    if (!transferItem) return;

    const dragData: Array<{ uri: string; type?: string; originalName?: string }> = transferItem.value;
    if (!Array.isArray(dragData) || dragData.length === 0) return;

    if (!target) {
      await this.handleDropToRoot();
      return;
    }

    const isFolderTarget = target.collapsibleState !== vscode.TreeItemCollapsibleState.None;

    // 공통: 소스/부모 경로 수집
    const sourceUris = dragData.map(d => vscode.Uri.parse(d.uri));
    const sourceParents = new Set(sourceUris.map(u => path.dirname(u.fsPath)));
    const allSourcesShareSameParent = sourceParents.size === 1;
    const singleSourceParent = allSourcesShareSameParent ? [...sourceParents][0] : undefined;

    if (isFolderTarget) {
      const targetFolderPath = target.resourceUri.fsPath;
      const targetParent = path.dirname(targetFolderPath);
      const isSiblingFolderDrop = !!singleSourceParent && singleSourceParent === targetParent;

      // 다른 경로 폴더 → 묻지 말고 즉시 이동
      if (!isSiblingFolderDrop) {
        await this.moveUrisIntoFolder(sourceUris, target.resourceUri);
        return;
      }

      // 같은 경로(형제 폴더) → 이동을 첫 번째로 둔 QuickPick
      const picks = [
        I18n.t('dragDrop.moveToFolder'),
        I18n.t('dragDrop.positionAboveFolder'),
        I18n.t('dragDrop.positionBelowFolder'),
        I18n.t('dragDrop.cancel'),
      ] as const;

      const picked = await vscode.window.showQuickPick(picks as unknown as string[], {
        title: I18n.t('dragDrop.folderDrop'),
        placeHolder: I18n.t('dragDrop.selectAction'),
      });
      if (!picked || picked === I18n.t('dragDrop.cancel')) return;

      if (picked === I18n.t('dragDrop.moveToFolder')) {
        await this.moveUrisIntoFolder(sourceUris, target.resourceUri);
        return;
      }

      // 폴더 위치 조정 처리
      if (sourceUris.length === 1) {
        const isAbove = picked === I18n.t('dragDrop.positionAboveFolder');
        await this.handlePositionAdjustment(sourceUris[0], target, isAbove);
      } else {
        vscode.window.showWarningMessage(I18n.t('dragDrop.singleFolderOnly'));
      }
      return;
    }

    // 파일 대상 드롭 처리
    await this.handleFileTargetDrop(sourceUris, target, singleSourceParent);
  }

  private async handleDropToRoot(): Promise<void> {
    vscode.window.showInformationMessage(I18n.t('dragDrop.rootDrop'));
  }

  private async moveUrisIntoFolder(sources: vscode.Uri[], targetFolder: vscode.Uri) {
    try {
      let stat;
      try {
        stat = await vscode.workspace.fs.stat(targetFolder);
      } catch {
        stat = undefined;
      }
      if (!stat) {
        vscode.window.showErrorMessage(I18n.t('dragDrop.cannotVerifyTarget'));
        return;
      }

      for (const src of sources) {
        const dest = vscode.Uri.file(path.join(targetFolder.fsPath, path.basename(src.fsPath)));
        try {
          await vscode.workspace.fs.rename(src, dest, { overwrite: false });
        } catch (err: any) {
          vscode.window.showWarningMessage(
            I18n.t('dragDrop.moveFailed', path.basename(src.fsPath), targetFolder.fsPath, err?.message ?? 'Unknown error')
          );
        }
      }

      vscode.window.showInformationMessage(
        I18n.t('dragDrop.moveCompleted', path.basename(targetFolder.fsPath))
      );
      this.treeProvider?.refresh?.();
    } catch (e: any) {
      vscode.window.showErrorMessage(I18n.t('dragDrop.moveError', e?.message ?? e));
    }
  }

  /**
   * 파일 대상 드롭 처리
   */
  private async handleFileTargetDrop(
    sourceUris: vscode.Uri[],
    target: FileTreeItem,
    singleSourceParent: string | undefined
  ): Promise<void> {
    if (sourceUris.length !== 1) {
      vscode.window.showWarningMessage(I18n.t('dragDrop.singleFileOnly'));
      return;
    }

    const sourceUri = sourceUris[0];
    const targetParentPath = path.dirname(target.resourceUri.fsPath);
    const sourceParentPath = path.dirname(sourceUri.fsPath);
    const isSameDirectory = sourceParentPath === targetParentPath;

    let filePicks: string[];

    if (isSameDirectory) {
      // 같은 경로: 위치 조정만
      filePicks = [
        I18n.t('dragDrop.positionAboveFile'),
        I18n.t('dragDrop.positionBelowFile'),
        I18n.t('dragDrop.cancel')
      ];
    } else {
      // 다른 경로: 이동 옵션 추가
      filePicks = [
        I18n.t('dragDrop.moveToPath'),
        I18n.t('dragDrop.positionAboveFile'),
        I18n.t('dragDrop.positionBelowFile'),
        I18n.t('dragDrop.cancel')
      ];
    }

    const picked = await vscode.window.showQuickPick(filePicks, {
      title: I18n.t('dragDrop.fileDrop'),
      placeHolder: I18n.t('dragDrop.selectAction'),
    });

    if (!picked || picked === I18n.t('dragDrop.cancel')) return;

    if (picked === I18n.t('dragDrop.moveToPath')) {
      await this.moveFileToDirectory(sourceUri, vscode.Uri.file(targetParentPath));
      return;
    }

    // 위치 조정 처리
    const isAbove = picked === I18n.t('dragDrop.positionAboveFile');

    if (!isSameDirectory) {
      // 다른 경로에서 위치 조정: 먼저 파일 이동 후 위치 조정
      await this.moveFileAndAdjustPosition(sourceUri, target, isAbove);
    } else {
      // 같은 경로에서 위치 조정: 바로 위치 조정
      await this.handlePositionAdjustment(sourceUri, target, isAbove);
    }
  }

  /**
   * 단일 파일을 다른 디렉토리로 이동
   */
  private async moveFileToDirectory(sourceUri: vscode.Uri, targetDirUri: vscode.Uri): Promise<void> {
    try {
      const destUri = vscode.Uri.file(
        path.join(targetDirUri.fsPath, path.basename(sourceUri.fsPath))
      );

      await vscode.workspace.fs.rename(sourceUri, destUri, { overwrite: false });

      vscode.window.showInformationMessage(
        I18n.t('dragDrop.fileMoved', path.basename(sourceUri.fsPath))
      );
      this.treeProvider?.refresh?.();
    } catch (error: any) {
      vscode.window.showErrorMessage(
        I18n.t('dragDrop.fileMoveError', error?.message ?? 'Unknown error')
      );
    }
  }

  /**
   * 파일 이동 후 위치 조정 처리
   */
  private async moveFileAndAdjustPosition(
    sourceUri: vscode.Uri,
    target: FileTreeItem,
    isAbove: boolean
  ): Promise<void> {
    const targetParentPath = path.dirname(target.resourceUri.fsPath);
    const sourceFileName = path.basename(sourceUri.fsPath);

    try {
      // 1. 먼저 파일을 타겟 경로로 이동
      const destUri = vscode.Uri.file(
        path.join(targetParentPath, sourceFileName)
      );

      await vscode.workspace.fs.rename(sourceUri, destUri, { overwrite: false });

      // 2. 이동된 파일에 대해 위치 조정 적용
      await this.handlePositionAdjustment(destUri, target, isAbove);

      const position = isAbove ? I18n.t('dragDrop.positionAbove') : I18n.t('dragDrop.positionBelow');
      vscode.window.showInformationMessage(
        I18n.t('dragDrop.fileMovedAndPositioned', sourceFileName, position, path.basename(target.resourceUri.fsPath))
      );

    } catch (error: any) {
      vscode.window.showErrorMessage(
        I18n.t('dragDrop.moveAndAdjustError', error?.message ?? 'Unknown error')
      );
    }
  }

  /**
   * 위치 조정 처리 (오프셋 기반)
   */
  private async handlePositionAdjustment(
    sourceUri: vscode.Uri,
    target: FileTreeItem,
    isAbove: boolean
  ): Promise<void> {
    const sourceFileName = path.basename(sourceUri.fsPath);
    const targetFileName = path.basename(target.resourceUri.fsPath);
    const targetParentPath = path.dirname(target.resourceUri.fsPath);

    // 워크스페이스 루트 기준 상대 경로 생성
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    const relativeTargetPath = path.relative(workspaceRoot, targetParentPath);
    const pathPattern = relativeTargetPath ? `**/${relativeTargetPath}/**` : '**/*';

    // 오프셋 계산 (위: 0, 아래: -1)
    const offset = isAbove ? 0 : -1;

    // 타겟 파일의 우선순위 가져오기
    const targetPriority = target.priority || 0;

    try {
      await ConfigManager.updateOffsetRule(
        pathPattern,
        sourceFileName,
        targetFileName,
        offset,
        targetPriority
      );

      const position = isAbove ? I18n.t('dragDrop.positionAbove') : I18n.t('dragDrop.positionBelow');
      vscode.window.showInformationMessage(
        I18n.t('dragDrop.filePositioned', sourceFileName, position, targetFileName)
      );

      this.treeProvider?.refresh?.();
    } catch (error: any) {
      vscode.window.showErrorMessage(
        I18n.t('dragDrop.positionUpdateError', error?.message ?? 'Unknown error')
      );
    }
  }
}
