import * as vscode from 'vscode';
import * as path from 'path';
import { FileTreeItem } from './types';

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
        '파일을 해당 폴더로 이동',
        '위치를 해당 폴더 위로',
        '위치를 해당 폴더 아래로',
        '취소',
      ] as const;

      const picked = await vscode.window.showQuickPick(picks as unknown as string[], {
        title: '폴더 드롭',
        placeHolder: '실행할 작업을 선택하세요',
      });
      if (!picked || picked === '취소') return;

      if (picked === '파일을 해당 폴더로 이동') {
        await this.moveUrisIntoFolder(sourceUris, target.resourceUri);
        return;
      }

      // 위/아래 배치는 미구현 안내
      vscode.window.showInformationMessage(`"${picked}" 선택됨: 정렬 기능은 현재 미구현입니다.`);
      return;
    }

    // 파일 대상 드롭 → 접두어 없는 깔끔한 QuickPick
    const filePicks = [
      '위치를 해당 파일 위로',
      '위치를 해당 파일 아래로',
      '취소',
    ] as const;

    const picked = await vscode.window.showQuickPick(filePicks as unknown as string[], {
      title: '파일 드롭',
      placeHolder: '실행할 작업을 선택하세요',
    });
    if (!picked || picked === '취소') return;

    vscode.window.showInformationMessage(`"${picked}" 선택됨: 정렬 기능은 현재 미구현입니다.`);
  }

  private async handleDropToRoot(): Promise<void> {
    vscode.window.showInformationMessage('루트로 드롭: 현재 별도 동작이 설정되어 있지 않습니다.');
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
        vscode.window.showErrorMessage('대상 폴더를 확인할 수 없습니다.');
        return;
      }

      for (const src of sources) {
        const dest = vscode.Uri.file(path.join(targetFolder.fsPath, path.basename(src.fsPath)));
        try {
          await vscode.workspace.fs.rename(src, dest, { overwrite: false });
        } catch (err: any) {
          vscode.window.showWarningMessage(
            `이동 실패: ${path.basename(src.fsPath)} → ${targetFolder.fsPath} (${err?.message ?? '알 수 없는 오류'})`
          );
        }
      }

      vscode.window.showInformationMessage(
        `선택한 항목을 "${path.basename(targetFolder.fsPath)}" 폴더로 이동했습니다.`
      );
      this.treeProvider?.refresh?.();
    } catch (e: any) {
      vscode.window.showErrorMessage(`이동 중 오류가 발생했습니다: ${e?.message ?? e}`);
    }
  }
}
