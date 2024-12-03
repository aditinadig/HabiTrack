import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Button,
} from "@mui/material";
import { getHabitsByUser } from "../../services/habitService";
import { getEntriesByHabit } from "../../services/habitEntriesService";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear"; // Import the Week of Year plugin
dayjs.extend(weekOfYear); // Extend day.js with the plugin
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const milestones = [
  {
    name: "First Habit Added",
    description: "Congrats on your first habit!",
    check: (habits) => habits.length > 0,
  },
  {
    name: "10 Days Streak",
    description: "Achieved a 10-day streak!",
    check: (_, longestStreak) => longestStreak >= 10,
  },
  {
    name: "100 Days Completed",
    description: "Tracked 100 days in total!",
    check: (_, __, totalCompletedDays) => totalCompletedDays >= 100,
  },
];
import { FaCheckCircle, FaFire, FaChartLine, FaTrophy } from "react-icons/fa";

const HistoryAndAnalysis = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState([]);
  const [overallCompletionRate, setOverallCompletionRate] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [mostActiveHabit, setMostActiveHabit] = useState({});
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [streakData, setStreakData] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [inactiveHabits, setInactiveHabits] = useState([]);
  const [totalCompletedDays, setTotalCompletedDays] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const userId = getCookie("user_id");
      if (!userId) {
        console.error("User ID not found in cookies");
        return;
      }
      setUserId(userId);

      console.log("category dis", categoryDistribution);

      const inactive = habits.filter((h) => {
        const lastUpdated = dayjs(h.last_updated);
        return dayjs().diff(lastUpdated, "day") > 30; // Inactive for more than 30 days
      });
      setInactiveHabits(inactive);

      try {
        const habits = await getHabitsByUser(userId);
        setHabits(habits);

        const goodHabits = habits.filter((h) => h.habitType === "Good").length;
        const badHabits = habits.filter((h) => h.habitType === "Bad").length;

        setCategoryDistribution([
          { name: "Good Habits", value: goodHabits },
          { name: "Bad Habits", value: badHabits },
        ]);

        let totalDaysSinceCreation = 0; // Sum of all days since creation of habits
        let totalCompletedDays = 0; // Sum of all days marked as completed
        let maxStreak = 0;
        let activeHabit = { name: "None", totalCompletion: 0 };
        const monthly = {};
        const weekly = {};
        const streaks = [];

        for (const habit of habits) {
          const creationDate = dayjs(habit.created_at); // Use the creation date of the habit
          const today = dayjs(); // Current date
          const daysSinceCreation = today.diff(creationDate, "day") + 1; // Include current day

          const entries = await getEntriesByHabit(habit.id); // Fetch all entries for this habit
          const completedDays = entries.filter(
            (entry) => entry.completed
          ).length; // Count completed days

          // Add completed and total days to global totals
          totalDaysSinceCreation += daysSinceCreation;
          totalCompletedDays += completedDays;

          // Calculate longest streak
          const streak = calculateLongestStreak(entries);
          if (streak > maxStreak) {
            maxStreak = streak;
          }

          // Identify most active habit
          if (completedDays > activeHabit.totalCompletion) {
            activeHabit = {
              name: habit.habitName,
              totalCompletion: completedDays,
            };
          }

          // Prepare monthly data
          entries.forEach((entry) => {
            const month = dayjs(entry.date).format("MMMM YYYY");
            if (!monthly[month]) {
              monthly[month] = 0;
            }
            if (entry.completed) {
              monthly[month]++;
            }
          });

          // Prepare weekly data
          entries.forEach((entry) => {
            const week = dayjs(entry.date).week();
            if (!weekly[week]) {
              weekly[week] = 0;
            }
            if (entry.completed) {
              weekly[week]++;
            }
          });

          // Prepare streak data
          streaks.push({ name: habit.habitName, streak });
        }

        // Set computed analytics
        setOverallCompletionRate(
          totalDaysSinceCreation > 0
            ? ((totalCompletedDays / totalDaysSinceCreation) * 100).toFixed(2)
            : 0
        );
        setLongestStreak(maxStreak);
        setMostActiveHabit(activeHabit);
        setTotalCompletedDays(totalCompletedDays);
        // Format data for charts
        setMonthlyData(
          Object.entries(monthly).map(([month, count]) => ({
            name: month,
            completion: count,
          }))
        );
        setWeeklyData(
          Object.entries(weekly).map(([week, count]) => ({
            name: `Week ${week}`,
            completion: count,
          }))
        );
        setStreakData(streaks);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const calculateLongestStreak = (entries) => {
    const sortedEntries = entries
      .filter((entry) => entry.completed)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    let maxStreak = 0;
    let currentStreak = 0;

    for (let i = 0; i < sortedEntries.length; i++) {
      if (i > 0) {
        const prevDate = dayjs(sortedEntries[i - 1].date);
        const currDate = dayjs(sortedEntries[i].date);

        if (currDate.diff(prevDate, "day") === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
    }

    return Math.max(maxStreak, currentStreak);
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
        <Typography>Loading Analysis...</Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 2, mb: 8 }}>
      <Box sx={{ textAlign: "center" }}>
        <Button variant="link" href="/all-habits" sx={{ mt: 4 }}>
          Go Back to Habits
        </Button>
      </Box>
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Overview Summary */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: "var(--border-radius)",
              backgroundColor: "var(--color-secondary-background)",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 3,
                textAlign: "center",
                color: "var(--color-primary)",
              }}
            >
              Overview Summary
            </Typography>
            <Grid container spacing={4}>
              {/* Completion Rate Card */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "var(--spacing-md)",
                    backgroundColor: "#e3f2fd",
                    borderRadius: "var(--border-radius)",
                  }}
                >
                  <FaCheckCircle
                    size={40}
                    color={overallCompletionRate > 80 ? "#4caf50" : "#ff9800"}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}>
                    Completion Rate
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 1 }}>
                    {overallCompletionRate}%
                  </Typography>
                </Box>
              </Grid>

              {/* Longest Streak Card */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "var(--spacing-md)",
                    backgroundColor: "#ffecb3",
                    borderRadius: "var(--border-radius)",
                  }}
                >
                  <FaFire size={40} color="#ff5722" />
                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}>
                    Longest Streak
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 1 }}>
                    {longestStreak} days
                  </Typography>
                </Box>
              </Grid>

              {/* Most Active Habit Card */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "var(--spacing-md)",
                    backgroundColor: "#f3e5f5",
                    borderRadius: "var(--border-radius)",
                  }}
                >
                  <FaChartLine size={40} color="#9c27b0" />
                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}>
                    Most Active Habit
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 1 }}>
                    {mostActiveHabit.name}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={4} sx={{ mt: 4 }}>
        {/* Streak Tracker */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Streak Tracker
            </Typography>
            <ResponsiveContainer width="100%" minHeight={400}>
              <BarChart data={streakData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={({ x, y, payload }) => {
                    const words = payload.value.split(" ");
                    const lineHeight = 14; // Adjust line height as needed
                    return (
                      <g transform={`translate(${x - 10},${y})`}>
                        {words.map((word, index) => (
                          <text
                            key={index}
                            x={0}
                            y={
                              index * lineHeight -
                              (words.length - 1) * (lineHeight / 2)
                            }
                            textAnchor="end"
                            fontSize="12"
                          >
                            {word}
                          </text>
                        ))}
                      </g>
                    );
                  }}
                  tickMargin={5} // Space between axis and labels
                />
                <Tooltip />
                <Bar dataKey="streak" fill="#FFD700" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Habit Category Distribution */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Habit Category Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Monthly Performance */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Monthly Performance
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completion" fill="#3F51B5" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Weekly Trends */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Weekly Trends
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completion" fill="#FF8A65" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Habit Milestones */}
        {/* Habit Milestones */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Milestone Tracker
            </Typography>
            <Grid container spacing={2}>
              {milestones.map((milestone) => {
                const achieved = milestone.check(
                  habits,
                  longestStreak,
                  totalCompletedDays
                );

                return (
                  <Grid item xs={12} md={4} key={milestone.name}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        textAlign: "center",
                        backgroundColor: achieved ? "#E8F5E9" : "#FFEBEE",
                        borderRadius: "var(--border-radius)",
                        p: 3,
                      }}
                    >
                      <FaTrophy
                        size={40}
                        color={achieved ? "#FFD700" : "#BDBDBD"}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mt: 2,
                          color: achieved ? "#2E7D32" : "#9E9E9E",
                        }}
                      >
                        {milestone.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: achieved ? "text.secondary" : "#BDBDBD" }}
                      >
                        {milestone.description}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HistoryAndAnalysis;
