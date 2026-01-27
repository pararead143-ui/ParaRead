import React, { useState, useEffect } from "react";
import QuizResults from "./QuizResults";
import "../styles/Quiz.css";

const QuizModal = ({ darkMode, questions = [], onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Reset state when questions change
  useEffect(() => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
  }, [questions]);

  if (!questions || questions.length === 0) {
    return (
      <div className={`quiz-modal ${darkMode ? "dark" : ""}`}>
        <div className="quiz-overlay" onClick={onClose}></div>
        <div className="quiz-container">
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  // Store user's selected answer as letter ("A", "B", etc.)
  const handleAnswerChange = (e) => {
    const id = currentQuestion.id;
    const letter = e.target.value.toUpperCase();
    setAnswers({ ...answers, [id]: letter });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <QuizResults
        darkMode={darkMode}
        questions={questions}
        answers={answers}
        onClose={onClose}
        onRetake={handleRetake}
      />
    );
  }

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const currentId = currentQuestion.id;
  const hasAnswered = answers[currentId] !== undefined;

  return (
    <div className={`quiz-modal ${darkMode ? "dark" : ""}`}>
      <div className="quiz-overlay" onClick={onClose}></div>

      <div className="quiz-container">
        {/* Header */}
        <div className="quiz-header">
          <h2>Quiz</h2>
          <button
            className="close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            ×
          </button>
        </div>

        {/* Progress */}
        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Question */}
        <div className="quiz-body">
          <p className="question-text">{currentQuestion.question}</p>

          <div className="options">
            {currentQuestion.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i); // "A", "B", "C", "D"
              return (
                <label key={i} className="option">
                  <input
                    type="radio"
                    name={`question-${currentId}`}
                    value={letter}
                    checked={answers[currentId] === letter}
                    onChange={handleAnswerChange}
                  />
                  <span className="custom-radio">{opt}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="quiz-footer">
          <button onClick={handlePrev} disabled={currentIndex === 0}>
            Previous
          </button>
          {currentIndex === questions.length - 1 ? (
            <button onClick={handleSubmit} disabled={!hasAnswered}>
              Submit
            </button>
          ) : (
            <button onClick={handleNext} disabled={!hasAnswered}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
