/**
 * 푸시 알림 관련 유틸리티 함수
 * Firebase 설정이 완료되면 실제 구현으로 교체 필요
 */

// Firebase 설정 (placeholder)
const FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
  vapidKey: "YOUR_FIREBASE_VAPID_KEY",
};

/**
 * 브라우저 알림 권한 요청
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

/**
 * 로컬 알림 표시 (테스트용)
 */
export function showLocalNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/paw.png",
      badge: "/paw.png",
      ...options,
    });
  }
}

/**
 * 푸시 알림 서비스 워커 등록 (Firebase 설정 후 사용)
 */
export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Worker is not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    console.log("Service Worker registered:", registration);
    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return null;
  }
}

/**
 * Firebase Cloud Messaging 초기화 (placeholder)
 * 실제 Firebase SDK 설정 후 구현 필요
 */
export async function initializeFCM(): Promise<void> {
  // TODO: Firebase SDK 초기화
  // import { initializeApp } from 'firebase/app';
  // import { getMessaging, getToken } from 'firebase/messaging';
  
  // const app = initializeApp(FIREBASE_CONFIG);
  // const messaging = getMessaging(app);
  
  // const permission = await requestNotificationPermission();
  // if (permission) {
  //   const token = await getToken(messaging, { vapidKey: FIREBASE_CONFIG.vapidKey });
  //   console.log('FCM Token:', token);
  //   // 서버에 토큰 전송
  // }
  
  console.log("FCM initialization placeholder - Firebase config required");
}

/**
 * 푸시 알림 구독 설정
 */
export async function setupPushNotifications(): Promise<boolean> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return false;
  }

  await registerPushServiceWorker();
  // await initializeFCM(); // Firebase 설정 후 활성화

  return true;
}


