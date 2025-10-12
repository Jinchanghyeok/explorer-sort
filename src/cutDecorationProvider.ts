import * as vscode from 'vscode';

export class CutFileDecorationProvider implements vscode.FileDecorationProvider {
  private _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri | vscode.Uri[]>();
  readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;
  
  private cutFiles = new Set<string>();
  
  public addCutFile(uri: vscode.Uri): void {
    this.cutFiles.add(uri.toString());
    this._onDidChangeFileDecorations.fire(uri);
  }
  
  public removeCutFile(uri: vscode.Uri): void {
    this.cutFiles.delete(uri.toString());
    this._onDidChangeFileDecorations.fire(uri);
  }
  
  public clearCutFiles(): void {
    const uris = Array.from(this.cutFiles).map(uriStr => vscode.Uri.parse(uriStr));
    this.cutFiles.clear();
    this._onDidChangeFileDecorations.fire(uris);
  }
  
  provideFileDecoration(uri: vscode.Uri): vscode.ProviderResult<vscode.FileDecoration> {
    if (this.cutFiles.has(uri.toString())) {
      return {
        color: new vscode.ThemeColor('disabledForeground'),
        badge: '✂',
        tooltip: 'Cut (ready to paste)'
      };
    }
    return undefined;
  }
}