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

    // 1차 정렬: 우선순위 기반
    let sorted = itemsWithPriority.sort((a, b) => {
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

    // 2차 정렬: 오프셋 기반 재정렬
    sorted = this.applyOffsetSorting(sorted, rules, parentPath);

    return sorted;
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
   * 오프셋 기반 재정렬 적용
   */
  private static applyOffsetSorting(
    items: FileTreeItem[],
    rules: SortRule[],
    parentPath: string
  ): FileTreeItem[] {
    let result = [...items];

    // 각 규칙을 순서대로 처리 (규칙이 쌓이면 순서대로 적용)
    for (const rule of rules) {
      if (!this.matchesRulePattern(parentPath, rule.pathPattern)) {
        continue;
      }

      // 오프셋이 설정된 우선순위 규칙들을 처리
      for (const priorityRule of rule.priorities) {
        if (priorityRule.referenceFile && priorityRule.offset !== undefined) {
          result = this.applyOffsetRule(result, priorityRule);
        }
      }
    }

    return result;
  }

  /**
   * 단일 오프셋 규칙 적용
   */
  private static applyOffsetRule(
    items: FileTreeItem[],
    priorityRule: PriorityRule
  ): FileTreeItem[] {
    const { referenceFile, offset, condition, priority } = priorityRule;

    if (!referenceFile || offset === undefined) {
      return items;
    }

    // 기준 파일 찾기
    const referenceIndex = items.findIndex(item => {
      const itemName = path.basename(item.resourceUri.fsPath);
      return itemName === referenceFile && item.priority === priority;
    });

    if (referenceIndex === -1) {
      return items; // 기준 파일을 찾을 수 없음
    }

    // 조건에 맞는 아이템들 찾기 (같은 우선순위 내에서)
    const matchingItems: Array<{item: FileTreeItem, index: number}> = [];
    items.forEach((item, index) => {
      if (item.priority === priority &&
          this.evaluateCondition(condition, path.basename(item.resourceUri.fsPath), item.type) &&
          index !== referenceIndex) {
        matchingItems.push({ item, index });
      }
    });

    if (matchingItems.length === 0) {
      return items;
    }

    // 결과 배열 생성
    const result = [...items];
    const referenceItem = result[referenceIndex];

    // 매칭된 아이템들을 원래 위치에서 제거 (인덱스 역순으로 제거)
    matchingItems
      .sort((a, b) => b.index - a.index)
      .forEach(({index}) => {
        result.splice(index, 1);
      });

    // 기준 파일의 새 인덱스 찾기 (제거 후)
    const newReferenceIndex = result.findIndex(item =>
      item.resourceUri.fsPath === referenceItem.resourceUri.fsPath
    );

    // 같은 우선순위 그룹의 경계 찾기
    const referencePriority = referenceItem.priority;
    const samePriorityStart = result.findIndex(item => item.priority === referencePriority);

    // findLastIndex 대신 역순으로 찾기 (ES2020 호환)
    let samePriorityEnd = -1;
    for (let i = result.length - 1; i >= 0; i--) {
      if (result[i].priority === referencePriority) {
        samePriorityEnd = i;
        break;
      }
    }

    // 오프셋에 따라 새 위치 계산 (우선순위 경계 내에서만)
    let insertIndex = newReferenceIndex;
    if (offset === 0) {
      // 0: 기준 파일 앞에 삽입
      insertIndex = newReferenceIndex;
    } else if (offset === -1) {
      // -1: 기준 파일 바로 뒤에 삽입
      insertIndex = newReferenceIndex + 1;
    } else if (offset > 0) {
      // 양수: 기준 파일에서 해당 수만큼 앞으로 (같은 우선순위 그룹 내에서만)
      insertIndex = Math.max(samePriorityStart, newReferenceIndex - offset);
    } else {
      // 음수: 기준 파일에서 해당 수만큼 뒤로 (같은 우선순위 그룹 내에서만)
      insertIndex = Math.min(samePriorityEnd + 1, newReferenceIndex + Math.abs(offset));
    }

    // 매칭된 아이템들을 새 위치에 삽입
    matchingItems.forEach(({item}, i) => {
      result.splice(insertIndex + i, 0, item);
    });

    return result;
  }

  /**
   * 규칙 패턴 매칭 (디렉토리 경로용)
   */
  private static matchesRulePattern(dirPath: string, pattern: string): boolean {
    const relativePath = path.relative(
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
      dirPath
    );

    return micromatch.isMatch(relativePath, pattern, {
      dot: true,
      nocase: true
    });
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
