# 배포 가이드

## 🚀 배포 전 체크리스트

### 1. 환경 변수 확인
- 현재 모든 데이터는 localStorage에 저장되므로 환경 변수 불필요
- Firebase 푸시 알림을 사용할 경우 Firebase 설정 필요

### 2. 빌드 테스트
```bash
npm run build
npm run start
```

### 3. HTTPS 설정 (필수)
GPS 기능은 HTTPS 환경에서만 작동합니다.

## 📦 배포 플랫폼별 가이드

### Vercel (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

**장점:**
- Next.js 최적화
- 자동 HTTPS
- 무료 플랜 제공

### Netlify
```bash
# Netlify CLI 설치
npm i -g netlify-cli

# 빌드 설정
# netlify.toml 파일 생성 필요
```

### AWS Amplify / CloudFront
- S3 + CloudFront 조합
- SSL 인증서 설정 필요

### 자체 서버
```bash
# 빌드
npm run build

# 프로덕션 서버 시작
npm run start
```

**Nginx 설정 예시:**
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## ✅ 배포 후 테스트

### 1. GPS 기능 테스트
1. 모바일 기기에서 배포된 사이트 접속
2. 위치 권한 허용
3. 산책 시작 페이지로 이동
4. 실제로 이동하면서 경로가 업데이트되는지 확인

### 2. 확인 사항
- [ ] HTTPS 연결 확인
- [ ] 위치 권한 요청 팝업 표시
- [ ] 실시간 경로 업데이트 작동
- [ ] 지도에 경로 표시
- [ ] 산책 종료 후 달력에 기록 저장

## 🔧 문제 해결

### GPS가 작동하지 않는 경우
1. **HTTPS 확인**: 주소창에 자물쇠 아이콘 확인
2. **위치 권한 확인**: 브라우저 설정에서 위치 권한 허용
3. **실외 테스트**: 실내에서는 GPS 신호가 약할 수 있음

### 지도가 표시되지 않는 경우
1. Leaflet CSS 로드 확인
2. 브라우저 콘솔에서 오류 확인
3. OpenStreetMap 타일 서버 접근 가능 여부 확인

## 📱 모바일 최적화

### PWA 설정 (선택사항)
`next.config.mjs`에 PWA 설정 추가 가능:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public'
})

module.exports = withPWA({
  // 기존 설정
})
```

### 메타 태그 추가
`app/layout.tsx`에 모바일 최적화 메타 태그 추가:
```tsx
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<meta name="mobile-web-app-capable" content="yes" />
```

## 🔒 보안 고려사항

1. **HTTPS 필수**: GPS API는 보안 컨텍스트 필요
2. **위치 데이터**: 현재는 localStorage에만 저장 (서버 전송 없음)
3. **권한 관리**: 사용자가 위치 권한을 거부할 수 있음

## 📊 모니터링

배포 후 다음을 모니터링하세요:
- GPS 오류 발생률
- 위치 정확도 통계
- 사용자 위치 권한 허용률


