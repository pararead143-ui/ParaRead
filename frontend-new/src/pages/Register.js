import React, { useState } from "react";
import axios from "../api/anxios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/Register.css";
import logo from "../assets/Logo.png";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState(false);

  // ✅ NEW: inline field errors
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // ✅ NEW: simple email checker (prevents native tooltip)
  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // ✅ NEW: validate all fields
  const validate = () => {
    const e = {};

    if (!username.trim()) e.username = "Username is required.";
    else if (username.trim().length < 3) e.username = "Username must be at least 3 characters.";

    if (!email.trim()) e.email = "Email is required.";
    else if (!isValidEmail(email.trim())) e.email = "Please enter a valid email address.";

    if (!password) e.password = "Password is required.";
    else if (password.length < 6) e.password = "Password must be at least 6 characters.";

    if (!confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (confirmPassword !== password) e.confirmPassword = "Passwords do not match.";

    setErrors(e);
    setFormError(Object.keys(e).length > 0);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setFormError(false);
    setErrors({});

    // ✅ NEW: custom validation first
    if (!validate()) return;

    try {
      await axios.post("auth/register/", { username, email, password });

      await Swal.fire({
        icon: "success",
        title: "Account Created",
        text: "Redirecting to login...",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/login");
    } catch (err) {
      console.error(err);

      let errorMessage = "Signup failed! Try again.";
      const newErrors = {};

      if (err.response?.data) {
        if (err.response.data.username) {
          errorMessage = `Username "${username}" is already taken!`;
          newErrors.username = errorMessage;
        } else if (err.response.data.email) {
          errorMessage = `Email "${email}" is already used!`;
          newErrors.email = errorMessage;
        } else if (err.response.data.password) {
          errorMessage = "Password issue: " + err.response.data.password.join(" ");
          newErrors.password = errorMessage;
        }
      }

      // ✅ show inline + form highlight too
      if (Object.keys(newErrors).length) {
        setErrors(newErrors);
        setFormError(true);
      }

      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text: errorMessage,
        confirmButtonColor: "#7b2cbf",
      });
    }
  };

  return (
    <div className="login-page">
      {/* LEFT HERO */}
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

      {/* RIGHT SIDE — SIGNUP FORM */}
      <form
        className={`login-card ${formError ? "form-error" : ""}`}
        onSubmit={handleSignup}
        noValidate
      >
        <h2 className="login-header">Create Your Account</h2>

        {/* Username */}
        <div className="form-field">
          <input
            className={`login-input ${errors.username ? "input-error" : ""}`}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errors.username && <div className="error-text">{errors.username}</div>}
        </div>

        {/* Email (type=text to avoid native browser tooltip) */}
        <div className="form-field">
          <input
            className={`login-input ${errors.email ? "input-error" : ""}`}
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            autoComplete="email"
          />
          {errors.email && <div className="error-text">{errors.email}</div>}
        </div>

        {/* Password */}
        <div className="form-field">
          <input
            className={`login-input ${errors.password ? "input-error" : ""}`}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          {errors.password && <div className="error-text">{errors.password}</div>}
        </div>

        {/* Confirm Password */}
        <div className="form-field">
          <input
            className={`login-input ${errors.confirmPassword ? "input-error" : ""}`}
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <div className="error-text">{errors.confirmPassword}</div>
          )}
        </div>

        <button className="login-btn" type="submit">
          Sign Up
        </button>

        <p className="login-links">
          Already have an account?{" "}
          <span className="signup-link" onClick={() => navigate("/login")}>
            Log in
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signup;
