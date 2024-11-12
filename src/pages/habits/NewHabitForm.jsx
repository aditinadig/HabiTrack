// src/pages/habits/newHabitForm.jsx
import React, { useState, useEffect } from "react";
import { Box, Modal, Button } from "@mui/material";
import { addHabit } from "../../services/habitService";
import { getCookie } from "../../services/authService"; // Import getCookie to retrieve user info
import Header from "../header_footer/Header";
import Footer from "../header_footer/Footer";
import HabitForm from "../habits/HabitForm";
import ReminderForm from "../reminders/SetReminderForm";
import "../../styles/global.css";
import { BAD_HABIT_ALTERNATIVES } from "../../services/habitData"; // Import suggestions and alternatives

const NewHabitForm = () => {
  const [habitData, setHabitData] = useState({
    habitName: "",
    habitType: "Good",
    trigger: "",
    reaction: "",
    reward: "",
    rewardType: "",
    frequency: "Daily",
  });

  const [userId, setUserId] = useState("");
  const [openReminderModal, setOpenReminderModal] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState(null);

  useEffect(() => {
    // Retrieve user ID and email from cookies
    setUserId(getCookie("user_id"));
  }, []);

  const handleOpenReminder = (habitId) => {
    setSelectedHabitId(habitId);
    setOpenReminderModal(true);
  };

  const handleCloseReminder = () => {
    setOpenReminderModal(false);
    setSelectedHabitId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setHabitData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Function to select 10 random alternatives
      const getAlternatives = () => {
        return BAD_HABIT_ALTERNATIVES[habitData.rewardType.toLowerCase()];
      };

      // Determine suggestions or alternatives based on habit type
      const additionalData =
        habitData.habitType === "Bad"
          ? { alternatives: getAlternatives() }
          : null;

      // Add habit data with user ID and additional suggestions/alternatives
      const habitRef = await addHabit({
        ...habitData,
        ...additionalData,
        user_id: userId,
        created_at: new Date().toISOString(), // Add timestamp for habit creation
      });

      // Retrieve the ID of the newly created habit
      const newHabitId = habitRef.id;
      console.log("New Habit ID:", newHabitId);

      // Open the reminder modal with the new habit ID
      handleOpenReminder(newHabitId);
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  };

  return (
    <Box>
      <Header />
      <Box sx={{ textAlign: "center" }}>
        <Button variant="link" href="/all-habits" sx={{ mt: 4 }}>
          Go Back
        </Button>
        <HabitForm
          title="Create a New Habit"
          habitData={habitData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          buttonText="Add"
        />
        <Modal open={openReminderModal} onClose={handleCloseReminder}>
          <Box sx={{ maxWidth: "500px", margin: "auto", mt: 4, p: 2 }}>
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

export default NewHabitForm;
