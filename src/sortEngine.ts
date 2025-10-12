import * as micromatch from 'micromatch';
import * as vscode from 'vscode';
import * as path from 'path';
import { SortRule, PriorityRule, FileTreeItem } from './types';

/**
 * 정렬 엔진 클래스
 */
export class SortEngine {
  /**
   * 파일/폴더 아이템 정렬
   */
  public static sortItems(
    items: FileTreeItem[],
    rules: SortRule[],
    parentPath: string,
    defaultSort: 'name' | 'type' | 'modified'
  ): FileTreeItem[] {
    // 각 아이템에 우선순위 계산
    const itemsWithPriority = items.map(item => {
      const priority = this.calculatePriority(item, rules, parentPath);
      return { ...item, priority };
    });
    
    // 정렬
    return itemsWithPriority.sort((a, b) => {
      // 1. 우선순위로 정렬 (높을수록 위)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      // 2. 폴더 우선
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      
      // 3. 기본 정렬
      return this.defaultComparator(a, b, defaultSort);
    });
  }
  
  /**
   * 우선순위 계산
   */
  private static calculatePriority(
    item: FileTreeItem,
    rules: SortRule[],
    parentPath: string
  ): number {
    const itemPath = item.resourceUri.fsPath;
    const itemName = path.basename(itemPath);
    
    // 매칭되는 규칙 찾기
    for (const rule of rules) {
      if (this.matchesPattern(itemPath, rule.pathPattern, parentPath)) {
        // 우선순위 규칙 평가
        for (const priorityRule of rule.priorities) {
          if (this.evaluateCondition(priorityRule.condition, itemName, item.type)) {
            return priorityRule.priority;
          }
        }
      }
    }
    
    return 0; // 기본 우선순위
  }
  
  /**
   * Glob 패턴 매칭
   */
  private static matchesPattern(
    itemPath: string,
    pattern: string,
    parentPath: string
  ): boolean {
    // 상대 경로로 변환
    const relativePath = path.relative(
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
      itemPath
    );
    
    // micromatch로 glob 패턴 매칭
    return micromatch.isMatch(relativePath, pattern, { 
      dot: true,
      nocase: true 
    });
  }
  
  /**
   * 조건 평가 (간단한 표현식 파서)
   */
  private static evaluateCondition(
    condition: string,
    itemName: string,
    itemType: 'file' | 'directory'
  ): boolean {
    try {
      // name === 'app' 형태의 조건 파싱
      const nameMatch = condition.match(/name\s*===\s*['"]([^'"]+)['"]/);
      if (nameMatch) {
        return itemName === nameMatch[1];
      }
      
      // type === 'directory' 형태의 조건
      const typeMatch = condition.match(/type\s*===\s*['"]([^'"]+)['"]/);
      if (typeMatch) {
        return itemType === typeMatch[1];
      }
      
      // name.startsWith('test') 형태
      const startsWithMatch = condition.match(/name\.startsWith\(['"]([^'"]+)['"]\)/);
      if (startsWithMatch) {
        return itemName.startsWith(startsWithMatch[1]);
      }
      
      // name.endsWith('.ts') 형태
      const endsWithMatch = condition.match(/name\.endsWith\(['"]([^'"]+)['"]\)/);
      if (endsWithMatch) {
        return itemName.endsWith(endsWithMatch[1]);
      }
      
      // name.includes('component') 형태
      const includesMatch = condition.match(/name\.includes\(['"]([^'"]+)['"]\)/);
      if (includesMatch) {
        return itemName.includes(includesMatch[1]);
      }
      
      return false;
    } catch (error) {
      console.error(`조건 평가 실패: ${condition}`, error);
      return false;
    }
  }
  
  /**
   * 기본 정렬 비교
   */
  private static defaultComparator(
    a: FileTreeItem,
    b: FileTreeItem,
    sortType: 'name' | 'type' | 'modified'
  ): number {
    switch (sortType) {
      case 'name':
        return a.originalName.localeCompare(b.originalName);
      case 'type':
        const extA = path.extname(a.originalName);
        const extB = path.extname(b.originalName);
        return extA.localeCompare(extB);
      case 'modified':
        // 수정 시간 비교 (구현 필요 시)
        return 0;
      default:
        return 0;
    }
  }
  
  /**
   * 드롭 위치에 따른 새 우선순위 계산
   */
  public static calculateNewPriority(
    items: FileTreeItem[],
    droppedItem: FileTreeItem,
    targetItem: FileTreeItem,
    position: 'above' | 'below'
  ): number {
    // 정렬된 아이템에서 타겟의 인덱스 찾기
    const targetIndex = items.findIndex(
      item => item.resourceUri.fsPath === targetItem.resourceUri.fsPath
    );
    
    if (targetIndex === -1) {
      return 0;
    }
    
    // 위/아래 아이템의 우선순위 가져오기
    const targetPriority = targetItem.priority;
    
    if (position === 'above') {
      // 위에 놓는 경우
      const aboveItem = targetIndex > 0 ? items[targetIndex - 1] : null;
      if (aboveItem) {
        return (aboveItem.priority + targetPriority) / 2;
      } else {
        return targetPriority + 100;
      }
    } else {
      // 아래에 놓는 경우
      const belowItem = targetIndex < items.length - 1 ? items[targetIndex + 1] : null;
      if (belowItem) {
        return (targetPriority + belowItem.priority) / 2;
      } else {
        return targetPriority - 100;
      }
    }
  }
}
