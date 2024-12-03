// IndexedDB setup
const dbName = "notificationDB";
const storeName = "scheduledNotifications";

const openDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "reminderId" });
        console.log(`Object store "${storeName}" created.`);
      }
    };

    request.onsuccess = () => {
      console.log("IndexedDB Opened Successfully");
      resolve(request.result);
    };

    request.onerror = (error) => {
      console.error("Error opening IndexedDB:", error);
      reject(error);
    };
  });
};

const addToDB = async (reminderId, notificationTime, timeoutId) => {
  console.log("Adding to DB:", reminderId, notificationTime);
  const db = await openDB();
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);

  return new Promise((resolve, reject) => {
    const request = store.put({ reminderId, notificationTime });

    request.onsuccess = async () => {
      timeoutMap.set(reminderId, timeoutId); // Add to timeout map
      console.log(
        `Added to DB: ReminderID=${reminderId}, NotificationTime=${notificationTime}`
      );
      const allData = await getAllFromDB();
      console.log("DB Contents After Add:", allData);
      resolve();
    };

    request.onerror = (error) => {
      console.error("Error adding to DB:", error);
      reject(error);
    };
  });
};

const removeFromDB = async (reminderId) => {
  const db = await openDB();
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);

  return new Promise((resolve, reject) => {
    const request = store.delete(reminderId);

    request.onsuccess = async () => {
      const timeoutId = timeoutMap.get(reminderId);
      if (timeoutId) {
        clearTimeout(timeoutId); // Cancel the timeout
        timeoutMap.delete(reminderId); // Remove from the map
      }
      console.log(`Removed from DB: ReminderID=${reminderId}`);
      const allData = await getAllFromDB();
      console.log("DB Contents After Remove:", allData);
      resolve();
    };

    request.onerror = (error) => {
      console.error("Error removing from DB:", error);
      reject(error);
    };
  });
};

const getAllFromDB = async () => {
  const db = await openDB();
  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      console.log("getAllFromDB Results:", request.result);
      resolve(request.result);
    };

    request.onerror = (error) => {
      console.error("Error fetching from DB:", error);
      reject(error);
    };
  });
};

// Track active timeouts
const timeoutMap = new Map();

// Service Worker Event Listeners
self.addEventListener("install", (event) => {
  console.log("Service Worker Installed");
  self.skipWaiting();
});

self.addEventListener("activate", async (event) => {
  console.log("Service Worker Activated");

  const allNotifications = await getAllFromDB();
  console.log("Re-scheduling notifications from DB:", allNotifications);

  allNotifications.forEach(({ reminderId, notificationTime }) => {
    const scheduledTime = new Date(notificationTime).getTime();
    const delay = scheduledTime - Date.now();

    if (delay > 0) {
      const timeoutId = setTimeout(() => {
        self.registration.showNotification("Habit Reminder", {
          body: `It's time for your reminder: ${reminderId}`,
        });
        removeFromDB(reminderId); // Remove from DB once triggered
      }, delay);

      timeoutMap.set(reminderId, timeoutId); // Track the timeout
      console.log(`Re-scheduled notification for reminderId: ${reminderId}`);
    } else {
      console.warn(
        `Scheduled time for ${reminderId} is in the past. Cleaning up.`
      );
      removeFromDB(reminderId); // Clean up expired reminders
    }
  });
});

self.addEventListener("message", async (event) => {
  const { type } = event.data;

  if (type === "SCHEDULE_NOTIFICATION") {
    const reminderData = event.data.reminderData;

    if (!reminderData || !reminderData.id) {
      console.error("Invalid reminder data received");
      return;
    }

    const reminderId = reminderData.id;

    console.log(`Scheduling notification for reminderId: ${reminderId}`);
    const { notificationTime } = reminderData;

    // Remove existing reminder before scheduling the updated one
    if (timeoutMap.has(reminderId)) {
      console.log(`Removing existing notification for reminderId: ${reminderId}`);
      await removeFromDB(reminderId); // Remove old data from DB
    }

    const scheduledTime = new Date(notificationTime).getTime();
    const delay = scheduledTime - Date.now();

    if (delay > 0) {
      const timeoutId = setTimeout(() => {
        self.registration.showNotification("Habit Reminder", {
          body: `It's time for your reminder: ${reminderId}`,
        });
        removeFromDB(reminderId); // Remove from DB once triggered
      }, delay);

      await addToDB(reminderId, notificationTime, timeoutId); // Save data to DB and timeoutMap
      console.log(`Notification scheduled for reminderId: ${reminderId}`);
      console.log("Current DB Contents:", await getAllFromDB());
    } else {
      console.warn(`Scheduled time for ${reminderId} is in the past.`);
    }
  } else if (type === "DELETE_NOTIFICATION") {
    const reminderId = event.data.reminderId;
    console.log(`Deleting notification for reminderId: ${reminderId}`);
    const allNotifications = await getAllFromDB();
    console.log("Before Delete - DB Contents:", allNotifications);

    const notificationToDelete = allNotifications.find(
      (notification) => notification.reminderId === reminderId
    );

    if (notificationToDelete) {
      clearTimeout(timeoutMap.get(reminderId)); // Cancel the timeout
      timeoutMap.delete(reminderId); // Remove from the map
      await removeFromDB(reminderId); // Remove from DB
      console.log(`Notification for reminderId ${reminderId} deleted.`);
      console.log("After Delete - DB Contents:", await getAllFromDB());
    }
  }
});