// Firebase Cloud Messaging Service Worker
// Firebase SDK 설정 후 실제 구현으로 교체 필요

// importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
// importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase 설정 (placeholder)
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
};

// Firebase 초기화 (실제 설정 후 활성화)
// firebase.initializeApp(firebaseConfig);
// const messaging = firebase.messaging();

// 백그라운드 메시지 수신 처리
// messaging.onBackgroundMessage((payload) => {
//   console.log('[firebase-messaging-sw.js] Received background message ', payload);
//   
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: '/paw.png',
//     badge: '/paw.png',
//   };
//
//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

// Placeholder: 실제 Firebase 설정 후 위 코드 활성화
console.log('Firebase Messaging Service Worker loaded (placeholder mode)');


