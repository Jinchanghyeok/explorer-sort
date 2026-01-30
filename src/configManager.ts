import * as vscode from 'vscode';
import { ExplorerSortConfig, SortRule, PriorityRule } from './types';

/**
 * VS Code 설정 관리 클래스
 */
export class ConfigManager {
  private static readonly CONFIG_SECTION = 'explorerSort';
  
  /**
   * 현재 설정 가져오기
   */
  public static getConfig(): ExplorerSortConfig {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);

    return {
      rules: config.get<SortRule[]>('rules', []),
      defaultSort: config.get<'name' | 'type' | 'modified'>('defaultSort', 'name'),
      showHiddenFiles: config.get<boolean>('showHiddenFiles', true),
      excludePatterns: config.get<string[]>('excludePatterns', []),
      respectGitignore: config.get<boolean>('respectGitignore', false),
      respectVsCodeExclude: config.get<boolean>('respectVsCodeExclude', true)
    };
  }
  
  /**
   * 규칙 추가
   */
  public static async addRule(rule: SortRule): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    const rules = config.get<SortRule[]>('rules', []);
    rules.push(rule);
    await config.update('rules', rules, vscode.ConfigurationTarget.Workspace);
  }
  
  /**
   * 규칙 업데이트
   */
  public static async updateRule(index: number, rule: SortRule): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    const rules = config.get<SortRule[]>('rules', []);
    if (index >= 0 && index < rules.length) {
      rules[index] = rule;
      await config.update('rules', rules, vscode.ConfigurationTarget.Workspace);
    }
  }
  
  /**
   * 우선순위 업데이트 (드래그 앤 드롭 시)
   */
  public static async updatePriority(
    pathPattern: string,
    fileName: string,
    newPriority: number
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    const rules = config.get<SortRule[]>('rules', []);
    
    // 해당 패턴의 규칙 찾기
    let ruleIndex = rules.findIndex(r => r.pathPattern === pathPattern);
    
    if (ruleIndex === -1) {
      // 규칙이 없으면 새로 생성
      const newRule: SortRule = {
        name: `Auto-generated for ${pathPattern}`,
        pathPattern: pathPattern,
        priorities: [
          {
            condition: `name === '${fileName}'`,
            priority: newPriority
          }
        ]
      };
      rules.push(newRule);
    } else {
      // 기존 규칙에 우선순위 추가/업데이트
      const rule = rules[ruleIndex];
      const priorityIndex = rule.priorities.findIndex(
        p => p.condition === `name === '${fileName}'`
      );
      
      if (priorityIndex === -1) {
        rule.priorities.push({
          condition: `name === '${fileName}'`,
          priority: newPriority
        });
      } else {
        rule.priorities[priorityIndex].priority = newPriority;
      }
    }
    
    await config.update('rules', rules, vscode.ConfigurationTarget.Workspace);
  }
  
  /**
   * 오프셋 기반 우선순위 업데이트 (드래그 앤 드롭 시)
   */
  public static async updateOffsetRule(
    pathPattern: string,
    draggedFileName: string,
    referenceFileName: string,
    offset: number,
    priority: number
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    const rules = config.get<SortRule[]>('rules', []);

    // 해당 패턴의 규칙 찾기
    let ruleIndex = rules.findIndex(r => r.pathPattern === pathPattern);

    if (ruleIndex === -1) {
      // 규칙이 없으면 새로 생성
      const newRule: SortRule = {
        name: `Auto-generated for ${pathPattern}`,
        pathPattern: pathPattern,
        priorities: [
          {
            condition: `name === '${draggedFileName}'`,
            priority: priority,
            referenceFile: referenceFileName,
            offset: offset
          }
        ]
      };
      rules.push(newRule);
    } else {
      // 기존 규칙에서 해당 파일의 우선순위 찾기
      const rule = rules[ruleIndex];
      const priorityIndex = rule.priorities.findIndex(
        p => p.condition === `name === '${draggedFileName}'`
      );

      if (priorityIndex === -1) {
        // 새 우선순위 추가
        rule.priorities.push({
          condition: `name === '${draggedFileName}'`,
          priority: priority,
          referenceFile: referenceFileName,
          offset: offset
        });
      } else {
        // 기존 우선순위 업데이트
        const existingPriority = rule.priorities[priorityIndex];
        existingPriority.priority = priority;
        existingPriority.referenceFile = referenceFileName;
        existingPriority.offset = offset;
      }
    }

    await config.update('rules', rules, vscode.ConfigurationTarget.Workspace);
  }

  /**
   * 설정 변경 감지
   */
  public static onConfigChange(callback: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration(this.CONFIG_SECTION)) {
        callback();
      }
    });
  }
}
