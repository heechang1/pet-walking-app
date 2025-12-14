# 배포 가이드 (Deployment Guide)

## Supabase 인증 URL 설정

### 문제
배포 시 로컬호스트(`localhost:3000`)가 아닌 실제 배포 사이트 URL로 인증 링크가 동작하도록 설정해야 합니다.

### 해결 방법

#### 1. Supabase 대시보드에서 Redirect URL 추가

1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. 프로젝트 선택
3. **Authentication** → **URL Configuration**로 이동
4. **Redirect URLs** 섹션에서 다음 URL들을 추가:

**로컬 개발용:**
```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback  (다른 포트 사용 시)
```

**배포 사이트용 (예: Vercel):**
```
https://your-app.vercel.app/auth/callback
https://your-custom-domain.com/auth/callback
```

#### 2. Site URL 설정

**Authentication** → **URL Configuration**에서 **Site URL**도 설정:

**로컬 개발용:**
```
http://localhost:3000
```

**배포 사이트용:**
```
https://your-app.vercel.app
```

### 자동 URL 처리

코드는 이미 `window.location.origin`을 사용하여 자동으로 현재 도메인을 감지합니다:

```typescript
// app/login/page.tsx
emailRedirectTo: `${window.location.origin}/auth/callback`
```

따라서:
- **로컬에서 실행**: `http://localhost:3000/auth/callback`로 링크 전송
- **배포 사이트에서 실행**: `https://your-app.vercel.app/auth/callback`로 링크 전송

**중요**: Supabase 대시보드에 Redirect URL을 미리 추가하지 않으면 인증이 실패합니다!

### 이메일 링크 만료 문제

이메일 Magic Link는 기본적으로 **1시간 후 만료**됩니다.

만료된 링크를 클릭하면:
- `otp_expired` 오류 발생
- 로그인 페이지로 리다이렉트되며 "이메일 링크가 만료되었습니다" 메시지 표시
- 새로운 링크를 요청해야 합니다

### 배포 체크리스트

- [ ] Supabase 대시보드에 배포 URL 추가 (Redirect URLs)
- [ ] Supabase 대시보드에서 Site URL 설정 (배포 URL)
- [ ] 환경 변수 설정 (`.env.production` 또는 배포 플랫폼 설정):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] 배포 후 인증 링크 테스트

