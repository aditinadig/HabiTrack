// src/components/HabitForm.jsx
import React from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";

const HabitForm = ({
  title,
  habitData,
  handleChange,
  handleSubmit,
  buttonText,
}) => {
  return (
    <Container
      maxWidth="sm"
      sx={{ textAlign: "center"}}
    >
      <Typography
        variant="h4"
        sx={{
          color: "var(--color-primary)",
          mb: "var(--spacing-md)",
          mt: "var(--spacing-md)",
          fontWeight: 700,
        }}
      >
        {title}
      </Typography>
      <Paper
        elevation={3}
        sx={{
          p: "var(--spacing-lg)",
          backgroundColor: "var(--color-secondary-background)",
          borderRadius: "var(--border-radius)",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Typography
            variant="body1"
            sx={{
              textAlign: "left",
              fontWeight: 600,
              mb: "var(--spacing-xs)",
              mt: "var(--spacing-lg)",
            }}
          >
            Habit Name
          </Typography>
          <TextField
            label="Habit Name"
            name="habitName"
            fullWidth
            required
            variant="outlined"
            sx={{
              mb: "var(--spacing-md)",
              backgroundColor: "var(--color-primary-background)",
            }}
            value={habitData.habitName}
            onChange={handleChange}
          />

          <Box>
            <Typography
              variant="body1"
              sx={{
                textAlign: "left",
                fontWeight: 600,
                mb: "var(--spacing-xs)",
                mt: "var(--spacing-sm)",
              }}
            >
              Habit Type
            </Typography>
            <RadioGroup
              row
              name="habitType"
              value={habitData.habitType}
              onChange={handleChange}
            >
              <FormControlLabel
                value="Good"
                control={<Radio />}
                label="Good Habit"
              />
              <FormControlLabel
                value="Bad"
                control={<Radio />}
                label="Bad Habit"
              />
            </RadioGroup>
          </Box>

          <Typography
            variant="body1"
            sx={{
              textAlign: "left",
              fontWeight: 600,
              mb: "var(--spacing-xs)",
              mt: "var(--spacing-sm)",
            }}
          >
            Trigger
          </Typography>
          <TextField
            label="Trigger"
            name="trigger"
            fullWidth
            required
            variant="outlined"
            sx={{
              mb: "var(--spacing-md)",
              backgroundColor: "var(--color-primary-background)",
            }}
            value={habitData.trigger}
            onChange={handleChange}
          />

          <Typography
            variant="body1"
            sx={{
              textAlign: "left",
              fontWeight: 600,
              mb: "var(--spacing-xs)",
              mt: "var(--spacing-sm)",
            }}
          >
            Reaction
          </Typography>
          <TextField
            label="Reaction"
            name="reaction"
            fullWidth
            required
            variant="outlined"
            sx={{
              mb: "var(--spacing-md)",
              backgroundColor: "var(--color-primary-background)",
            }}
            value={habitData.reaction}
            onChange={handleChange}
          />

          <FormControl fullWidth sx={{ mb: "var(--spacing-md)" }}>
            <Typography
              variant="body1"
              sx={{
                textAlign: "left",
                fontWeight: 600,
                mb: "var(--spacing-xs)",
                mt: "var(--spacing-sm)",
              }}
            >
              {" "}
              Reward Type{" "}
            </Typography>

            <Select
              name="rewardType"
              value={habitData.rewardType}
              onChange={handleChange}
              sx={{
                backgroundColor: "var(--color-primary-background)",
                ".MuiSelect-select": {
                  display: "flex",
                  justifyContent: "left",
                },
                ".MuiMenuItem-root": {
                  textAlign: "left",
                },
              }}
              required
            >
              <MenuItem
                value="Physical"
                sx={{ display: "flex", justifyContent: "left" }}
              >
                Physical
              </MenuItem>
              <MenuItem
                value="Mental"
                sx={{ display: "flex", justifyContent: "left" }}
              >
                Mental
              </MenuItem>
              <MenuItem
                value="Relaxation"
                sx={{ display: "flex", justifyContent: "left" }}
              >
                Relaxation
              </MenuItem>
              <MenuItem
                value="Social"
                sx={{ display: "flex", justifyContent: "left" }}
              >
                Social
              </MenuItem>
            </Select>
          </FormControl>

          {habitData.rewardType ? <>
            <Typography
            variant="body1"
            sx={{
              textAlign: "left",
              fontWeight: 600,
              mb: "var(--spacing-xs)",
              mt: "var(--spacing-sm)",
            }}
          >
            Reward
          </Typography>
          <TextField
            label="Reward"
            name="reward"
            fullWidth
            required
            variant="outlined"
            sx={{
              mb: "var(--spacing-md)",
              backgroundColor: "var(--color-primary-background)",
            }}
            value={habitData.reward}
            onChange={handleChange}
          />
          </> : null}
          

          <FormControl fullWidth sx={{ mb: "var(--spacing-md)" }}>
            <Typography
              variant="body1"
              sx={{
                textAlign: "left",
                fontWeight: 600,
                mb: "var(--spacing-xs)",
                mt: "var(--spacing-sm)",
              }}
            >
              Frequency
            </Typography>
            <Select
              name="frequency"
              value={habitData.frequency}
              onChange={handleChange}
              sx={{
                backgroundColor: "var(--color-primary-background)",
                ".MuiSelect-select": {
                  display: "flex",
                  justifyContent: "left",
                },
                ".MuiMenuItem-root": {
                  textAlign: "left",
                },
              }}
              required
            >
              <MenuItem
                value="Daily"
                sx={{ display: "flex", justifyContent: "left" }}
              >
                Daily
              </MenuItem>
              <MenuItem
                value="Weekly"
                sx={{ display: "flex", justifyContent: "left" }}
              >
                Weekly
              </MenuItem>
              <MenuItem
                value="Monthly"
                sx={{ display: "flex", justifyContent: "left" }}
              >
                Monthly
              </MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "var(--color-button-bg)",
              "&:hover": {
                backgroundColor: "var(--color-button-hover-bg)",
              },
              color: "#fff",
              mt: "var(--spacing-md)",
              fontWeight: 600,
              fontSize: "var(--font-size-base)",
            }}
          >
            {buttonText}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default HabitForm;
