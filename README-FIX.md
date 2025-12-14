# Windows 파일 잠금 문제 해결 방법

## 빠른 해결 (권장)

### 방법 1: 배치 파일 사용
1. `fix-windows-issue.bat` 파일을 더블클릭
2. 자동으로 정리하고 서버를 시작합니다

### 방법 2: 수동 해결

#### 1단계: 모든 프로세스 종료
```powershell
# PowerShell에서 실행
taskkill /F /IM node.exe
```

#### 2단계: .next 폴더 삭제
VS Code를 **완전히 종료**한 후:
```powershell
# 프로젝트 폴더에서 실행
rmdir /s /q .next
```

또는 파일 탐색기에서 `.next` 폴더를 수동으로 삭제

#### 3단계: VS Code를 관리자 권한으로 실행
1. VS Code 완전 종료
2. Windows 시작 메뉴에서 VS Code 찾기
3. 우클릭 → **"관리자 권한으로 실행"**
4. 프로젝트 폴더 열기
5. 터미널에서 `npm run dev` 실행

### 방법 3: Windows Defender 예외 추가

1. **Windows 보안** 열기
2. **바이러스 및 위협 방지** 클릭
3. **바이러스 및 위협 방지 설정** 아래 **설정 관리** 클릭
4. **제외 항목** 섹션에서 **제외 추가 또는 제거** 클릭
5. **+ 제외 추가** 클릭 → **폴더** 선택
6. 프로젝트 폴더 (`D:\project`) 선택

### 방법 4: 프로젝트를 다른 위치로 이동

파일 잠금 문제가 계속되면 프로젝트를 다른 드라이브나 폴더로 이동:
- `D:\projects\pet-walking` (예시)
- 또는 사용자 홈 디렉토리로 이동

## 오류 메시지가 있어도 작동할 수 있습니다

터미널에 `errno: -4094` 오류가 표시되더라도:
- 브라우저에서 `http://localhost:3000`이 열리는지 확인
- 페이지가 로드되면 정상 작동 중입니다
- 오류는 빌드 과정의 일부일 수 있습니다

## 여전히 문제가 있다면

1. **Node.js 재설치**
2. **프로젝트 재생성**: `npm create next-app@latest`로 새 프로젝트 생성 후 파일 복사
3. **WSL(Windows Subsystem for Linux) 사용**: Linux 환경에서 개발

## Turbo 모드 활성화

`package.json`에 Turbo 모드가 추가되었습니다:
```bash
npm run dev
```

Turbo 모드는 더 빠르고 안정적일 수 있습니다.

