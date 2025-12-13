# Public 리소스 안내

이 폴더에는 앱에서 사용하는 정적 리소스 파일들이 위치합니다.

## 필요한 파일

### 1. stamp.png
- **용도**: 달력 페이지에서 도장 이미지로 사용
- **크기**: 권장 64x64px 또는 128x128px
- **스타일**: 파스텔 크림톤에 맞는 부드러운 도장 이미지
- **위치**: `/public/stamp.png`
- **사용 위치**: `app/calendar/page.tsx`

### 2. paw.png
- **용도**: 푸시 알림 아이콘 및 앱 아이콘으로 사용
- **크기**: 권장 192x192px (다양한 크기 지원 권장)
- **스타일**: 발바닥 모양의 심플한 아이콘
- **위치**: `/public/paw.png`
- **사용 위치**: 
  - `lib/push.ts` (알림 아이콘)
  - `public/firebase-messaging-sw.js` (서비스 워커 알림)

## Placeholder 이미지 생성 방법

현재는 실제 이미지 파일이 없으므로, 다음 중 하나의 방법으로 생성하세요:

1. **온라인 아이콘 다운로드**
   - [Flaticon](https://www.flaticon.com) - "paw" 또는 "stamp" 검색
   - [Icons8](https://icons8.com) - 무료 아이콘 다운로드

2. **이미지 생성 도구 사용**
   - [Canva](https://www.canva.com) - 간단한 디자인 도구
   - [Figma](https://www.figma.com) - 벡터 그래픽 도구

3. **임시 placeholder 사용**
   - 개발 중에는 빈 이미지나 기본 아이콘을 사용해도 됩니다.
   - 프로덕션 배포 전에 실제 이미지로 교체하세요.

## 파일 구조 예시

```
public/
  ├── stamp.png      (도장 이미지)
  ├── paw.png        (발바닥 아이콘)
  └── firebase-messaging-sw.js  (서비스 워커 - 이미 생성됨)
```

## 참고사항

- 모든 이미지는 Next.js의 `Image` 컴포넌트나 일반 `<img>` 태그로 사용 가능합니다.
- `firebase-messaging-sw.js`는 Firebase 푸시 알림을 위한 서비스 워커 파일입니다.
- 이미지 파일은 프로젝트 루트의 `public` 폴더에 직접 배치하세요.


