# 구현 완료 체크리스트

## ✅ Task 1: 빈 공간 우클릭 메뉴
- [x] package.json에 `!viewItem` 조건 추가
- [x] 빈 공간 우클릭 시 새 파일/새 폴더/붙여넣기 가능

## ✅ Task 2: 헤더에 정렬 규칙 추가 버튼
- [x] `explorerSort.addSortRule` 명령 추가
- [x] 헤더에 5번째 버튼 추가 ($(add) 아이콘)
- [x] 다단계 입력 구현:
  - 규칙 이름
  - 경로 패턴
  - 우선순위 조건 반복 추가
- [x] 번역 추가 (한/영)

## ✅ Task 3: 파일명 변경 UX 개선
- [x] 확장자 포함하되 파일명만 선택
- [x] `valueSelection` 사용해서 구현
- [x] 입력창 제목 개선

## ✅ Task 5: 컨텍스트 메뉴 - 우선순위 제어
- [x] 3개 명령 추가:
  - `explorerSort.moveUp` - 우선순위 +100
  - `explorerSort.moveDown` - 우선순위 -100
  - `explorerSort.setPriority` - 직접 입력
- [x] 컨텍스트 메뉴에 추가 (7_priority 그룹)
- [x] 키보드 단축키 추가:
  - Cmd/Ctrl + Shift + ↑
  - Cmd/Ctrl + Shift + ↓
  - Cmd/Ctrl + Shift + P
- [x] 번역 추가 (한/영)

---

## 🚀 테스트 방법

### 1단계: 컴파일
```bash
cd /Users/jinchanghyeog/Desktop/dev/vscode/explorer-sort
npm run compile
```

### 2단계: 디버그 실행
- VS Code에서 F5 누르기
- Extension Development Host 창이 열림

### 3단계: 테스트 시나리오

#### Task 1 테스트: 빈 공간 우클릭
1. EXPLORER_SORT 뷰 열기
2. 빈 공간에 우클릭
3. ✅ "새 파일", "새 폴더", "붙여넣기" 메뉴 확인

#### Task 2 테스트: 정렬 규칙 추가
1. EXPLORER_SORT 헤더에서 **+** 버튼 클릭
2. 규칙 이름 입력: "Test Rule"
3. 경로 패턴: "**"
4. 조건 입력: "name === 'test'"
5. 우선순위: 1000
6. "Add another condition?" → No
7. ✅ 설정 파일(.vscode/settings.json)에 규칙 추가 확인

#### Task 3 테스트: 파일명 변경
1. 파일 선택 (예: test.tsx)
2. 우클릭 → "Rename" 또는 Enter 키
3. ✅ 입력창에 "test.tsx"가 표시되지만 "test" 부분만 선택됨
4. 타이핑하면 확장자는 그대로, 파일명만 변경됨

#### Task 5 테스트: 우선순위 제어
1. 파일 우클릭
2. ✅ "Move Priority Up" 확인 → 클릭
3. ✅ 메시지: "Priority updated: filename: 100"
4. 다시 우클릭
5. ✅ "Move Priority Down" 확인 → 클릭
6. ✅ 메시지: "Priority updated: filename: 0"
7. 우클릭
8. ✅ "Set Priority..." 확인 → 클릭
9. 숫자 입력 (예: 500)
10. ✅ 파일 순서 변경 확인

#### 키보드 단축키 테스트
1. 파일 선택
2. `Cmd+Shift+↑` (Mac) 또는 `Ctrl+Shift+↑` (Win)
3. ✅ 우선순위 상승 확인
4. `Cmd+Shift+↓` (Mac) 또는 `Ctrl+Shift+↓` (Win)
5. ✅ 우선순위 하락 확인

---

## 🐛 예상 문제 및 해결

### 문제 1: "명령을 찾을 수 없습니다"
**원인**: 컴파일 안 됨
**해결**: `npm run compile`

### 문제 2: "설정이 저장 안 됩니다"
**원인**: .vscode 폴더 권한
**해결**: 
```bash
mkdir -p .vscode
chmod 755 .vscode
```

### 문제 3: "버튼이 안 보입니다"
**원인**: 뷰가 활성화 안 됨
**해결**: EXPLORER_SORT 뷰 클릭

### 문제 4: "우선순위가 작동 안 합니다"
**원인**: pathPattern이 안 맞음
**해결**: Developer Tools 콘솔에서 로그 확인
```javascript
// 콘솔에서 실행
vscode.workspace.getConfiguration('explorerSort').get('rules')
```

---

## 📝 설정 파일 예시

테스트를 위한 `.vscode/settings.json`:

```json
{
  "explorerSort.rules": [
    {
      "name": "FSD Structure",
      "pathPattern": "**/src/**",
      "priorities": [
        { "condition": "name === 'app'", "priority": 1000 },
        { "condition": "name === 'pages'", "priority": 999 },
        { "condition": "name === 'widgets'", "priority": 998 }
      ]
    }
  ]
}
```

---

## 🎉 다음 단계

모든 기능이 잘 작동하면:
1. README.md 업데이트 (새 기능 문서화)
2. CHANGELOG.md 생성
3. 버전 업데이트 (0.0.1 → 0.1.0)
4. VS Code Marketplace 배포 준비

---

궁금한 점이나 에러가 발생하면 알려주세요!
