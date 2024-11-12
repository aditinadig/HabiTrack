// src/pages/habits/ReminderForm.jsx
import React, { useState } from "react";
import { Container, Typography, Paper, Switch, TextField, RadioGroup, FormControlLabel, Radio, Button, Box } from "@mui/material";
import { addReminder } from "../../services/reminderService";

const SetReminderForm = ({ habitId, userId, onClose }) => {
  const [enabled, setEnabled] = useState(false);
  const [timePreference, setTimePreference] = useState("");
  const [notificationType, setNotificationType] = useState("sound");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reminderData = {
      userId,
      habitId,
      enabled,
      timePreference,
      notificationType,
    };
    await addReminder(reminderData);
    onClose();
  };

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
          sx={{ color: "var(--color-primary)", fontWeight: "bold", mb: 2, textAlign: "center" }}
        >
          Reminders & Notifications
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>
              Enable Notifications
            </Typography>
            <Switch checked={enabled} onChange={() => setEnabled(!enabled)} />
          </Box>

          <Typography variant="body1" sx={{ fontWeight: 600, textAlign: "left", mb: 1 }}>
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

          <Typography variant="body1" sx={{ fontWeight: 600, textAlign: "left", mb: 1 }}>
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
            href="/all-habits"
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
    </Container>
  );
};

export default SetReminderForm;