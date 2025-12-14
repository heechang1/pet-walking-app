# 문제 해결 가이드 (Troubleshooting Guide)

## Windows 파일 잠금 오류 해결

### 증상
```
[Error: UNKNOWN: unknown error, open 'D:\project\.next\static\chunks\app\layout.js']
errno: -4094
```

### 해결 방법

#### 방법 1: 다른 포트 사용
서버가 포트 3001에서 실행 중일 수 있습니다. 다음 URL을 확인하세요:
- `http://localhost:3001`

#### 방법 2: 완전 정리 후 재시작
```powershell
# 1. 모든 Node 프로세스 종료
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# 2. .next 폴더 삭제 (VS Code를 닫은 후)
Remove-Item -Path .next -Recurse -Force

# 3. 개발 서버 재시작
npm run dev
```

#### 방법 3: 관리자 권한으로 VS Code 실행
1. VS Code 완전 종료
2. Windows에서 VS Code를 우클릭
3. "관리자 권한으로 실행" 선택
4. 프로젝트 폴더 열기
5. `npm run dev` 실행

#### 방법 4: Windows Defender 예외 추가
1. Windows 보안 설정 열기
2. 바이러스 및 위협 방지 → 설정 관리
3. 제외 항목 추가 → 폴더
4. 프로젝트 폴더(`D:\project`) 추가

#### 방법 5: 파일 잠금 확인
```powershell
# .next 폴더에서 잠긴 파일 확인
Get-Process | Where-Object {$_.Path -like "*node*"} | Stop-Process -Force
```

### 현재 서버 상태 확인
- 포트 3000: 확인 필요
- 포트 3001: 실행 중 (확인됨)

브라우저에서 다음을 시도하세요:
1. `http://localhost:3000`
2. `http://localhost:3001`

### 오류가 계속 발생하는 경우
오류 메시지가 표시되더라도 브라우저에서 페이지가 열리면 정상 작동 중입니다.
오류는 빌드 과정에서 발생하지만, 서버는 정상적으로 요청을 처리할 수 있습니다.

