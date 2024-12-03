import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Divider,
  Modal,
  Button,
} from "@mui/material";
import {
  getRemindersByHabit,
  deleteReminder,
  updateReminder,
} from "../../services/reminderService";
import { FaTrash, FaEdit } from "react-icons/fa";
import { MdNotificationsActive } from "react-icons/md";
import SetReminderForm from "./SetReminderForm";

const AllReminders = ({ habitId }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  // Check if a reminder is in the past
  const isReminderCompleted = (reminder) => {
    if (reminder.frequency !== "once") {
      // If the frequency is not "once", do not mark as completed
      return false;
    }

    const now = new Date();
    const [hours, minutes] = reminder.timePreference.split(":").map(Number);

    const reminderTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0
    );

    return reminderTime <= now;
  };

  useEffect(() => {
    const fetchReminders = async () => {
      setLoading(true);
      try {
        const fetchedReminders = await getRemindersByHabit(habitId);

        // Optional: Mark reminders as completed in the database if they are past
        const updatedReminders = fetchedReminders.map((reminder) => ({
          ...reminder,
          completed: isReminderCompleted(reminder),
        }));

        setReminders(updatedReminders);
      } catch (err) {
        console.error("Error fetching reminders:", err);
        setError("Failed to fetch reminders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (habitId) fetchReminders();
  }, [habitId, openEditModal]);

  const handleDeleteReminder = async (reminderId) => {
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.active.postMessage({
          type: "DELETE_NOTIFICATION",
          reminderId,
        });
      }
      await deleteReminder(reminderId);
      alert("Reminder deleted successfully.");
      setReminders((prevReminders) =>
        prevReminders.filter((reminder) => reminder.id !== reminderId)
      );
    } catch (err) {
      console.error("Error deleting reminder:", err);
      setError("Failed to delete reminder. Please try again.");
    }
  };

  const handleEditClick = (reminder) => {
    setSelectedReminder(reminder);
    setOpenEditModal(true);
  };

  const handleEditSubmit = async (updatedReminder) => {
    try {
      await updateReminder(updatedReminder.id, updatedReminder);
      setReminders((prevReminders) =>
        prevReminders.map((reminder) =>
          reminder.id === updatedReminder.id ? updatedReminder : reminder
        )
      );
      setOpenEditModal(false);
    } catch (err) {
      console.error("Error updating reminder:", err);
      setError("Failed to update reminder. Please try again.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
        <Typography>Loading Reminders...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (reminders.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          margin: "auto",
          mt: 12,
          p: 12,
          minHeight: "15rem",
          backgroundColor: "var(--color-secondary-background)",
        }}
      >
        <Typography
          variant="body1"
          sx={{ mt: 2, textAlign: "center", fontWeight: 600 }}
        >
          No reminders found for this habit.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          backgroundColor: "var(--color-secondary-background)",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            mb: 3,
            color: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <MdNotificationsActive size={24} /> All Reminders
        </Typography>
        <List>
          {reminders.map((reminder, index) => {
            const completed = isReminderCompleted(reminder);

            return (
              <Box key={reminder.id}>
                <ListItem
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    backgroundColor: completed ? "#f5f5f5" : "#FFF",
                    borderRadius: "8px",
                    boxShadow: completed
                      ? "none"
                      : "0 2px 8px rgba(0, 0, 0, 0.1)",
                    p: 2,
                  }}
                >
                  <ListItemText
                    primary={
                      <>
                        <Typography
                          component="span"
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: completed ? "gray" : "var(--color-text)",
                          }}
                        >
                          Notification:{" "}
                          {reminder.notificationType.toUpperCase()}
                        </Typography>
                        <br />
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{ color: "gray" }}
                        >
                          Frequency: {reminder.frequency.toUpperCase()}
                        </Typography>
                        {reminder.customDays && (
                          <>
                            <br />
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{ color: "gray" }}
                            >
                              Custom Days:{" "}
                              {reminder.customDays
                                .map(
                                  (day) =>
                                    [
                                      "Sunday",
                                      "Monday",
                                      "Tuesday",
                                      "Wednesday",
                                      "Thursday",
                                      "Friday",
                                      "Saturday",
                                    ][day]
                                )
                                .join(", ")}
                            </Typography>
                          </>
                        )}
                      </>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: completed
                              ? "gray"
                              : "var(--color-secondary-text)",
                          }}
                        >
                          Time: {reminder.timePreference}
                        </Typography>
                        <br />
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{ color: "gray" }}
                        >
                          Enabled: {reminder.enabled ? "Yes" : "No"}
                        </Typography>
                      </>
                    }
                  />
                  {!completed && (
                    <Box>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditClick(reminder)}
                        sx={{
                          backgroundColor: "rgba(63, 81, 181, 0.1)",
                          "&:hover": {
                            backgroundColor: "rgba(63, 81, 181, 0.2)",
                          },
                          mr: 1,
                        }}
                      >
                        <FaEdit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteReminder(reminder.id)}
                        sx={{
                          backgroundColor: "rgba(255, 0, 0, 0.1)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 0, 0, 0.2)",
                          },
                        }}
                      >
                        <FaTrash />
                      </IconButton>
                    </Box>
                  )}
                </ListItem>
                {index < reminders.length - 1 && <Divider />}
              </Box>
            );
          })}
        </List>
      </Paper>

      <Modal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflowY: "scroll",
        }}
      >
        <Box
          sx={{
            width: "700px",
            p: 3,
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <SetReminderForm
            reminder={selectedReminder}
            habitId={habitId}
            userId={selectedReminder?.userId}
            onClose={() => setOpenEditModal(false)}
          />
        </Box>
      </Modal>
    </>
  );
};

export default AllReminders;
