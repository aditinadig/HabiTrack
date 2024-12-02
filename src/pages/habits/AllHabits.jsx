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
import AllReminders from "../reminders/AllReminders";
import "../../styles/global.css";
import { BAD_HABIT_ALTERNATIVES } from "../../services/habitData";
import { getEntriesByHabit } from "../../services/habitEntriesService";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

const calculateHabitStats = (entries) => {
  const completedEntries = entries
    .filter((entry) => entry.completed)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const daysAccomplished = completedEntries.length;

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
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { daysAccomplished, streak: longestStreak };
};

const AllHabits = () => {
  const [userId, setUserId] = useState("");
  const [habits, setHabits] = useState([]);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [timeFilter, setTimeFilter] = useState("allTime");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("created_at");
  const [editHabit, setEditHabit] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openReminderModal, setOpenReminderModal] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [totalHabits, setTotalHabits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openAllReminders, setOpenAllReminders] = useState(false);

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

  useEffect(() => {
    applyFilters();
  }, [timeFilter, typeFilter, habits]);

  const applyFilters = () => {
    let filtered = [...habits];

    const today = dayjs().startOf("day");
    const startOfWeek = dayjs().startOf("week");

    if (timeFilter === "today") {
      filtered = filtered.filter((habit) =>
        dayjs(habit.created_at).isSame(today, "day")
      );
    } else if (timeFilter === "thisWeek") {
      filtered = filtered.filter((habit) =>
        dayjs(habit.created_at).isBetween(startOfWeek, today, "day", "[]")
      );
    }

    if (typeFilter === "good") {
      filtered = filtered.filter((habit) => habit.habitType === "Good");
    } else if (typeFilter === "bad") {
      filtered = filtered.filter((habit) => habit.habitType === "Bad");
    }

    setFilteredHabits(filtered);
    setTotalHabits(filtered.length);
  };

  const handleTimeFilterChange = (time) => {
    setTimeFilter(time);
  };

  const handleTypeFilterChange = (type) => {
    setTypeFilter(type);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    let sortedHabits = [...filteredHabits];
    if (option === "created_at") {
      sortedHabits.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    } else if (option === "last_updated") {
      sortedHabits.sort(
        (a, b) => new Date(b.last_updated) - new Date(a.last_updated)
      );
    }
    setFilteredHabits(sortedHabits);
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

  const handleOpenAllReminders = (habit) => {
    setOpenAllReminders(true);
    setSelectedHabitId(habit);
  };

  const handleCloseAllReminders = () => {
    setOpenAllReminders(false);
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
        const updatedHabits = habits.filter((habit) => habit.id !== habitId);
        setHabits(updatedHabits);
        setFilteredHabits(updatedHabits);
        setTotalHabits(updatedHabits.length);
      } catch (error) {
        console.error("Error deleting habit:", error);
      }
    }
  };

  const handleVisualizeClick = (habitId) => {
    localStorage.setItem("habitId", habitId);
    window.location.href = "/visualize-habit";
  };

  const handleTrackClick = (habitId) => {
    localStorage.setItem("habitId", habitId);
    window.location.href = "/track-habit";
  };

  return (
    <Box sx={{ cursor: loading ? "wait" : "auto" }}>
      <Header />
      <Box sx={{ mt: "var(--spacing-xl)", minHeight: "30rem", px: 8 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Box>
              {/* <Typography variant="h6" sx={{ mb: 1 }}>
                Time Filters
              </Typography> */}
              <Chip
                label="Today"
                onClick={() => handleTimeFilterChange("today")}
                color={timeFilter === "today" ? "primary" : "default"}
                sx={{ mr: 1 }}
              />
              <Chip
                label="This Week"
                onClick={() => handleTimeFilterChange("thisWeek")}
                color={timeFilter === "thisWeek" ? "primary" : "default"}
                sx={{ mr: 1 }}
              />
              <Chip
                label="All Time"
                onClick={() => handleTimeFilterChange("allTime")}
                color={timeFilter === "allTime" ? "primary" : "default"}
              />
            </Box>
            <Box mt={2}>
              {/* <Typography variant="h6" sx={{ mb: 1 }}>
                Type Filters
              </Typography> */}
              <Chip
                label="All"
                onClick={() => handleTypeFilterChange("all")}
                color={typeFilter === "all" ? "primary" : "default"}
                sx={{ mr: 1 }}
              />
              <Chip
                label="Good"
                onClick={() => handleTypeFilterChange("good")}
                color={typeFilter === "good" ? "success" : "default"}
                sx={{ mr: 1 }}
              />
              <Chip
                label="Bad"
                onClick={() => handleTypeFilterChange("bad")}
                color={typeFilter === "bad" ? "error" : "default"}
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
          <Button
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={() => handleSortChange("created_at")}
          >
            Sort by Last Created
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleSortChange("last_updated")}
          >
            Sort by Last Modified
          </Button>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 600, mt: 4 }}>
          Total Habits: {totalHabits}
        </Typography>

        <Grid container spacing={3} mt={3}>
          {filteredHabits.map((habit) => (
            <Grid item xs={12} md={4} key={habit.id}>
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  backgroundColor:
                    habit.habitType === "Good" ? "#E8F5E9" : "#FFEBEE",
                  borderRadius: "12px",
                  position: "relative",
                  height: "20rem",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ position: "absolute", top: "25px", right: "25px" }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditClick(habit)}
                    sx={{
                      backgroundColor: "rgba(63, 81, 181, 0.1)",
                      "&:hover": { backgroundColor: "rgba(63, 81, 181, 0.2)" },
                    }}
                  >
                    <FaEdit style={{ color: "var(--color-primary)" }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(habit.id)}
                    sx={{
                      backgroundColor: "rgba(255, 0, 0, 0.1)",
                      "&:hover": { backgroundColor: "rgba(255, 0, 0, 0.2)" },
                      ml: 1,
                    }}
                  >
                    <FaTrash style={{ color: "grey" }} />
                  </IconButton>
                </Box>

                <Box>
                  <Typography
                    component="div" // Ensures this Typography renders as a <div> instead of <p>
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: habit.habitType === "Good" ? "#2E7D32" : "#C62828",
                      mb: 0,
                    }}
                  >
                    {habit.habitName}
                  </Typography>
                  <Typography
                    component="div"
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: habit.habitType === "Good" ? "#388E3C" : "#D32F2F",
                      mb: 2,
                    }}
                  >
                    {habit.habitType} Habit
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    component="div"
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "var(--color-text)",
                      textAlign: "left",
                    }}
                  >
                    {habit.habitType === "Bad"
                      ? "Days Avoided:"
                      : "Days Accomplished:"}{" "}
                    <span style={{ fontWeight: 700 }}>
                      {habit.daysAccomplished || 0}
                    </span>
                  </Typography>
                  <Typography
                    component="div"
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "var(--color-text)",
                      textAlign: "left",
                    }}
                  >
                    Streak:{" "}
                    <span style={{ fontWeight: 700 }}>{habit.streak} days</span>
                  </Typography>
                  <Typography
                    component="div"
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "var(--color-text)",
                      textAlign: "left",
                    }}
                  >
                    Created On:{" "}
                    <span style={{ fontWeight: 700 }}>
                      {dayjs(habit.created_at).format("MM-DD-YYYY")}
                    </span>
                  </Typography>
                  <Typography
                    component="div"
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "var(--color-text)",
                      textAlign: "left",
                    }}
                  >
                    Updated On:{" "}
                    <span style={{ fontWeight: 700 }}>
                      {dayjs(habit.updated_on).format("MM-DD-YYYY")}
                    </span>
                  </Typography>
                </Box>

                <Box>
                  <Link
                    sx={{
                      display: "block",
                      color: "var(--color-primary)",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      mb: 1,
                      mt: 1,
                      textAlign: "left",
                      "&:hover": { textDecoration: "underline" },
                    }}
                    onClick={() => handleOpenAllReminders(habit.id)}
                  >
                    View All Reminders
                  </Link>
                  <Link
                    sx={{
                      display: "block",
                      color: "var(--color-primary)",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      textAlign: "left",
                      "&:hover": { textDecoration: "underline" },
                    }}
                    onClick={() => handleOpenReminder(habit.id)}
                  >
                    Add a Reminder
                  </Link>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 3,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{ width: "48%", fontWeight: 600 }}
                    onClick={() => handleVisualizeClick(habit.id)}
                  >
                    Visualize
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    sx={{ width: "48%", fontWeight: 600 }}
                    onClick={() => handleTrackClick(habit.id)}
                  >
                    Track
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Modal
          open={openModal}
          onClose={handleModalClose}
          sx={{ overflowY: "scroll" }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "700px",
              margin: "auto",
              mt: 2,
              mb: 2,
              p: 2,
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

        <Modal
          open={openReminderModal}
          onClose={handleCloseReminder}
          sx={{ overflowY: "scroll" }}
        >
          <Box sx={{ maxWidth: "500px", margin: "auto", mb: 2 }}>
            <ReminderForm
              habitId={selectedHabitId}
              userId={userId}
              onClose={handleCloseReminder}
            />
          </Box>
        </Modal>

        <Modal
          open={openAllReminders}
          onClose={handleCloseAllReminders}
          sx={{ overflowY: "scroll" }}
        >
          <Box sx={{ maxWidth: "1000px", margin: "auto", mb: 2, mt: 4 }}>
            <AllReminders habitId={selectedHabitId} />
          </Box>
        </Modal>
      </Box>
      <Footer />
    </Box>
  );
};

export default AllHabits;
