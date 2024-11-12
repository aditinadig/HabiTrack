// src/pages/dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Container, Box, Typography, Grid, Paper } from "@mui/material";
import { db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getCookie } from "../../services/authService"; // Import getCookie to get user_id from cookies
import Header from "../header_footer/Header";
import "../../styles/global.css"; // Import global styles

const Dashboard = () => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [daysWithoutBadHabit, setDaysWithoutBadHabit] = useState(0);
  const [totalHabits, setTotalHabits] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userId = getCookie("user_id"); // Get user ID from cookies
        if (!userId) return; // Ensure the user ID is available

        // Query habits for the logged-in user
        const habitsRef = collection(db, "Habits");
        const userHabitsQuery = query(habitsRef, where("user_id", "==", userId));
        const habitsSnapshot = await getDocs(userHabitsQuery);

        // Calculate total habits for the user
        setTotalHabits(habitsSnapshot.size);

        // You can also fetch habit entries if they are specific to each user
        const habitEntriesRef = collection(db, "HabitEntries");
        const entriesSnapshot = await getDocs(habitEntriesRef);

        let streak = 0;
        let daysWithoutBad = 0;
        let activities = [];

        entriesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.user_id === userId) { // Filter entries by user_id
            if (data.status === "Completed") streak += 1;
            if (data.habit_type === "Bad" && data.status === "Missed") daysWithoutBad += 1;
            activities.push({
              description: data.note || `Completed ${data.habit_name}`,
              date: data.date,
            });
          }
        });

        setCurrentStreak(streak);
        setDaysWithoutBadHabit(daysWithoutBad);
        setRecentActivities(activities.slice(0, 3)); // Show last 3 activities

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Box sx={{ backgroundColor: "var(--color-primary-background)", minHeight: "100vh" }}>
      <Header />
      <Container sx={{ mt: "var(--spacing-xl)" }}>
        <Grid container spacing={3} sx={{ textAlign: "center" }}>
          {/* Stat Cards */}
          <Grid item xs={4}>
            <Paper
              elevation={2}
              sx={{
                padding: "var(--spacing-lg)",
                backgroundColor: "var(--color-secondary-background)", 
                borderRadius: "var(--border-radius)",
              }}
            >
              <Typography variant="h6">Current Streaks</Typography>
              <Typography variant="h4" sx={{ color: "var(--color-secondary)" }}>
                {currentStreak} days
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              elevation={2}
              sx={{
                padding: "var(--spacing-lg)",
                backgroundColor: "var(--color-secondary-background)", 
                borderRadius: "var(--border-radius)",
              }}
            >
              <Typography variant="h6">Days without Bad Habit</Typography>
              <Typography variant="h4" sx={{ color: "var(--color-secondary)" }}>
                {daysWithoutBadHabit} days
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              elevation={2}
              sx={{
                padding: "var(--spacing-lg)",
                backgroundColor: "var(--color-secondary-background)", 
                borderRadius: "var(--border-radius)",
              }}
            >
              <Typography variant="h6">Total Habits</Typography>
              <Typography variant="h4" sx={{ color: "var(--color-secondary)" }}>
                {totalHabits}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Habit Progress */}
        <Box sx={{ mt: "var(--spacing-xl)" }}>
          <Typography variant="h5" gutterBottom>
            Habit Progress
          </Typography>
          <Paper
            elevation={1}
            sx={{
              display: "flex",
              justifyContent: "space-around",
              padding: "var(--spacing-md)",
              backgroundColor: "var(--color-secondary-background)", 
              borderRadius: "var(--border-radius)",
            }}
          >
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day, index) => (
                <Box key={index} sx={{ textAlign: "center" }}>
                  <Typography variant="body2" sx={{ color: "var(--color-text)" }}>
                    {day}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color:
                        day === "Thu" || day === "Sat"
                          ? "var(--color-secondary)"
                          : "var(--color-primary)",
                    }}
                  >
                    {day === "Thu" || day === "Sat" ? "❌" : "✔️"}
                  </Typography>
                </Box>
              )
            )}
          </Paper>
        </Box>

        {/* Recent Activity */}
        <Box sx={{ mt: "var(--spacing-xl)" }}>
          <Typography variant="h5" gutterBottom>
            Recent Activity
          </Typography>
          <Paper
            elevation={1}
            sx={{
              padding: "var(--spacing-md)",
              backgroundColor: "var(--color-secondary-background)", 
              borderRadius: "var(--border-radius)",
            }}
          >
            {recentActivities.length ? (
              recentActivities.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "var(--spacing-sm) 0",
                    borderBottom:
                      index !== recentActivities.length - 1
                        ? `1px solid var(--color-border)`
                        : "none",
                  }}
                >
                  <Typography variant="body1" sx={{ color: "var(--color-text)" }}>
                    {activity.description}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {activity.date}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                No recent activity
              </Typography>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;