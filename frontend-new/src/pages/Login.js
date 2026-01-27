// src/pages/Login.js
import React, { useState, useEffect } from "react";
import axios from "../api/anxios";
import { useNavigate } from "react-router-dom";
import { refreshTokenIfExpired } from "../util/token";
import Swal from "sweetalert2";
import "../styles/Login.css";
import logo from "../assets/Logo.png";

const Login = ({ setLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // AUTO LOGIN IF TOKEN VALID
  useEffect(() => {
    const checkToken = async () => {
      const access = localStorage.getItem("access");
      if (!access) return;

      try {
        await refreshTokenIfExpired();
        const updatedAccess = localStorage.getItem("access");

        if (updatedAccess) {
          setLoggedIn?.(true);
          navigate("/home", { replace: true });
        }
      } catch (err) {
        console.log("[Login] Token check failed:", err);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        Swal.fire({
          icon: "warning",
          title: "Session Expired",
          text: "Please log in again.",
          confirmButtonColor: "#7b2cbf",
        });
      }
    };

    checkToken();
  }, [navigate, setLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();

    // ✅ Custom validation (no browser popups)
    if (!username.trim() || !password.trim()) {
      Swal.fire({
        icon: "error",
        title: "Missing fields",
        text: "Please enter your username/email and password.",
        confirmButtonColor: "#7b2cbf",
      });
      return;
    }

    try {
      const res = await axios.post("auth/login/", { username, password });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      await Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
        timer: 1500,
        showConfirmButton: false,
      });

      setLoggedIn?.(true);
      navigate("/home", { replace: true });
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid credentials. Please try again.",
        confirmButtonColor: "#7b2cbf",
      });
    }
  };

  return (
    <div className="login-page">
      {/* LEFT SIDE HERO */}
      <div className="left-side">
        <h1 className="app-title">PARAREAD</h1>
        <h2 className="app-tagline">
          READ SMARTER,<br />UNDERSTAND BETTER
        </h2>
        <div className="logo-wrapper">
          <img className="login-logo" src={logo} alt="ParaRead Logo" />
        </div>
        <p className="app-slogan">
          A WEB-BASED LEARNING TOOL TO BOOST STUDENT UNDERSTANDING
        </p>
      </div>

      {/* ✅ RIGHT SIDE — LOGIN FORM */}
      <form className="login-card" onSubmit={handleLogin} noValidate>
        <h2 className="login-header">Log In</h2>

        <input
          className="login-input"
          type="text"
          placeholder="Email or Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button className="login-btn" type="submit">
          Login
        </button>

        <p className="login-links">
          Don’t have an account?{" "}
          <span className="signup-link" onClick={() => navigate("/signup")}>
            Sign up
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
