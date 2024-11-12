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
import {
  getHabitsByUser,
  updateHabit,
  deleteHabit,
} from "../../services/habitService";
import { FaEdit, FaTrash } from "react-icons/fa";
import HabitForm from "../habits/HabitForm";
import Header from "../header_footer/Header";
import Footer from "../header_footer/Footer";
import ReminderForm from "../reminders/SetReminderForm";
import "../../styles/global.css"; // Import global styles
import { BAD_HABIT_ALTERNATIVES } from "../../services/habitData"; // Import suggestions and alternatives
import {
  getEntriesByHabit, // Import the function to fetch entries
} from "../../services/habitEntriesService";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

// Extend dayjs with the isBetween plugin
dayjs.extend(isBetween);

// Helper function to get cookie value by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

// Calculate days accomplished/avoided and streak for each habit
const calculateHabitStats = (entries) => {
  const completedEntries = entries
    .filter((entry) => entry.completed)
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort entries by date

  const daysAccomplished = completedEntries.length;

  // Calculate the streak for the latest month
  const currentMonth = dayjs().month();
  const currentMonthEntries = completedEntries.filter(
    (entry) => dayjs(entry.date).month() === currentMonth
  );

  let longestStreak = 0;
  let currentStreak = 0;

  for (let i = 0; i < currentMonthEntries.length; i++) {
    if (i > 0) {
      const previousDate = dayjs(currentMonthEntries[i - 1].date);
      const currentDate = dayjs(currentMonthEntries[i].date);

      if (currentDate.diff(previousDate, "day") === 1) {
        // Consecutive day
        currentStreak++;
      } else {
        // Reset streak if not consecutive
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    } else {
      // Initialize the first day of the streak
      currentStreak = 1;
    }
  }

  // Update longest streak if the last streak was the longest
  longestStreak = Math.max(longestStreak, currentStreak);

  return { daysAccomplished, streak: longestStreak };
};

const AllHabits = () => {
  const [userId, setUserId] = useState("");
  const [habits, setHabits] = useState([]);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [filter, setFilter] = useState("All");
  const [sortOption, setSortOption] = useState("created_at"); // State to track sort option
  const [editHabit, setEditHabit] = useState(null); // Track habit to edit
  const [openModal, setOpenModal] = useState(false); // Control modal state
  const [openReminderModal, setOpenReminderModal] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [totalHabits, setTotalHabits] = useState(0);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        setLoading(true);
        const userId = getCookie("user_id");
        if (!userId) {
          console.error("User ID not found in cookies");
          return;
        }
        setUserId(userId);

        const fetchedHabits = await getHabitsByUser(userId);

        // Fetch habit entries and calculate stats
        const habitsWithStats = await Promise.all(
          fetchedHabits.map(async (habit) => {
            const entries = await getEntriesByHabit(habit.id);
            const { daysAccomplished, streak } = calculateHabitStats(entries);
            return { ...habit, daysAccomplished, streak };
          })
        );

        setTotalHabits(habitsWithStats.length);
        setHabits(habitsWithStats);
        setFilteredHabits(habitsWithStats);
      } catch (error) {
        console.error("Error fetching habits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, []);

  // Sorting by created_at
  const sortByCreatedAt = () => {
    const sortedHabits = [...filteredHabits].sort((a, b) =>
      dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? -1 : 1
    );
    setFilteredHabits(sortedHabits);
  };

  // Sorting by last_updated
  const sortByLastUpdated = () => {
    const sortedHabits = [...filteredHabits].sort((a, b) =>
      dayjs(a.last_updated).isBefore(dayjs(b.last_updated)) ? -1 : 1
    );
    setFilteredHabits(sortedHabits);
  };

  // Sorting functionality based on sortOption
  useEffect(() => {
    let sortedHabits = [...habits];
    if (sortOption === "created_at") {
      sortedHabits.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    } else if (sortOption === "last_updated") {
      sortedHabits.sort(
        (a, b) => new Date(b.last_updated) - new Date(a.last_updated)
      );
    }
    setFilteredHabits(sortedHabits);
  }, [sortOption, habits]);

  const handleFilterChange = (type) => {
    setFilter(type);

    const today = dayjs().startOf("day");
    const startOfWeek = dayjs().startOf("week");

    let filteredHabits;

    if (type === "Today") {
      filteredHabits = habits.filter((habit) =>
        dayjs(habit.created_at).isSame(today, "day")
      );
    } else if (type === "This Week") {
      filteredHabits = habits.filter((habit) =>
        dayjs(habit.created_at).isBetween(startOfWeek, today, "day", "[]")
      );
    } else if (type === "All Time") {
      filteredHabits = habits; // No filtering for all time
    } else if (type === "All") {
      filteredHabits = habits; // Reset to show all habits
    } else {
      // If it's "Good" or "Bad" filter
      filteredHabits = habits.filter((habit) => habit.habitType === type);
    }

    setFilteredHabits(filteredHabits);
    setTotalHabits(filteredHabits.length); // Update total habits based on filter
  };

  const handleSortChange = (option) => {
    setSortOption(option);
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
      const getAlternatives = () => {
        return BAD_HABIT_ALTERNATIVES[updatedHabit.rewardType.toLowerCase()];
      };

      const additionalData =
        updatedHabit.habitType === "Bad"
          ? { alternatives: getAlternatives() }
          : null;

      await updateHabit(editHabit.id, {
        ...updatedHabit,
        ...additionalData,
        last_updated: new Date().toISOString(),
      });

      setHabits((prevHabits) =>
        prevHabits.map((habit) =>
          habit.id === editHabit.id
            ? { ...habit, ...updatedHabit, ...additionalData }
            : habit
        )
      );

      setFilteredHabits((prevFilteredHabits) =>
        prevFilteredHabits.map((habit) =>
          habit.id === editHabit.id
            ? { ...habit, ...updatedHabit, ...additionalData }
            : habit
        )
      );

      handleModalClose();
    } catch (error) {
      console.error("Error updating habit:", error);
    }
  };

  const handleDeleteClick = async (habitId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this habit?"
    );
    if (confirmed) {
      try {
        await deleteHabit(habitId);
        // Update the habits list and the filtered habits list immediately
        const updatedHabits = habits.filter((habit) => habit.id !== habitId);
        setHabits(updatedHabits);
        setFilteredHabits(updatedHabits);

        // Update the total habits count
        setTotalHabits(updatedHabits.length);
      } catch (error) {
        console.error("Error deleting habit:", error);
      }
    }
  };

  const handleVisualizeClick = (habitId) => {
    localStorage.setItem('habitId', habitId); // Store habitId in localStorage
    console.log('habitId', habitId);
    window.location.href = '/visualize-habit'; // Navigate to visualize-habit page
  };

  const handleTrackClick = (habitId) => {
    localStorage.setItem('habitId', habitId); // Store habitId in localStorage
    window.location.href = '/track-habit'; // Navigate to visualize-habit page
  };

  return (
    <Box sx={{ cursor: loading ? "wait" : "auto" }}>
      <Header />
      <Box sx={{ mt: "var(--spacing-xl)", minHeight: "30rem", px: 8 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Box>
              <Chip
                label="Today"
                onClick={() => handleFilterChange("Today")}
                color={filter === "Today" ? "primary" : "default"}
                sx={{ mr: 1 }}
              />
              <Chip
                label="This Week"
                onClick={() => handleFilterChange("This Week")}
                color={filter === "This Week" ? "success" : "default"}
                sx={{ mr: 1 }}
              />
              <Chip
                label="All Time"
                onClick={() => handleFilterChange("All Time")}
                color={filter === "All Time" ? "error" : "default"}
              />
            </Box>
            <Box mt={2}>
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
          </Box>

          <Button
            variant="contained"
            color="warning"
            href="/create-habit"
            sx={{ height: "2.5rem" }}
          >
            Add New Habit
          </Button>
        </Box>

        <Box sx={{ display: "flex", mb: 2 }}>
          <Button variant="outlined" sx={{ mr: 1 }} onClick={sortByCreatedAt}>
            Sort by Last Created
          </Button>
          <Button variant="outlined" onClick={sortByLastUpdated}>
            Sort by Last Modified
          </Button>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 600, mt: 4 }}>
          {" "}
          Total Habits: {totalHabits}{" "}
        </Typography>

        <Grid container spacing={2} mt={2}>
          {filteredHabits.map((habit) => (
            <Grid item xs={12} md={4} key={habit.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  backgroundColor: "var(--color-secondary-background)",
                  borderRadius: "var(--border-radius)",
                  position: "relative",
                  height: "16rem",
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
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(habit.id)}
                  >
                    <FaTrash
                      style={{
                        color: "grey",
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
                  {habit.daysAccomplished || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-text)" }}>
                  Streak: {habit.streak} days
                </Typography>
                <Link sx={{ display: "block" }} href="/all-reminders">
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--color-text)", cursor: "pointer" }}
                  >
                    View All Reminders
                  </Typography>
                </Link>
                <Link onClick={() => handleOpenReminder(habit.id)}>
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--color-text)", cursor: "pointer" }}
                  >
                    Add a Reminder
                  </Typography>
                </Link>
                <Box sx={{ display: "flex", mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    sx={{ mr: 1 }}
                    onClick={() => handleVisualizeClick(habit.id)}
                  >
                    Visualize
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => handleTrackClick(habit.id)}
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
          <Box sx={{ maxWidth: "500px", margin: "auto" }}>
            <ReminderForm
              habitId={selectedHabitId}
              userId={userId}
              onClose={handleCloseReminder}
            />
          </Box>
        </Modal>
      </Box>
      <Footer />
    </Box>
  );
};

export default AllHabits;
