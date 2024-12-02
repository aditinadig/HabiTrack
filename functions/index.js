const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp();

// Listen to new reminders in Firestore and schedule notifications
exports.scheduleReminderNotification = functions.firestore
  .document("Reminders/{reminderId}")
  .onCreate(async (snap) => {
    const reminder = snap.data();

    if (!reminder.enabled) return; // Skip if notifications are disabled

    const message = {
      notification: {
        title: "Reminder Notification",
        body: `It's time for your habit!`,
      },
      token: reminder.userToken, // FCM token of the user
    };

    try {
      // Schedule notification for the specified time
      const scheduleTime = new Date(); // Customize based on `reminder.timePreference`
      scheduleTime.setHours(
        parseInt(reminder.timePreference.split(":")[0]),
        parseInt(reminder.timePreference.split(":")[1]),
        0
      );

      const delay = scheduleTime.getTime() - Date.now();
      if (delay > 0) {
        setTimeout(async () => {
          await admin.messaging().send(message);
          console.log("Notification sent:", reminder.userToken);
        }, delay);
      } else {
        console.log("Time has already passed, skipping notification.");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });