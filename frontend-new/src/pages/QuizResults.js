import React from "react";
import "../styles/Quiz.css";

const QuizResults = ({ darkMode, questions = [], answers = {}, onClose, onRetake }) => {
  if (!questions || questions.length === 0) return null;

  // Use backend-provided correctAnswer letter
  const quizWithCorrect = questions.map((q, index) => ({
    id: q.id ?? index,
    question: q.question ?? "",
    options: q.options ?? [],
    correctAnswer: (q.correctAnswer || "").toUpperCase()
  }));

  // Calculate score
  const calculateScore = () => {
    let score = 0;
    quizWithCorrect.forEach((q) => {
      const userAnswer = (answers[q.id] || "").toUpperCase();
      if (userAnswer === q.correctAnswer) score++;
    });
    return score;
  };

  const score = calculateScore();
  const percentage = Math.round((score / quizWithCorrect.length) * 100);

  return (
    <div className={`quiz-modal ${darkMode ? "dark" : ""}`}>
      <div className="quiz-overlay" onClick={onClose}></div>

      <div className="quiz-container">
        {/* Header */}
        <div className="quiz-header">
          <h2>Quiz Results</h2>
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

        {/* Score */}
        <div className="quiz-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
          <h3>
            Your Score: {score} / {quizWithCorrect.length} ({percentage}%)
          </h3>
          {percentage >= 70 ? (
            <p style={{ color: "green" }}>Great job! 🎉</p>
          ) : (
            <p style={{ color: "red" }}>Keep practicing! 💡</p>
          )}

          {/* Questions */}
          {quizWithCorrect.map((q, idx) => {
            const userAnswer = (answers[q.id] || "").toUpperCase();

            return (
              <div key={idx} className="results-question">
                <p className="question-text">{q.question}</p>

                <ul>
                  {q.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i); // "A", "B", "C", "D"
                    const isCorrect = letter === q.correctAnswer;
                    const isSelected = letter === userAnswer;

                    let style = {};
                    if (isCorrect) style = { color: "green", fontWeight: "bold" };
                    else if (isSelected && !isCorrect)
                      style = { color: "red", textDecoration: "line-through" };

                    return (
                      <li key={i} style={style}>
                        {opt} {isCorrect ? "✅" : isSelected && !isCorrect ? "❌" : ""}
                      </li>
                    );
                  })}
                </ul>

                <hr />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="quiz-footer">
          <button onClick={onRetake}>Retake Quiz</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
