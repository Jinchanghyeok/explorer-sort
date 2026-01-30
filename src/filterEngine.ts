import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as micromatch from 'micromatch';
import ignore from 'ignore';

/**
 * 파일 필터링 엔진
 * - 커스텀 패턴 기반 제외
 * - .gitignore 규칙 적용
 * - VSCode files.exclude 설정 통합
 */
export class FilterEngine {
  private workspaceRoot: string;
  private customExcludePatterns: string[];
  private respectGitignore: boolean;
  private respectVsCodeExclude: boolean;
  private gitignoreRules: ReturnType<typeof ignore> | null = null;

  constructor(
    workspaceRoot: string,
    config: {
      excludePatterns: string[];
      respectGitignore: boolean;
      respectVsCodeExclude: boolean;
    }
  ) {
    this.workspaceRoot = workspaceRoot;
    this.customExcludePatterns = config.excludePatterns;
    this.respectGitignore = config.respectGitignore;
    this.respectVsCodeExclude = config.respectVsCodeExclude;

    // .gitignore 로드
    if (this.respectGitignore) {
      this.loadGitignore();
    }
  }

  /**
   * 파일/폴더가 제외되어야 하는지 종합 판단
   */
  public shouldExclude(relativePath: string, fileName: string): boolean {
    // 1. 커스텀 패턴 체크
    if (this.matchesExcludePattern(relativePath, fileName)) {
      return true;
    }

    // 2. .gitignore 규칙 체크
    if (this.respectGitignore && this.isGitignored(relativePath)) {
      return true;
    }

    // 3. VSCode files.exclude 설정 체크
    if (this.respectVsCodeExclude && this.isVSCodeExcluded(relativePath)) {
      return true;
    }

    return false;
  }

  /**
   * 커스텀 제외 패턴에 매칭되는지 확인
   */
  private matchesExcludePattern(relativePath: string, fileName: string): boolean {
    if (this.customExcludePatterns.length === 0) {
      return false;
    }

    // 파일명 또는 상대 경로로 매칭
    return micromatch.isMatch(fileName, this.customExcludePatterns, {
      dot: true,
      nocase: false
    }) || micromatch.isMatch(relativePath, this.customExcludePatterns, {
      dot: true,
      nocase: false
    });
  }

  /**
   * .gitignore 규칙에 의해 무시되는지 확인
   */
  private isGitignored(relativePath: string): boolean {
    if (!this.gitignoreRules) {
      return false;
    }

    return this.gitignoreRules.ignores(relativePath);
  }

  /**
   * VSCode files.exclude 설정에 의해 제외되는지 확인
   */
  private isVSCodeExcluded(relativePath: string): boolean {
    const config = vscode.workspace.getConfiguration('files', vscode.Uri.file(this.workspaceRoot));
    const excludeSettings = config.get<Record<string, boolean>>('exclude', {});

    // 제외 패턴들을 배열로 변환 (값이 true인 것만)
    const excludePatterns = Object.entries(excludeSettings)
      .filter(([_, enabled]) => enabled)
      .map(([pattern, _]) => pattern);

    if (excludePatterns.length === 0) {
      return false;
    }

    // micromatch로 매칭 확인
    return micromatch.isMatch(relativePath, excludePatterns, {
      dot: true,
      nocase: false
    });
  }

  /**
   * .gitignore 파일 로드 및 파싱
   */
  private loadGitignore(): void {
    const gitignorePath = path.join(this.workspaceRoot, '.gitignore');

    if (!fs.existsSync(gitignorePath)) {
      return;
    }

    try {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      this.gitignoreRules = ignore().add(gitignoreContent);
    } catch (error) {
      console.error('Failed to load .gitignore:', error);
      this.gitignoreRules = null;
    }
  }

  /**
   * 설정 업데이트 (설정이 변경되었을 때 호출)
   */
  public updateConfig(config: {
    excludePatterns: string[];
    respectGitignore: boolean;
    respectVsCodeExclude: boolean;
  }): void {
    this.customExcludePatterns = config.excludePatterns;
    this.respectGitignore = config.respectGitignore;
    this.respectVsCodeExclude = config.respectVsCodeExclude;

    // .gitignore 재로드
    if (this.respectGitignore) {
      this.loadGitignore();
    } else {
      this.gitignoreRules = null;
    }
  }
}
