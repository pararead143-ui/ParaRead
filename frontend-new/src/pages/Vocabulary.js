import React, { useEffect, useState } from "react";
import axios from "../api/anxios";
import "../styles/Vocabulary.css";
import Sidebar from "./Sidebar";

const Vocabulary = ({ darkMode, toggleDarkMode, setLoggedIn }) => {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState(""); // <-- must match backend
  const [vocabList, setVocabList] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  // Load all saved words
  const loadVocab = async () => {
    try {
      const res = await axios.get("materials/vocab/");
      setVocabList(res.data);
    } catch (err) {
      console.error("Failed to load vocabulary:", err);
    }
  };

  // Add new word
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) return;

    try {
      // ✅ Send 'meaning', not 'definition'
      await axios.post("materials/vocab/", { word, meaning });
      setWord("");
      setMeaning("");
      loadVocab();
    } catch (err) {
      console.error("Failed to add word:", err);
    }
  };

  // Delete word
  const handleDelete = async (id) => {
    try {
      await axios.delete(`materials/vocab/${id}/`);
      loadVocab();
    } catch (err) {
      console.error("Failed to delete word:", err);
    }
  };

  // Toggle card expand
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    loadVocab();
  }, []);

  return (
    <div className={`page-container ${darkMode ? "dark" : ""}`}>
      <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} setLoggedIn={setLoggedIn} />

      <div className="content">
        <h1>Your Vocabulary</h1>

        {/* Add word form */}
        <form onSubmit={handleAdd} className="vocab-form">
          <input
            type="text"
            placeholder="Word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            required
          />
          <textarea
            placeholder="Meaning"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            required
          />
          <button type="submit">Add Word</button>
        </form>

        {/* Word list */}
        <div className="vocab-list">
          {vocabList.map((item) => (
            <div
              key={item.id}
              className={`vocab-item ${expandedId === item.id ? "expanded" : ""}`}
            >
              <div className="vocab-header" onClick={() => toggleExpand(item.id)}>
                <h3>{item.word}</h3>
                <span>{expandedId === item.id ? "▲" : "▼"}</span>
              </div>
              {expandedId === item.id && (
                <div className="vocab-meaning">
                  <p>{item.meaning}</p>
                  <button onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Vocabulary;
