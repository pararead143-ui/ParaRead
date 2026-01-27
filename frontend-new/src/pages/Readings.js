// src/pages/ReadingMaterials.js
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import axios from "../api/anxios";
import { getEducationalInsightsAPI } from "../api/materialsApi";
import "../styles/Readings.css";

const ReadingMaterials = ({ darkMode, toggleDarkMode, setLoggedIn }) => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);

  // Fetch all materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get("/materials/");
        setMaterials(response.data);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  // Fetch insights for selected material
  useEffect(() => {
    if (!selectedMaterialId) return;
    const fetchInsights = async () => {
      try {
        const res = await getEducationalInsightsAPI(selectedMaterialId);
        setInsights(res.data);
      } catch (err) {
        console.error("Error fetching insights:", err);
        setInsights(null);
      }
    };
    fetchInsights();
  }, [selectedMaterialId]);

  const handleView = (id) => {
    setSelectedMaterialId(id);
    navigate(`/view-reading/${id}`);
  };

  // Open delete modal
  const handleDeleteModal = (material) => {
    setMaterialToDelete(material);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!materialToDelete) return;
    try {
      await axios.delete(`/materials/${materialToDelete.id}/`);
      setMaterials(materials.filter((m) => m.id !== materialToDelete.id));
      if (selectedMaterialId === materialToDelete.id) setInsights(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setShowDeleteModal(false);
      setMaterialToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMaterialToDelete(null);
  };

  // ✅ Generate a title if the material has none (IGNORE "Untitled")
  const getMaterialTitleBase = (material) => {
    const rawTitle = (material?.title ?? "").trim();

    const isBadTitle =
      !rawTitle ||
      rawTitle.toLowerCase() === "untitled" ||
      rawTitle.toLowerCase() === "no title" ||
      rawTitle.toLowerCase() === "n/a" ||
      rawTitle.toLowerCase() === "null";

    if (!isBadTitle) return rawTitle;

    const text = (material?.raw_text || "").trim();
    if (text) {
      return text.split(/\s+/).slice(0, 8).join(" ") + "...";
    }

    // fallback that's never "Untitled"
    return `Material ${material?.id ?? ""}`.trim();
  };

  // ✅ Build a list that:
  // 1) removes duplicates (same base title)
  // 2) ensures display titles are unique (adds (2), (3) if needed)
  const displayMaterials = useMemo(() => {
    const seenBase = new Set(); // remove exact duplicates by base title
    const usedDisplay = new Map(); // make display names unique
    const result = [];

    for (const m of materials) {
      const base = getMaterialTitleBase(m);

      // remove duplicates: if same base already displayed, skip
      if (seenBase.has(base.toLowerCase())) continue;
      seenBase.add(base.toLowerCase());

      // ensure unique display title (in case of collisions)
      const key = base.toLowerCase();
      const count = (usedDisplay.get(key) || 0) + 1;
      usedDisplay.set(key, count);

      const displayTitle = count === 1 ? base : `${base} (${count})`;
      result.push({ ...m, displayTitle });
    }

    return result;
  }, [materials]);

  return (
    <div className={`materials-container ${darkMode ? "dark" : ""}`}>
      <Sidebar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        setLoggedIn={setLoggedIn}
      />
      <div className="materials-content">
        <h1>READING MATERIALS</h1>

        {loading ? (
          <p>Loading materials...</p>
        ) : displayMaterials.length === 0 ? (
          <p>No materials uploaded.</p>
        ) : (
          displayMaterials.map((item) => (
            <div key={item.id} className="material-item">
              <h3>{item.displayTitle}</h3>

              <div className="action-buttons">
                <button onClick={() => handleView(item.id)}>View</button>
                <button onClick={() => handleDeleteModal(item)}>Delete</button>
              </div>
            </div>
          ))
        )}

        {/* Educational Insights */}
        {insights && (
          <div className="insights-section">
            <h3>Study Tips</h3>
            <p>{insights.study_tip}</p>

            {insights.paragraph_insights &&
              insights.paragraph_insights.length > 0 && (
                <>
                  <h3>Paragraph Insights</h3>
                  {insights.paragraph_insights.map((p) => (
                    <div key={p.paragraph_index} className="paragraph-insight">
                      <strong>Paragraph {p.paragraph_index}:</strong> {p.text}
                      <p>
                        <em>{p.note}</em>
                      </p>
                    </div>
                  ))}
                </>
              )}

            {insights.keyword_explanations &&
              insights.keyword_explanations.length > 0 && (
                <>
                  <h3>Keyword Explanations</h3>
                  {insights.keyword_explanations.map((k) => (
                    <div key={k.keyword} className="keyword-insight">
                      <strong>{k.keyword}:</strong> {k.explanation}
                    </div>
                  ))}
                </>
              )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete "
              {materialToDelete ? getMaterialTitleBase(materialToDelete) : ""}"?
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingMaterials;
