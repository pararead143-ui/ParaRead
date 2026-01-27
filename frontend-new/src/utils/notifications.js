// src/utils/notifications.js

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
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
};

export const showNotification = (title, options = {}) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/logo192.png", // your app icon
      badge: "/logo192.png",
      ...options,
    });
  }
};

export const checkNotificationPreference = async () => {
  try {
    const res = await fetch("/api/user", { credentials: "include" });
    if (!res.ok) return false;
    const data = await res.json();
    return data.notifications ?? false;
  } catch (err) {
    console.error(err);
    return false;
  }
};