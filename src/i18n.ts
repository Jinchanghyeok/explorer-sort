import * as vscode from 'vscode';

export class I18n {
  private static messages: any = {};

  public static init() {
  const locale = vscode.env.language;
  console.log('🌍 Detected locale:', locale); // 디버그
    
  this.messages = { /* 영어 */ };
  
  if (locale === 'ko') {
    console.log('✅ Korean messages loaded'); // 디버그
    this.messages = { /* 한국어 */ };
  } else {
    console.log('❌ Using English messages'); // 디버그
  }

    // 개발용 언어 감지 로그 (필요시 주석 해제)
    // vscode.window.showInformationMessage(`현재 감지된 언어: ${vscode.env.language}`);
    this.messages = {
      'messages.noWorkspace': 'No workspace is opened',
      'messages.refreshed': 'File tree refreshed',
      'messages.fileCreated': 'File created: {0}',
      'messages.folderCreated': 'Folder created: {0}',
      'messages.renamed': 'Renamed: {0} → {1}',
      'messages.deleted': 'Deleted: {0}',
      'messages.cut': 'Cut: {0}',
      'messages.copied': 'Copied: {0}',
      'messages.pasted': 'Pasted: {0}',
      'messages.pathCopied': 'Path copied',
      'messages.relativePathCopied': 'Relative path copied',
      'messages.selectedForCompare': 'Selected for comparison',
      'messages.selectFileFirst': 'Please select a file to compare first',
      'messages.duplicated': 'Duplicated: {0}',
      'prompts.fileName': 'File name',
      'prompts.folderName': 'Folder name',
      'prompts.newName': 'New name',
      'prompts.duplicateName': 'Duplicate name',
      'prompts.confirmDelete': 'Are you sure you want to delete?',
      'prompts.delete': 'Delete'
    };

    if (locale === 'ko') {
      this.messages = {
        'messages.noWorkspace': '열려있는 워크스페이스가 없습니다',
        'messages.refreshed': '파일 트리를 새로고침했습니다',
        'messages.fileCreated': '파일이 생성되었습니다: {0}',
        'messages.folderCreated': '폴더가 생성되었습니다: {0}',
        'messages.renamed': '이름이 변경되었습니다: {0} → {1}',
        'messages.deleted': '삭제되었습니다: {0}',
        'messages.cut': '잘라내기: {0}',
        'messages.copied': '복사됨: {0}',
        'messages.pasted': '붙여넣기 완료: {0}',
        'messages.pathCopied': '경로가 복사되었습니다',
        'messages.relativePathCopied': '상대 경로가 복사되었습니다',
        'messages.selectedForCompare': '비교 대상으로 선택되었습니다',
        'messages.selectFileFirst': '먼저 비교할 파일을 선택하세요',
        'messages.duplicated': '복제되었습니다: {0}',
        'prompts.fileName': '파일 이름',
        'prompts.folderName': '폴더 이름',
        'prompts.newName': '새 이름',
        'prompts.duplicateName': '복제본 이름',
        'prompts.confirmDelete': '정말 삭제하시겠습니까?',
        'prompts.delete': '삭제'
      };
    }
  }

  public static t(key: string, ...args: any[]): string {
    let message = this.messages[key] || key;
    args.forEach((arg, index) => {
      message = message.replace(`{${index}}`, arg);
    });
    return message;
  }
}
