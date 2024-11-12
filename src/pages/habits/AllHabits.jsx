// src/pages/habits/AllHabits.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  IconButton,
  Modal,
  Link,
} from "@mui/material";
import { getHabitsByUser, updateHabit } from "../../services/habitService";
import { FaEdit } from "react-icons/fa";
import HabitForm from "../habits/HabitForm";
import Header from "../header_footer/Header";
import Footer from "../header_footer/Footer";
import ReminderForm from "../reminders/SetReminderForm";
import "../../styles/global.css"; // Import global styles

// Helper function to get cookie value by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

const AllHabits = () => {
  const [userId, setUserId] = useState("");
  const [habits, setHabits] = useState([]);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [filter, setFilter] = useState("All");
  const [editHabit, setEditHabit] = useState(null); // Track habit to edit
  const [openModal, setOpenModal] = useState(false); // Control modal state
  const [openReminderModal, setOpenReminderModal] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState(null);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const userId = getCookie("user_id");
        if (!userId) {
          console.error("User ID not found in cookies");
          return;
        }
        setUserId(getCookie("user_id"));
        const fetchedHabits = await getHabitsByUser(userId);
        setHabits(fetchedHabits);
        setFilteredHabits(fetchedHabits);
      } catch (error) {
        console.error("Error fetching habits:", error);
      }
    };

    fetchHabits();
  }, []);

  const handleFilterChange = (type) => {
    setFilter(type);
    if (type === "All") {
      setFilteredHabits(habits);
    } else {
      setFilteredHabits(habits.filter((habit) => habit.habitType === type));
    }
  };

  const handleEditClick = (habit) => {
    setEditHabit(habit);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setEditHabit(null);
  };

  const handleOpenReminder = (habit) => {
    setSelectedHabitId(habit);
    setOpenReminderModal(true);
  };

  const handleCloseReminder = () => {
    setOpenReminderModal(false);
    setSelectedHabitId(null);
  };

  const handleUpdateHabit = async (updatedHabit) => {
    try {
      await updateHabit(editHabit.id, updatedHabit);

      setHabits((prevHabits) =>
        prevHabits.map((habit) =>
          habit.id === editHabit.id ? { ...habit, ...updatedHabit } : habit
        )
      );

      setFilteredHabits((prevFilteredHabits) =>
        prevFilteredHabits.map((habit) =>
          habit.id === editHabit.id ? { ...habit, ...updatedHabit } : habit
        )
      );

      handleModalClose();
    } catch (error) {
      console.error("Error updating habit:", error);
    }
  };

  return (
    <Box>
      <Header />
      <Container sx={{ mt: "var(--spacing-xl)", minHeight: "30rem" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Chip
              label="All"
              onClick={() => handleFilterChange("All")}
              color={filter === "All" ? "primary" : "default"}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Good"
              onClick={() => handleFilterChange("Good")}
              color={filter === "Good" ? "success" : "default"}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Bad"
              onClick={() => handleFilterChange("Bad")}
              color={filter === "Bad" ? "error" : "default"}
            />
          </Box>
          <Button variant="contained" color="warning" href="/create-habit">
            Add New Habit
          </Button>
        </Box>

        <Box sx={{ display: "flex", mb: 2 }}>
          <Button variant="outlined" sx={{ mr: 1 }}>
            Sort by Frequency
          </Button>
          <Button variant="outlined">Sort by Days Tracked</Button>
        </Box>

        <Grid container spacing={2} mt={4}>
          {filteredHabits.map((habit) => (
            <Grid item xs={12} md={4} key={habit.id}>
              <Paper
                elevation={3}
                sx={{
                  padding: "var(--spacing-md)",
                  backgroundColor: "var(--color-secondary-background)",
                  borderRadius: "var(--border-radius)",
                  position: "relative",
                  height: "14rem",
                }}
              >
                <Box sx={{ position: "absolute", top: "18px", right: "4px" }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditClick(habit)}
                  >
                    <FaEdit
                      style={{
                        color: "var(--color-primary)",
                        cursor: "pointer",
                      }}
                    />
                  </IconButton>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {habit.habitName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: habit.habitType === "Good" ? "green" : "maroon",
                    mb: 1,
                  }}
                >
                  {habit.habitType} Habit
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-text)" }}>
                  {habit.habitType === "Bad"
                    ? "Days Avoided:"
                    : "Days Accomplished:"}{" "}
                  {habit.daysAvoided || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-text)" }}>
                  Streak: {habit.streak} days
                </Typography>
                <Link sx={{ display: "block" }} href="/all-reminders">
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--color-text)" }}
                  >
                    View All Reminders
                  </Typography>
                </Link>
                <Link onClick={() => handleOpenReminder(habit.id)}>
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--color-text)" }}
                  >
                    Add a Reminder
                  </Typography>
                </Link>
                <Box sx={{ display: "flex", mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    sx={{ mr: 1 }}
                    href={`/habits/visualize/${habit.id}`}
                  >
                    Visualize
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    href={`/habits/track/${habit.id}`}
                  >
                    Track
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Edit Habit Modal */}
        <Modal
          open={openModal}
          onClose={handleModalClose}
          sx={{ overflowY: "scroll" }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "500px",
              margin: "auto",
              mt: 2,
              mb: 2,
              p: 2,
              backgroundColor: "white",
              borderRadius: "8px",
            }}
          >
            <HabitForm
              title="Edit Habit"
              habitData={editHabit}
              handleChange={(e) =>
                setEditHabit({ ...editHabit, [e.target.name]: e.target.value })
              }
              handleSubmit={(e) => {
                e.preventDefault();
                handleUpdateHabit(editHabit);
              }}
              buttonText="Update"
            />
          </Box>
        </Modal>
        <Modal open={openReminderModal} onClose={handleCloseReminder}>
          <Box sx={{ maxWidth: "500px", margin: "auto"}}>
            <ReminderForm
              habitId={selectedHabitId}
              userId={userId}
              onClose={handleCloseReminder}
            />
          </Box>
        </Modal>
      </Container>
      <Footer />
    </Box>
  );
};

export default AllHabits;
