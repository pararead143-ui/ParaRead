import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Landing.css";
import logo from "../assets/Logo.png";

const Landing = () => {
  const navigate = useNavigate();

  const handleJoinNow = () => {
    console.log("[Landing] Join Now clicked.");
    navigate("/login");
  };

  return (
    <>
      {/* MAIN FLEX CONTENT */}
      <div className="landing-container">

        {/* LEFT SIDE */}
        <div className="content-left">
          <h1 className="landing-title">PARAREAD</h1>

          <p className="landing-subtitle">
            Read smarter,<br />
            understand better
          </p>

          <button
            className="join-button"
            type="button"
            onClick={handleJoinNow}
          >
            JOIN NOW
          </button>
        </div>

        {/* LOGO + GLOW */}
        <div className="logo-container">
          <div className="glow-circle"></div>
          <img src={logo} alt="ParaRead Logo" className="logo-image" />
        </div>
      </div>

      {/* BOTTOM TAGLINE (OUTSIDE FLEX LAYOUT) */}
      <p className="bottom-text">
        A web-based learning tool to boost student understanding
      </p>

      {/* FLOATING PARTICLES (OUTSIDE MAIN CONTAINER) */}
      <div className="floating-particles">
        {[...Array(15)].map((_, i) => (
          <span key={i} className="particle"></span>
        ))}
      </div>
    </>
  );
};

export default Landing;
