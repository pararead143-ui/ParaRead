import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "../styles/Settings.css";

const Settings = ({ darkMode, toggleDarkMode, setLoggedIn }) => {
  const [notifications, setNotifications] = useState(true);

  // Fetch user notification preference from backend
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setNotifications(data.notifications ?? true);
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, []);

  // Update notifications in backend
  const updateNotifications = async () => {
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications }),
      });
      if (!res.ok) throw new Error("Failed to update notifications");
      console.log("Notifications updated");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`settings-container ${darkMode ? "dark" : ""}`}>
      <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} setLoggedIn={setLoggedIn} />

      <div className="settings-content">
        <h1 className="settings-title">SETTINGS</h1>

        {/* Notifications */}
        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="settings-item toggle-row">
            <label>Enable Notifications:</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
                onBlur={updateNotifications} // save on blur
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
