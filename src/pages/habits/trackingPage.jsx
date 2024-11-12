import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Checkbox,
  Snackbar,
  Grid,
  MenuItem,
  Select,
} from "@mui/material";
import { getHabitById } from "../../services/habitService";
import {
  updateHabitEntries,
  getEntriesByHabit,
} from "../../services/habitEntriesService";
import dayjs from "dayjs";
import Header from "../header_footer/Header";
import Footer from "../header_footer/Footer";
import { FaTimes, FaCheck, FaTrophy } from "react-icons/fa";
import "../../styles/global.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// WeeklyCompletionChart component with updated week labels
const WeeklyCompletionChart = ({ weeklyData }) => (
  <Box
    sx={{
      width: "100%",
      height: "300px",
      backgroundColor: "#F3F6FB",
      borderRadius: "8px",
      padding: "1rem",
    }}
  >
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={weeklyData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} />
        <YAxis
          dataKey="day"
          type="category"
          tickFormatter={(day) => day.replace("Week", "W")} // Shorten to "W1", "W2", etc.
        />
        <Tooltip />
        <Bar
          dataKey="completion"
          fill="#3F51B5"
          barSize={20}
          radius={[0, 10, 10, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </Box>
);

const TrackingPage = ({ habitId }) => {
  const [habit, setHabit] = useState(null);
  const [monthEntries, setMonthEntries] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [longestStreak, setLongestStreak] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
  const [selectedMonthName, setSelectedMonthName] = useState(
    dayjs().format("MMMM")
  );
  const trophyColor =
    longestStreak >= 30
      ? "#FFD700"
      : longestStreak >= 7
      ? "#C0C0C0"
      : longestStreak >= 3
      ? "#CD7F32"
      : "grey";

  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const habitData = await getHabitById(habitId);
        setHabit(habitData);

        fetchMonthEntries(selectedMonth);
      } catch (error) {
        console.error("Error fetching tracking data:", error);
      }
    };

    fetchData();
  }, [habitId, selectedMonth]);

  const fetchMonthEntries = async (month) => {
    try {
      const entries = await getEntriesByHabit(habitId);
      const monthDays = getDaysOfMonth(month);

      const monthData = monthDays.map((day) => {
        const entry = entries.find((e) => e.date === day.date);
        return entry ? { ...day, completed: entry.completed } : day;
      });
      setMonthEntries(monthData);
      setLongestStreak(calculateLongestStreak(monthData));
    } catch (error) {
      console.error("Error fetching month entries:", error);
    }
  };

  const getDaysOfMonth = (month) => {
    const startOfMonth = dayjs(`2024-${month + 1}-01`);
    const daysInMonth = startOfMonth.daysInMonth();
    const firstDayOffset = startOfMonth.day();

    const daysArray = Array.from(
      { length: daysInMonth + firstDayOffset },
      (_, i) => {
        if (i < firstDayOffset) return { isEmpty: true };
        const date = startOfMonth
          .add(i - firstDayOffset, "day")
          .format("YYYY-MM-DD");
        const isFutureDate = dayjs(date).isAfter(dayjs(), "day");
        return { date, completed: false, isFutureDate, isEmpty: false };
      }
    );
    return daysArray;
  };

  const calculateWeeklyData = useMemo(() => {
    const weeks = Array(5)
      .fill(0)
      .map(() => ({ day: "", completion: 0 }));
    let currentWeek = 0;

    monthEntries.forEach((entry, index) => {
      const dayOfWeek = dayjs(entry.date).day();
      if (index > 0 && dayOfWeek === 0) currentWeek++;

      if (!entry.isEmpty && entry.completed) weeks[currentWeek].completion += 1;
      weeks[currentWeek].day = `Week ${currentWeek + 1}`;
    });

    return weeks.map((week) => ({
      ...week,
      completion: Math.min(week.completion, 7),
    }));
  }, [monthEntries]);

  useEffect(() => {
    setWeeklyData(calculateWeeklyData);
  }, [calculateWeeklyData]);

  const calculateLongestStreak = (entries) => {
    const completedEntries = entries.filter((entry) => entry.completed);
    if (completedEntries.length === 0) return 0;

    const sortedEntries = completedEntries.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    let longest = 0;
    let currentStreak = 1;

    for (let i = 1; i < sortedEntries.length; i++) {
      const prevDate = dayjs(sortedEntries[i - 1].date);
      const currentDate = dayjs(sortedEntries[i].date);

      if (currentDate.diff(prevDate, "day") === 1) {
        currentStreak++;
      } else {
        longest = Math.max(longest, currentStreak);
        currentStreak = 1;
      }
    }

    return Math.max(longest, currentStreak);
  };

  const handleCheckboxChange = async (date, completed) => {
    try {
      await updateHabitEntries(habitId, { date, completed });

      setMonthEntries((prevEntries) =>
        prevEntries.map((entry) =>
          entry.date === date ? { ...entry, completed } : entry
        )
      );

      const updatedEntries = await getEntriesByHabit(habitId);
      setLongestStreak(calculateLongestStreak(updatedEntries));

      setShowConfirmation(true);
    } catch (error) {
      console.error("Error saving tracking data:", error);
    }
  };

  const handleMonthChange = (event) => {
    const monthIndex = event.target.value;
    setSelectedMonth(monthIndex);
    setSelectedMonthName(dayjs().month(monthIndex).format("MMMM"));
  };

  const months = Array.from({ length: dayjs().month() + 1 }, (_, i) => ({
    value: i,
    label: dayjs().month(i).format("MMMM"),
  }));

  if (!habit) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Header />
      <Typography
        variant="h3"
        sx={{ mt: 8, textAlign: "center", fontWeight: 600 }}
      >
        Tracking for Habit - {habit.habitName}
      </Typography>
      <Container sx={{ mt: 8, mb: 12 }}>
        <Grid container spacing={4}>
          {/* Daily Tracker Section */}
          <Grid item xs={12} md={8}>
            <Paper
              sx={{ p: 4, backgroundColor: "#E3F2FD", borderRadius: "8px" }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#3F51B5", mb: 2 }}
                >
                  Daily Tracker - {selectedMonthName} 2024
                </Typography>
                <Select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  sx={{
                    minWidth: 120,
                    alignSelf: "flex-start",
                    height: "2rem",
                    border: "0.5px solid",
                    borderColor: "var(--color-primary)",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "var(--color-primary) !important",
                      },
                      "&:hover fieldset": {
                        borderColor: "var(--color-primary) !important",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--color-primary) !important",
                      },
                    },
                    "& .MuiSelect-icon": {
                      color: "var(--color-primary) !important",
                    },
                  }}
                >
                  {months.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              {/* Day Names Row */}
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, index) => (
                    <Grid
                      item
                      xs={1.71}
                      key={index}
                      sx={{ textAlign: "center" }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        {day}
                      </Typography>
                    </Grid>
                  )
                )}
              </Grid>

              {/* Calendar Days */}
              <Grid container spacing={1}>
                {monthEntries.map((entry, index) => (
                  <Grid item xs={1.71} key={index} sx={{ textAlign: "center" }}>
                    {!entry.isEmpty ? (
                      <>
                        {habit.habitType === "Bad" ? (
                          <Box
                            sx={{
                              display: "flex",
                              border: "1px solid",
                              borderRadius: "50%",
                              mx: 3,
                              py: 2.5,
                              justifyContent: "center",
                              alignItems: "center",
                              height: "24px",
                              color: entry.isFutureDate ? "grey.500" : "maroon",
                              cursor: entry.isFutureDate
                                ? "not-allowed"
                                : "pointer",
                            }}
                            onClick={() =>
                              !entry.isFutureDate &&
                              handleCheckboxChange(entry.date, !entry.completed)
                            }
                          >
                            {entry.completed ? (
                              <FaTimes size={16} />
                            ) : (
                              <Box sx={{ height: "24px", width: "24px" }} />
                            )}
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              border: "1px solid",
                              borderRadius: "50%",
                              mx: 2,
                              py: 1.7,
                              justifyContent: "center",
                              alignItems: "center",
                              height: "24px",
                              color: entry.isFutureDate ? "grey.500" : "green",
                              cursor: entry.isFutureDate
                                ? "not-allowed"
                                : "pointer",
                            }}
                            onClick={() =>
                              !entry.isFutureDate &&
                              handleCheckboxChange(entry.date, !entry.completed)
                            }
                          >
                            {entry.completed ? (
                              <FaCheck size={16} />
                            ) : (
                              <Box sx={{ height: "24px", width: "24px" }} />
                            )}
                          </Box>
                        )}
                        <Typography
                          variant="caption"
                          color={entry.isFutureDate ? "grey.500" : "black"}
                        >
                          {dayjs(entry.date).date()}
                        </Typography>
                      </>
                    ) : (
                      <Box sx={{ height: 40 }} />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Streak History and Weekly Completion Section */}
          <Grid item xs={12} md={4}>
            {/* Streak History */}
            {/* Streak History */}
            <Paper
              sx={{
                p: 4,
                backgroundColor: "#E3F2FD",
                borderRadius: "8px",
                mb: 4,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#3F51B5", mb: 2 }}
              >
                Streak History
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: "#FF8A65" }}
              >
                Longest Streak: {longestStreak} Days
              </Typography>

              <Box
                sx={{
                  fontSize: 40,
                  color: trophyColor, // Apply trophy color here
                  mt: 2,
                }}
              >
                <FaTrophy /> {/* Trophy icon with dynamic color */}
              </Box>
            </Paper>
            {/* Weekly Completion */}
            <Paper
              sx={{ p: 4, borderRadius: "8px", border: "2px solid #3F51B5" }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#3F51B5", mb: 2 }}
              >
                Weekly Completion
              </Typography>
              <WeeklyCompletionChart weeklyData={weeklyData} />
            </Paper>
          </Grid>
        </Grid>

        <Snackbar
          open={showConfirmation}
          autoHideDuration={3000}
          onClose={() => setShowConfirmation(false)}
          message="Habit tracking data saved"
        />
      </Container>
      <Footer />
    </Box>
  );
};

export default TrackingPage;
