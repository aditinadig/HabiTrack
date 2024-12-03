import React, { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NotificationHandler = () => {
  useEffect(() => {
    // Read notifications from localStorage
    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];

    // Display each notification
    notifications.forEach((notification) => {
      toast(notification.message, { type: notification.type });
    });

    // Clear notifications from localStorage
    localStorage.removeItem("notifications");
  }, []);

  return <ToastContainer position="top-right" autoClose={5000} />;
};

export default NotificationHandler;