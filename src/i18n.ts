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
      'prompts.delete': 'Delete',
      'messages.sortRuleAdded': 'Sort rule added: {0}',
      'messages.priorityUpdated': 'Priority updated: {0}',
      'messages.noPrioritiesAdded': 'No priorities added. Rule not created.',

      'dragDrop.folderDrop': 'Folder Drop',
      'dragDrop.fileDrop': 'File Drop',
      'dragDrop.selectAction': 'Select action to perform',
      'dragDrop.moveToFolder': 'Move files to this folder',
      'dragDrop.positionAboveFolder': 'Position above this folder',
      'dragDrop.positionBelowFolder': 'Position below this folder',
      'dragDrop.moveToPath': 'Move file to this path',
      'dragDrop.positionAboveFile': 'Position above this file',
      'dragDrop.positionBelowFile': 'Position below this file',
      'dragDrop.cancel': 'Cancel',
      'dragDrop.rootDrop': 'Drop to root: No specific action is currently configured',
      'dragDrop.singleFileOnly': 'File target drop supports single file only',
      'dragDrop.singleFolderOnly': 'Folder position adjustment supports single folder only',
      'dragDrop.cannotVerifyTarget': 'Cannot verify target folder',
      'dragDrop.moveFailed': 'Move failed: {0} → {1} ({2})',
      'dragDrop.moveCompleted': 'Moved selected items to "{0}" folder',
      'dragDrop.moveError': 'Error occurred during move: {0}',
      'dragDrop.fileMoved': 'File moved: {0}',
      'dragDrop.fileMoveError': 'File move failed: {0}',
      'dragDrop.fileMovedAndPositioned': '{0} moved and positioned {1} {2}',
      'dragDrop.positionAbove': 'above',
      'dragDrop.positionBelow': 'below',
      'dragDrop.moveAndAdjustError': 'File move and position adjustment failed: {0}',
      'dragDrop.filePositioned': '{0} positioned {1} {2}',
      'dragDrop.positionUpdateError': 'Configuration update failed: {0}'
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
        'prompts.delete': '삭제',
        'messages.sortRuleAdded': '정렬 규칙이 추가되었습니다: {0}',
        'messages.priorityUpdated': '우선순위가 업데이트되었습니다: {0}',
        'messages.noPrioritiesAdded': '추가된 우선순위가 없습니다. 규칙이 생성되지 않았습니다.',

        'dragDrop.folderDrop': '폴더 드롭',
        'dragDrop.fileDrop': '파일 드롭',
        'dragDrop.selectAction': '실행할 작업을 선택하세요',
        'dragDrop.moveToFolder': '파일을 해당 폴더로 이동',
        'dragDrop.positionAboveFolder': '위치를 해당 폴더 위로',
        'dragDrop.positionBelowFolder': '위치를 해당 폴더 아래로',
        'dragDrop.moveToPath': '파일을 해당 경로로 이동',
        'dragDrop.positionAboveFile': '위치를 해당 파일 위로',
        'dragDrop.positionBelowFile': '위치를 해당 파일 아래로',
        'dragDrop.cancel': '취소',
        'dragDrop.rootDrop': '루트로 드롭: 현재 별도 동작이 설정되어 있지 않습니다',
        'dragDrop.singleFileOnly': '파일 대상 드롭은 단일 파일만 지원됩니다',
        'dragDrop.singleFolderOnly': '폴더 위치 조정은 단일 폴더만 지원됩니다',
        'dragDrop.cannotVerifyTarget': '대상 폴더를 확인할 수 없습니다',
        'dragDrop.moveFailed': '이동 실패: {0} → {1} ({2})',
        'dragDrop.moveCompleted': '선택한 항목을 "{0}" 폴더로 이동했습니다',
        'dragDrop.moveError': '이동 중 오류가 발생했습니다: {0}',
        'dragDrop.fileMoved': '파일이 이동되었습니다: {0}',
        'dragDrop.fileMoveError': '파일 이동 실패: {0}',
        'dragDrop.fileMovedAndPositioned': '{0}이 이동되고 {2}의 {1}로 배치되었습니다',
        'dragDrop.positionAbove': '위',
        'dragDrop.positionBelow': '아래',
        'dragDrop.moveAndAdjustError': '파일 이동 및 위치 조정 실패: {0}',
        'dragDrop.filePositioned': '{0}이 {2}의 {1}로 이동되도록 설정되었습니다',
        'dragDrop.positionUpdateError': '설정 업데이트 실패: {0}'
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
