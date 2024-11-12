import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Snackbar,
  Button,
} from "@mui/material";
import {
  getHabitById,
  addHabit,
  updateHabit,
} from "../../services/habitService";
import Header from "../header_footer/Header";
import Footer from "../header_footer/Footer";
import "../../styles/global.css";

// Circle component
const Circle = ({ text, bgColor }) => (
  <Paper
    elevation={3}
    sx={{
      p: 4,
      borderRadius: "50%",
      width: "250px",
      height: "250px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: bgColor,
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      {text}
    </Typography>
  </Paper>
);

// HabitLoop component
const HabitLoop = ({ trigger, reaction, reward, habitType }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      mb: "var(--spacing-lg)",
    }}
  >
    <Box sx={{ textAlign: "center" }}>
      <Circle text={trigger} bgColor="#FFCC80" />
      <Typography variant="h6" sx={{ mt: 1 }}>Trigger</Typography>
    </Box>
    <Typography variant="h4" sx={{ mx: 2 }}>→</Typography>
    <Box sx={{ textAlign: "center", mr: 2 }}>
      <Circle
        text={reaction}
        bgColor={habitType === "Good" ? "#C5E1A5" : "#FFBEBA"}
      />
      <Typography variant="h6" sx={{ mt: 1 }}>Reaction</Typography>
    </Box>
    <Typography variant="h4" sx={{ mx: 2 }}>→</Typography>
    <Box sx={{ textAlign: "center" }}>
      <Circle text={reward} bgColor="#a390f9" />
      <Typography variant="h6" sx={{ mt: 1 }}>Reward</Typography>
    </Box>
  </Box>
);

// AlternativesList component
const AlternativesList = ({ alternatives, handleAlternativeClick }) => (
  <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 2 }}>
    {alternatives.length > 0 ? (
      alternatives.map((alternative, index) => (
        <Paper
          key={index}
          elevation={3}
          sx={{
            padding: "var(--spacing-sm)",
            backgroundColor: "#E3F2FD",
            borderRadius: "8px",
            minWidth: "150px",
            cursor: "pointer",
            "&:hover": { backgroundColor: "#BBDEFB" },
          }}
          onClick={() => handleAlternativeClick(alternative)}
        >
          <Typography variant="body2">{alternative}</Typography>
        </Paper>
      ))
    ) : (
      <Typography variant="body2" color="textSecondary">
        No alternatives available
      </Typography>
    )}
  </Box>
);

const SelectedAlternativesList = ({ selectedAlternatives }) => (
  <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 2 }}>
    {selectedAlternatives.length > 0 ? (
      selectedAlternatives.map((alternative, index) => (
        <Paper
          key={index}
          elevation={3}
          sx={{
            padding: "var(--spacing-sm)",
            backgroundColor: "#C8E6C9",
            borderRadius: "8px",
            minWidth: "150px",
          }}
        >
          <Typography variant="body2">{alternative}</Typography>
        </Paper>
      ))
    ) : (
      <Typography variant="body2" color="textSecondary">
        No selected alternatives
      </Typography>
    )}
  </Box>
);

const HabitVisualizer = () => {
  const [habit, setHabit] = useState(null);
  const [selectedAlternatives, setSelectedAlternatives] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
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
    const fetchHabit = async () => {
      if (!habitId) return;
      try {
        const habitData = await getHabitById(habitId);
        if (habitData) {
          setHabit(habitData);
        }
      } catch (error) {
        console.error("Error fetching habit:", error);
      }
    };
    fetchHabit();
  }, [habitId]);

  const handleAlternativeClick = (alternative) => {
    setSelectedAlternatives((prevSelected) => [...prevSelected, alternative]);
    setHabit((prevHabit) => ({
      ...prevHabit,
      alternatives: prevHabit.alternatives.filter((alt) => alt !== alternative),
    }));
  };

  const createSelectedHabits = async () => {
    if (!habit || selectedAlternatives.length === 0) return;

    try {
      const { alternatives, ...habitWithoutAlternatives } = habit;
      for (const [index, alternative] of selectedAlternatives.entries()) {
        const uniqueId = `alternative-${index + 1}-${habit.id}-${Date.now()}`;
        const newHabitData = {
          ...habitWithoutAlternatives,
          habitName: `Alternative for ${habit.habitName} (${index + 1})`,
          created_at: new Date().toISOString(),
          reaction: alternative,
          habitType: "Good",
          id: uniqueId,
        };
        await addHabit(newHabitData, uniqueId);
      }

      const updatedAlternatives = alternatives.filter(
        (alt) => !selectedAlternatives.includes(alt)
      );
      await updateHabit(habit.id, { alternatives: updatedAlternatives });
      setHabit((prevHabit) => ({ ...prevHabit, alternatives: updatedAlternatives }));

      setShowConfirmation(true);
      setSelectedAlternatives([]);
    } catch (error) {
      console.error("Error creating alternative habits:", error);
    }
  };

  if (!habit) return <Typography>Loading...</Typography>;

  const { trigger, reaction, reward, alternatives, habitType } = habit;

  return (
    <Box>
      <Header />
      <Container sx={{ textAlign: "center", mt: 12, minHeight: "25rem" }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 8 }}>
          Habit Visualizer
        </Typography>

        <HabitLoop
          trigger={trigger}
          reaction={reaction}
          reward={reward}
          habitType={habitType}
        />

        {habitType === "Bad" && (
          <>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 8, mb: 4 }}>
              Alternatives to Try
            </Typography>
            <AlternativesList
              alternatives={alternatives}
              handleAlternativeClick={handleAlternativeClick}
            />
          </>
        )}

        {selectedAlternatives.length > 0 && (
          <>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 8, mb: 4 }}>
              Selected Alternatives
            </Typography>
            <SelectedAlternativesList selectedAlternatives={selectedAlternatives} />
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 4 }}
              onClick={createSelectedHabits}
            >
              Create Habits
            </Button>
          </>
        )}

        <Snackbar
          open={showConfirmation}
          autoHideDuration={3000}
          onClose={() => setShowConfirmation(false)}
          message="New alternative habits created"
        />
      </Container>
      <Footer />
    </Box>
  );
};

export default HabitVisualizer;