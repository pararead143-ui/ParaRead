import React from "react";
import Sidebar from "./Sidebar";
import "../styles/About.css";

const About = ({ darkMode, toggleDarkMode, setLoggedIn }) => {
  return (
    <div className={`about-container ${darkMode ? "dark" : ""}`}>
      <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} setLoggedIn={setLoggedIn} />

      <div className="about-content">
        <div className="about-section">
          <h1 className="about-title">About <span className="highlight">ParaRead</span></h1>

          <p className="about-description">
            <strong>ParaRead</strong> is an interactive reading comprehension platform
            designed for Senior High School students. Our goal is to help students read smarter,
            understand better, and retain knowledge more effectively.
          </p>

          <h3 className="section-heading">Key Features</h3>
          <ul className="features-list">
            <li>Step-by-step reading segmentation for easier comprehension.</li>
            <li>Automated summary generation to help students review key points.</li>
            <li>Interactive quizzes to test understanding and retention.</li>
            <li>History tracking to monitor progress and improvement.</li>
            <li>Dark mode support for comfortable reading at night.</li>
          </ul>

          <h3 className="section-heading">Our Mission</h3>
          <p className="about-description">
            We aim to enhance students reading experience and academic performance
            through innovative technology, making learning both effective and enjoyable.
          </p>

        
        </div>*/
      </div>
    </div>
  );
};

export default About;
