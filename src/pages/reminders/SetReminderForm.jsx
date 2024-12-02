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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getHabitById } from "../../services/habitService";

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
          console.log("Habit Data:", habit);
        })
        .catch((err) => {
          console.error("Error fetching habit data:", err);
        });
    }
  }, [habitId]);

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

  const scheduleNotification = (time, habitData, sound) => {
    let scheduledTime = new Date(time);

    // Check if the given time is in the past
    if (scheduledTime.getTime() <= Date.now()) {
      // If the time is in the past, set the reminder for the same time on the next day
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - Date.now();

    // Notify user that the reminder is being scheduled
    const reminderTime = scheduledTime.toLocaleString(); // Format the reminder time
    toast.info(`Scheduling reminder for ${reminderTime}`, {
      autoClose: 5000,
      closeOnClick: true,
      className: "custom-toast",
    });

    setTimeout(() => {
      if (!("Notification" in window)) {
        console.error("This browser does not support desktop notifications.");
        toast.error("Your browser does not support notifications.");
        return;
      }

      if (Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          if (permission !== "granted") {
            console.error("Please allow notifications to enable reminders.");
            toast.error(
              "Notification permission denied. Please enable notifications."
            );
            return;
          }
        });
      }

      if (Notification.permission === "granted") {
        const habitMessage =
          habitData.type === "good"
            ? `You're doing great! It's time to work on your habit: "${habitData.habitName}".`
            : `Time to check yourself! Avoid your habit: "${habitData.habitName}".`;

        new Notification("Habit Reminder", {
          body: habitMessage,
        });

        toast.success(habitMessage, {
          autoClose: false,
          closeOnClick: true,
        });

        if (sound) {
          playNotificationSound();
        }
      }
    }, delay);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!timePreference) {
      console.error("Time preference is required.");
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
      } else {
        await addReminder(reminderData);
      }

      if (enabled) {
        const notificationTime = `${
          new Date().toISOString().split("T")[0]
        }T${timePreference}:00`;

        scheduleNotification(notificationTime, habitData, notificationType);
        console.log("notificationType", notificationType);
      }

      console.log("Reminder saved successfully!");
      if (onClose) onClose();
    } catch (err) {
      console.error("Error saving reminder:", err);
      console.error("Failed to save the reminder. Please try again.");
    }
  };
  // Request Notification Permission on Form Load
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
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
