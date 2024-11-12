// src/pages/habits/newHabitForm.jsx
import React, { useState, useEffect } from "react";
import {
  Box, Modal
} from "@mui/material";
import { addHabit } from "../../services/habitService";
import { getCookie } from "../../services/authService"; // Import getCookie to retrieve user info
import Header from "../header_footer/Header";
import Footer from "../header_footer/Footer";
import HabitForm from "../habits/HabitForm";
import ReminderForm from "../reminders/SetReminderForm";
import "../../styles/global.css";

const NewHabitForm = () => {
  const [habitData, setHabitData] = useState({
    habitName: "",
    habitType: "Good",
    trigger: "",
    reaction: "",
    reward: "",
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
      // Add habit data with user ID
      const habitRef = await addHabit({
        ...habitData,
        user_id: userId,
      });
  
      // Retrieve the ID of the newly created habit
      const newHabitId = habitRef.id;
      console.log("New Habit ID:", newHabitId);
  
      // Pass the new habit ID to handleOpenReminder or perform other actions
      handleOpenReminder(newHabitId);
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  };

  return (
    <Box>
      <Header />
      <HabitForm
        title="Create a New Habit"
        habitData={habitData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        buttonText="Add"
      />
      <Modal open={openReminderModal} onClose={handleCloseReminder}>
        <Box sx={{ maxWidth: "500px", margin: "auto", mt: 4, p: 2 }}>
          <ReminderForm habitId={selectedHabitId} userId={userId} onClose={handleCloseReminder} />
        </Box>
      </Modal>
      <Footer />
    </Box>
  );
};

export default NewHabitForm;
