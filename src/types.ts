import * as vscode from 'vscode';

/**
 * 정렬 규칙 인터페이스
 */
export interface SortRule {
  name: string;
  pathPattern: string; // glob 패턴 (예: "**/src/**")
  priorities: PriorityRule[];
}

/**
 * 우선순위 규칙
 */
export interface PriorityRule {
  condition: string; // 조건 표현식 (예: "name === 'app'")
  priority: number; // 우선순위 값 (높을수록 상위)
  referenceFile?: string; // 기준이 되는 파일명 (선택적)
  offset?: number; // 기준 파일 대비 오프셋 (-1: 뒤, 0: 앞, 숫자가 클수록 더 뒤)
}

/**
 * 파일 트리 아이템 인터페이스
 */
export interface FileTreeItem extends vscode.TreeItem {
  resourceUri: vscode.Uri;
  type: 'file' | 'directory';
  priority: number; // 계산된 우선순위
  originalName: string; // 원본 파일명
  children?: FileTreeItem[];
}

/**
 * 설정 인터페이스
 */
export interface ExplorerSortConfig {
  rules: SortRule[];
  defaultSort: 'name' | 'type' | 'modified';
  showHiddenFiles: boolean;
}

/**
 * 드래그 앤 드롭 데이터
 */
export interface DragDropData {
  sourceItem: FileTreeItem;
  targetItem: FileTreeItem;
  dropPosition: 'above' | 'below' | 'inside';
}
