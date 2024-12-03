import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Switch,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Box,
  Snackbar,
  Alert,
  Checkbox,
  FormGroup,
} from "@mui/material";
import { addReminder, updateReminder } from "../../services/reminderService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getHabitById } from "../../services/habitService";

// Helper to register the service worker
const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker Registered");
    } catch (error) {
      console.error("Service Worker Registration Failed:", error);
    }
  }
};

const SetReminderForm = ({ reminder, habitId, userId, onClose }) => {
  const [enabled, setEnabled] = useState(reminder?.enabled || true);
  const [timePreference, setTimePreference] = useState(
    reminder?.timePreference || ""
  );
  const [notificationType, setNotificationType] = useState(
    reminder?.notificationType || "sound"
  );
  const [frequency, setFrequency] = useState(reminder?.frequency || "daily");
  const [customDays, setCustomDays] = useState(reminder?.customDays || []);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [habitData, setHabitData] = useState(null);
  const [scheduledReminders, setScheduledReminders] = useState([]);

  const daysOfWeek = [
    { label: "Sunday", value: 0 },
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
  ];

  useEffect(() => {
    if (reminder) {
      setEnabled(reminder.enabled);
      setTimePreference(reminder.timePreference);
      setNotificationType(reminder.notificationType);
      setFrequency(reminder.frequency);
      setCustomDays(reminder.customDays || []);
    }
  }, [reminder]);

  useEffect(() => {
    if (habitId) {
      getHabitById(habitId)
        .then((habit) => {
          setHabitData(habit);
        })
        .catch((err) => {
          console.error("Error fetching habit data:", err);
        });
    }
  }, [habitId]);

  useEffect(() => {
    requestNotificationPermission();
    registerServiceWorker(); // Register the service worker on load
  }, []);

  const handleDayToggle = (day) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter((d) => d !== day));
    } else {
      setCustomDays([...customDays, day]);
    }
  };

  // Request Notification Permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted.");
      } else {
        console.error("Notification permission denied.");
      }
    }
  };

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set waveform and frequency
    oscillator.type = "sine"; // Options: 'sine', 'square', 'sawtooth', 'triangle'
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Frequency in Hz (440Hz is A4 note)

    // Play sound
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5); // Play for 0.5 seconds
  };

  // Schedule notification using the service worker
  const scheduleNotification = async (reminderData) => {
    if ("serviceWorker" in navigator && "Notification" in window) {
      const registration = await navigator.serviceWorker.ready;

      // Send the reminder data to the service worker
      registration.active.postMessage({
        type: "SCHEDULE_NOTIFICATION",
        reminderData,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let returnedReminderId = "";

    if (!timePreference) {
      toast.error("Time preference is required.");
      return;
    }

    const reminderData = {
      userId,
      habitId,
      enabled,
      timePreference,
      notificationType,
      frequency,
      customDays: frequency === "custom" ? customDays : null,
    };

    try {
      if (reminder?.id) {
        await updateReminder(reminder.id, reminderData);
        returnedReminderId = reminder.id;
      } else {
        returnedReminderId = await addReminder(reminderData);
      }

      reminderData.id = returnedReminderId;

      if (enabled) {
        const currentDate = new Date();
        const [hours, minutes] = timePreference.split(":").map(Number);

        const scheduleDates = []; // Store notification dates
        const userFriendlyDates = []; // Store human-readable dates for the user

        // Helper function to adjust past dates
        const adjustPastDate = (date) => {
          if (date <= currentDate) {
            date.setDate(date.getDate() + 1); // Move to the next day
          }
          return date;
        };

        switch (frequency) {
          case "daily":
            for (let i = 0; i < 7; i++) {
              const notificationDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate() + i,
                hours,
                minutes,
                0
              );
              scheduleDates.push(adjustPastDate(notificationDate));
            }
            break;

          case "weekdays":
            for (let i = 0; i < 7; i++) {
              const notificationDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate() + i,
                hours,
                minutes,
                0
              );
              if (
                notificationDate.getDay() >= 1 &&
                notificationDate.getDay() <= 5
              ) {
                scheduleDates.push(adjustPastDate(notificationDate));
              }
            }
            break;

          case "weekends":
            for (let i = 0; i < 7; i++) {
              const notificationDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate() + i,
                hours,
                minutes,
                0
              );
              if (
                notificationDate.getDay() === 0 ||
                notificationDate.getDay() === 6
              ) {
                scheduleDates.push(adjustPastDate(notificationDate));
              }
            }
            break;

          case "custom":
            customDays.forEach((day) => {
              for (let i = 0; i < 7; i++) {
                const notificationDate = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate() + i,
                  hours,
                  minutes,
                  0
                );
                if (notificationDate.getDay() === day) {
                  scheduleDates.push(adjustPastDate(notificationDate));
                }
              }
            });
            break;

          case "once":
          default:
            const notificationDate = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
              hours,
              minutes,
              0
            );
            scheduleDates.push(adjustPastDate(notificationDate));
        }

        await Promise.all(
          scheduleDates.map(async (date) => {
            try {
              const notificationTime = `${date.getFullYear()}-${String(
                date.getMonth() + 1
              ).padStart(2, "0")}-${String(date.getDate()).padStart(
                2,
                "0"
              )}T${String(date.getHours()).padStart(2, "0")}:${String(
                date.getMinutes()
              ).padStart(2, "0")}:${String(date.getSeconds()).padStart(
                2,
                "0"
              )}`;

              await scheduleNotification({
                ...reminderData,
                notificationTime,
              });

              // Add human-readable time to user-friendly dates
              userFriendlyDates.push(
                new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(date)
              );

            } catch (err) {
              console.error(
                "Error scheduling notification for date:",
                date,
                err
              );
            }
          })
        );

        // Update state with user-friendly dates
        setScheduledReminders(userFriendlyDates);

        // Use local variable instead of state
        alert(`Reminders set for: ${userFriendlyDates.join(", ")}`);
        toast.success(`Reminders set for: ${userFriendlyDates.join(", ")}`, {
          autoClose: 5000,
        });

      }


      if (onClose) onClose();
    } catch (err) {
      console.error("Error saving reminder:", err);
      toast.error("Failed to save the reminder. Please try again.");
    }
  };
  // Request Notification Permission on Form Load
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const notifications =
      JSON.parse(localStorage.getItem("notifications")) || [];
    notifications.forEach((notification) => {
      toast(notification.message, { type: notification.type });
    });
    localStorage.removeItem("notifications"); // Clear notifications after showing
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <ToastContainer />
      <Paper
        elevation={3}
        sx={{
          p: 4,
          backgroundColor: "var(--color-secondary-background)",
          borderRadius: "12px",
          border: "1px solid var(--color-primary)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "var(--color-primary)",
            fontWeight: "bold",
            mb: 2,
            textAlign: "center",
          }}
        >
          {reminder?.id ? "Edit Reminder" : "Add Reminder"}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>
              Enable Notifications
            </Typography>
            <Switch checked={enabled} onChange={() => setEnabled(!enabled)} />
          </Box>

          <Typography
            variant="body1"
            sx={{ fontWeight: 600, textAlign: "left", mb: 1 }}
          >
            Time Preferences
          </Typography>
          <TextField
            type="time"
            fullWidth
            value={timePreference}
            onChange={(e) => setTimePreference(e.target.value)}
            sx={{
              mb: 2,
              backgroundColor: "var(--color-primary-background)",
              borderRadius: "4px",
            }}
          />

          <Typography
            variant="body1"
            sx={{ fontWeight: 600, textAlign: "left", mb: 1 }}
          >
            Notification Frequency
          </Typography>
          <RadioGroup
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            sx={{ textAlign: "left", mb: 2 }}
          >
            <FormControlLabel
              value="daily"
              control={<Radio />}
              label="Every Day"
            />
            <FormControlLabel
              value="weekdays"
              control={<Radio />}
              label="Every Weekday (Monday to Friday)"
            />
            <FormControlLabel
              value="once"
              control={<Radio />}
              label="Just Once"
            />
            <FormControlLabel
              value="custom"
              control={<Radio />}
              label="Choose Days"
            />
          </RadioGroup>

          {frequency === "custom" && (
            <FormGroup row sx={{ mb: 2 }}>
              {daysOfWeek.map((day) => (
                <FormControlLabel
                  key={day.value}
                  control={
                    <Checkbox
                      checked={customDays.includes(day.value)}
                      onChange={() => handleDayToggle(day.value)}
                    />
                  }
                  label={day.label}
                />
              ))}
            </FormGroup>
          )}

          <Typography
            variant="body1"
            sx={{ fontWeight: 600, textAlign: "left", mb: 1 }}
          >
            Notification Type
          </Typography>
          <RadioGroup
            value={notificationType}
            onChange={(e) => setNotificationType(e.target.value)}
            sx={{ textAlign: "left", mb: 2 }}
          >
            <FormControlLabel
              value="sound"
              control={<Radio />}
              label="Push notification with sound"
            />
            <FormControlLabel
              value="vibration"
              control={<Radio />}
              label="Push notification with vibration"
            />
          </RadioGroup>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "var(--color-button-bg)",
              "&:hover": {
                backgroundColor: "var(--color-button-hover-bg)",
              },
              color: "#fff",
              fontWeight: 600,
              fontSize: "var(--font-size-base)",
            }}
          >
            Save Settings
          </Button>
        </form>
      </Paper>

      {/* Snackbar for Success */}
      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Reminder saved successfully!
        </Alert>
      </Snackbar>

      {/* Snackbar for Error */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError("")}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SetReminderForm;
