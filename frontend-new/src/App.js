import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Register";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Summary from "./pages/Summary";
import Readings from "./pages/Readings";
import ViewReading from "./pages/ViewReading";
import Vocabulary from "./pages/Vocabulary";
import Settings from "./pages/Settings";
import Quiz from "./pages/Quiz";
import About from "./pages/About";
import { refreshTokenIfExpired } from "./util/token";
import { jwtDecode } from "jwt-decode"; // ✅ Named import

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });  
  const toggleDarkMode = () => {
  setDarkMode(prev => {
    localStorage.setItem("darkMode", !prev); // Save to localStorage
    return !prev;
  });
};

  const checkLogin = () => {
    const token = localStorage.getItem("access");
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      const now = Date.now().valueOf() / 1000;
      return decoded.exp && decoded.exp > now;
    } catch {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return false;
    }
  };

function SummaryWrapper(props) {
  const { id } = useParams();
  return <Summary {...props} materialId={id} />;
}

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshTokenIfExpired(); // wait for token refresh
      } catch (err) {
        console.log("Token refresh failed:", err);
      } finally {
        setLoggedIn(checkLogin());
        setAuthChecked(true);
      }
    };

    initAuth();

    const handleStorageChange = () => setLoggedIn(checkLogin());
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (!authChecked) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />

        <Route
          path="/login"
          element={loggedIn ? <Navigate to="/home" replace /> : <Login setLoggedIn={setLoggedIn} />}
        />
        <Route
          path="/signup"
          element={loggedIn ? <Navigate to="/home" replace /> : <Signup setLoggedIn={setLoggedIn} />}
        />

        {/* Protected Pages */}
        <Route
          path="/home"
          element={loggedIn ? <Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} setLoggedIn={setLoggedIn} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/summary"
          element={loggedIn ? <Summary darkMode={darkMode} toggleDarkMode={toggleDarkMode} setLoggedIn={setLoggedIn} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/quiz"
          element={loggedIn ? <Quiz darkMode={darkMode} toggleDarkMode={toggleDarkMode} setLoggedIn={setLoggedIn} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/readings"
          element={loggedIn ? <Readings darkMode={darkMode} toggleDarkMode={toggleDarkMode} setLoggedIn={setLoggedIn} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/view-reading/:id"
          element={loggedIn ? <ViewReading darkMode={darkMode} toggleDarkMode={toggleDarkMode} setLoggedIn={setLoggedIn} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/settings"
          element={loggedIn ? <Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} setLoggedIn={setLoggedIn} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/about"
          element={loggedIn ? <About darkMode={darkMode} toggleDarkMode={toggleDarkMode} setLoggedIn={setLoggedIn} /> : <Navigate to="/login" replace />}
        />
        <Route
        path="/summary/:id"
        element={loggedIn ? <SummaryWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode} setLoggedIn={setLoggedIn} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/vocabulary"
          element={loggedIn ? <Vocabulary darkMode={darkMode} toggleDarkMode={toggleDarkMode} setLoggedIn={setLoggedIn} /> : <Navigate to="/login" replace />}
        />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
