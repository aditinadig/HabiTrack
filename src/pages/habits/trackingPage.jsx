import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
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
          tickFormatter={(day) => day.replace("Week", "W")}
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

const TrackingPage = () => {
  const [habit, setHabit] = useState(null);
  const [monthEntries, setMonthEntries] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [longestStreak, setLongestStreak] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
  const [selectedMonthName, setSelectedMonthName] = useState(
    dayjs().format("MMMM")
  );
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("allTime");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
  const [filteredEntries, setFilteredEntries] = useState([]);
  const trophyColor =
    longestStreak >= 30
      ? "#FFD700"
      : longestStreak >= 7
      ? "#C0C0C0"
      : longestStreak >= 3
      ? "#CD7F32"
      : "grey";

  const [weeklyData, setWeeklyData] = useState([]);
  const [habitId, setHabitId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("habitId");
    if (id) {
      setHabitId(id);
    } else {
      console.error("Habit ID not found");
    }
    return () => {
      localStorage.removeItem("habitId");
    };
  }, []);

  useEffect(() => {
    if (!habitId) return;

    const fetchHabitData = async () => {
      try {
        const habitData = await getHabitById(habitId);
        setHabit(habitData);
      } catch (error) {
        console.error("Error fetching habit:", error);
      }
    };

    fetchHabitData();
  }, [habitId]);

  useEffect(() => {
    if (!habitId) return;

    const fetchMonthEntries = async () => {
      try {
        const entries = await getEntriesByHabit(habitId);
        const monthDays = getDaysOfMonth(selectedMonth, habit?.created_at);
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

    fetchMonthEntries();
  }, [habitId, selectedMonth, habit]);

  const getDaysOfMonth = (month, createdDate) => {
    const startOfMonth = dayjs(`2024-${month + 1}-01`);
    const creationDate = dayjs(createdDate);
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
        const isBeforeCreationDate = dayjs(date).isBefore(creationDate, "day");
        return {
          date,
          completed: false,
          isFutureDate,
          isBeforeCreationDate,
          isEmpty: false,
        };
      }
    );
    return daysArray;
  };

  const calculateWeeklyData = useMemo(() => {
    if (!monthEntries.length) return [];

    const startOfMonth = dayjs(`2024-${selectedMonth + 1}-01`);
    const endOfMonth = startOfMonth.endOf("month");
    const totalWeeks = Math.ceil((endOfMonth.date() + startOfMonth.day()) / 7);

    const weeks = Array.from({ length: totalWeeks }, (_, i) => ({
      day: `Week ${i + 1}`,
      completion: 0,
    }));

    monthEntries.forEach((entry) => {
      const weekIndex = Math.floor(
        (dayjs(entry.date).date() + startOfMonth.day() - 1) / 7
      );

      if (
        weekIndex < weeks.length &&
        !entry.isEmpty &&
        entry.completed &&
        !entry.isBeforeCreationDate
      ) {
        weeks[weekIndex].completion += 1;
      }
    });

    return weeks.map((week) => ({
      ...week,
      completion: Math.min(week.completion, 7),
    }));
  }, [monthEntries, selectedMonth]);

  useEffect(() => {
    setWeeklyData(calculateWeeklyData);
  }, [calculateWeeklyData]);

  const calculateLongestStreak = (entries) => {
    const completedEntries = entries.filter(
      (entry) => entry.completed && !entry.isBeforeCreationDate
    );
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
    disabled: habit
      ? dayjs(`2024-${i + 1}-01`).isBefore(dayjs(habit.created_at), "month")
      : false,
  }));

  if (!habit) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Header />
      <Box sx={{ textAlign: "center" }}>
        <Button variant="link" href="/all-habits" sx={{ mt: 4 }}>
          Go Back
        </Button>
      </Box>
      <Typography
        variant="h3"
        sx={{ mt: 4, textAlign: "center", fontWeight: 600 }}
      >
        Tracking for Habit - {habit.habitName}
      </Typography>
      <Container sx={{ mt: 8, mb: 12 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 4,
                background: "linear-gradient(135deg, #E3F2FD, #FFF)",
                borderRadius: "12px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#3F51B5",
                  }}
                >
                  Daily Tracker - {selectedMonthName} 2024
                </Typography>
                <Select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  sx={{
                    minWidth: 140,
                    height: "2.5rem",
                    border: "0.5px solid",
                    borderColor: "var(--color-primary)",
                    borderRadius: "8px",
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
                    <MenuItem
                      key={month.value}
                      value={month.value}
                      disabled={month.disabled}
                    >
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, index) => (
                    <Grid
                      item
                      xs={1.71}
                      key={index}
                      sx={{ textAlign: "center", color: "#757575" }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          fontSize: "0.9rem",
                        }}
                      >
                        {day}
                      </Typography>
                    </Grid>
                  )
                )}
              </Grid>

              <Grid container spacing={2}>
                {monthEntries.map((entry, index) => (
                  <Grid item xs={1.71} key={index} sx={{ textAlign: "center" }}>
                    {!entry.isEmpty ? (
                      <>
                        {entry.isFutureDate || entry.isBeforeCreationDate ? (
                          <Box
                            sx={{
                              width: "36px",
                              height: "36px",
                              lineHeight: "36px",
                              borderRadius: "50%",
                              background:
                                "repeating-linear-gradient(45deg, #F5F5F5, #F5F5F5 1px, #E0E0E0 1px, #E0E0E0 2px)",
                              color: "#BDBDBD",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              mx: "auto",
                              cursor: "not-allowed",
                              border: "1px solid #E0E0E0",
                            }}
                          />
                        ) : entry.completed ? (
                          <Box
                            sx={{
                              width: "36px",
                              height: "36px",
                              lineHeight: "36px",
                              borderRadius: "50%",
                              backgroundColor: "#4CAF50",
                              color: "white",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              mx: "auto",
                              cursor: "pointer",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                backgroundColor: "#388E3C",
                              },
                            }}
                            onClick={() =>
                              handleCheckboxChange(entry.date, !entry.completed)
                            }
                          >
                            <FaCheck size={16} />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: "36px",
                              height: "36px",
                              lineHeight: "36px",
                              borderRadius: "50%",
                              backgroundColor: "#FFFFFF",
                              color: "#757575",
                              border: "1px solid #BDBDBD",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              mx: "auto",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                borderColor: "#757575",
                                backgroundColor: "#F5F5F5",
                              },
                            }}
                            onClick={() =>
                              handleCheckboxChange(entry.date, !entry.completed)
                            }
                          />
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 1,
                            color:
                              entry.isFutureDate || entry.isBeforeCreationDate
                                ? "grey.500"
                                : "#000",
                            fontWeight: "bold",
                          }}
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

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 4,
                background: "linear-gradient(135deg, #E3F2FD, #FFFFFF)",
                borderRadius: "12px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                mb: 4,
              }}
            >
              <Box
                sx={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#3F51B5",
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
                    mb: 2,
                  }}
                >
                  Streak History
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: "#FF7043",
                    fontSize: "1.2rem",
                    backgroundColor: "rgba(255, 112, 67, 0.1)",
                    px: 2,
                    py: 0.5,
                    borderRadius: "6px",
                    display: "inline-block",
                  }}
                >
                  Longest Streak: {longestStreak} Days
                </Typography>

                <Box
                  sx={{
                    fontSize: 50,
                    color: trophyColor,
                    mt: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "70px",
                    height: "70px",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "50%",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                    textAlign: "center",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <FaTrophy />
                </Box>
              </Box>
            </Paper>

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
