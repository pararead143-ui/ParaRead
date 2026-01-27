// src/pages/ViewReading.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import axios from "../api/anxios";
import Swal from "sweetalert2";
import "../styles/ViewReading.css";

const ViewReading = ({ darkMode, toggleDarkMode, setLoggedIn }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Title editing state (NO "Untitled" injected — keep consistent with ReadingMaterials)
  const [titleDraft, setTitleDraft] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);

  // vocab map: { "term": {meaning, example, id, word} }
  const [vocabMap, setVocabMap] = useState({});
  const [vocabLoading, setVocabLoading] = useState(true);

  const [selectedTerm, setSelectedTerm] = useState(null);
  const [termLoading, setTermLoading] = useState(false);

  // manual meaning input (shows when missing)
  const [manualMeaning, setManualMeaning] = useState("");
  const [savingMeaning, setSavingMeaning] = useState(false);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const res = await axios.get(`/materials/${id}/`);
        setMaterial(res.data);

        // ✅ IMPORTANT: do NOT default to "Untitled" here
        // Keep it exactly as saved in DB (empty string if missing)
        setTitleDraft(res.data?.title ?? "");
      } catch (err) {
        console.error("Error fetching material:", err);
        setMaterial(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [id]);

  // ✅ Save title to backend (store REAL title so ReadingMaterials will show same)
  const saveTitle = async () => {
    if (!material) return;

    const cleaned = (titleDraft ?? "").trim(); // ✅ allow empty if you want (or enforce below)

    // OPTIONAL: enforce required title (recommended so it won't stay blank)
    if (!cleaned) {
      Swal.fire({
        icon: "warning",
        title: "Title required",
        text: "Please type a title before saving.",
        confirmButtonColor: "#0b616e",
      });
      return;
    }

    // no change? do nothing
    if ((material.title ?? "").trim() === cleaned) {
      setTitleDraft(cleaned);
      return;
    }

    setSavingTitle(true);
    try {
      const token = localStorage.getItem("access");
      const res = await axios.patch(
        `/materials/${material.id}/`,
        { title: cleaned },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMaterial((prev) => ({ ...prev, title: res.data.title }));
      setTitleDraft(res.data.title ?? cleaned);

      Swal.fire({
        icon: "success",
        title: "Title updated",
        text: "Your reading title was saved.",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error saving title:", err);
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: "Could not save title. Make sure your backend supports PATCH /materials/<id>/.",
        confirmButtonColor: "#0b616e",
      });

      // reset draft back to original saved title
      setTitleDraft(material.title ?? "");
    } finally {
      setSavingTitle(false);
    }
  };

  // ✅ Load vocabulary from backend (UNDER /api/materials/vocab/)
  useEffect(() => {
    const fetchVocab = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await axios.get(`/materials/vocab/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const map = {};
        for (const v of res.data || []) {
          if (!v.word) continue;
          map[v.word.toLowerCase()] = v;
        }
        setVocabMap(map);
      } catch (err) {
        console.error("Error fetching vocabulary:", err);
        setVocabMap({});
      } finally {
        setVocabLoading(false);
      }
    };
    fetchVocab();
  }, []);

  if (loading) return <p>Loading material...</p>;
  if (!material) return <p>Material not found.</p>;

  const getSummaryText = (summaryData) => {
    if (!summaryData) return "No summary available.";
    if (typeof summaryData === "string") return summaryData;
    if (summaryData.summary) return summaryData.summary;
    return JSON.stringify(summaryData);
  };

  const getMeaningObj = (term) => {
    if (!term) return null;
    return vocabMap[term.toLowerCase()] || null;
  };

  // ✅ Lookup endpoint: /materials/vocabulary/lookup/
  const ensureMeaning = async (term) => {
    try {
      const token = localStorage.getItem("access");
      const res = await axios.get(
        `/materials/vocabulary/lookup/?word=${encodeURIComponent(term)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVocabMap((prev) => ({
        ...prev,
        [res.data.word.toLowerCase()]: res.data,
      }));

      return res.data;
    } catch {
      return null;
    }
  };

  const openTerm = async (term) => {
    setSelectedTerm(term);
    setManualMeaning("");
    setSavingMeaning(false);

    if (vocabMap[term.toLowerCase()]) return;

    setTermLoading(true);
    await ensureMeaning(term);
    setTermLoading(false);
  };

  const closeTerm = () => {
    setSelectedTerm(null);
    setTermLoading(false);
    setManualMeaning("");
    setSavingMeaning(false);
  };

  const saveToVocabWithMeaning = async (term, meaning) => {
    const cleaned = (meaning || "").trim();
    if (!cleaned) {
      Swal.fire({
        icon: "warning",
        title: "Meaning required",
        text: "Please type a meaning before saving.",
        confirmButtonColor: "#0b616e",
      });
      return;
    }

    setSavingMeaning(true);
    try {
      const token = localStorage.getItem("access");
      const res = await axios.post(
        `/materials/vocab/`,
        { word: term, meaning: cleaned },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVocabMap((prev) => ({
        ...prev,
        [res.data.word.toLowerCase()]: res.data,
      }));

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: `"${term}" was added with meaning.`,
        timer: 1400,
        showConfirmButton: false,
      });

      setManualMeaning("");
    } catch (err) {
      console.error("Error saving vocab:", err);
      Swal.fire({
        icon: "error",
        title: "Could not save",
        text: "This term could not be added. It may already exist, or the server is unavailable.",
        confirmButtonColor: "#0b616e",
      });
    } finally {
      setSavingMeaning(false);
    }
  };

  const updateMeaning = async (term) => {
    const meaningObj = getMeaningObj(term);
    if (!meaningObj?.id) return;

    const cleaned = manualMeaning.trim();
    if (!cleaned) {
      Swal.fire({
        icon: "warning",
        title: "Meaning required",
        text: "Please type a meaning before saving.",
        confirmButtonColor: "#0b616e",
      });
      return;
    }

    setSavingMeaning(true);
    try {
      const token = localStorage.getItem("access");
      const res = await axios.patch(
        `/materials/vocab/${meaningObj.id}/`,
        { meaning: cleaned },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVocabMap((prev) => ({
        ...prev,
        [res.data.word.toLowerCase()]: res.data,
      }));

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `Meaning saved for "${res.data.word}".`,
        timer: 1400,
        showConfirmButton: false,
      });

      setManualMeaning("");
    } catch (err) {
      console.error("Error updating meaning:", err);
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: "Could not save meaning. Make sure PATCH /materials/vocab/<id>/ exists in your backend.",
        confirmButtonColor: "#0b616e",
      });
    } finally {
      setSavingMeaning(false);
    }
  };

  const KeyTerms = ({ terms }) => {
    if (!terms || terms.length === 0) return <span>None</span>;
    return (
      <span className="keyterm-wrap">
        {terms.map((t, idx) => (
          <button
            key={`${t}-${idx}`}
            type="button"
            className="keyterm-chip"
            onClick={() => openTerm(t)}
            title="Click to see meaning"
          >
            {t}
          </button>
        ))}
      </span>
    );
  };

  const renderSegments = () => {
    const data = material.segmented_data;
    if (!data) return <p>No segmented text available.</p>;

    if (Array.isArray(data)) {
      return data.map((seg, i) => (
        <div key={i} className="segment-box">
          <h4>Segment {i + 1}</h4>
          <p>
            <strong>Text:</strong> {seg.segment}
          </p>
          <p>
            <strong>Explanation:</strong> {seg.explanation}
          </p>
          <p>
            <strong>Key Terms:</strong> <KeyTerms terms={seg.key_terms || []} />
          </p>
          <p>
            <strong>Example:</strong> {seg.example}
          </p>
        </div>
      ));
    }

    if (data.sentences) return data.sentences.map((s, i) => <p key={i}>{s}</p>);
    return <p>No segmented text available.</p>;
  };

  const meaningObj = selectedTerm ? getMeaningObj(selectedTerm) : null;

  const hasMeaning =
    !!meaningObj?.meaning &&
    typeof meaningObj.meaning === "string" &&
    meaningObj.meaning.trim().length > 0;

  const existsButNoMeaning =
    !!meaningObj && (!meaningObj.meaning || meaningObj.meaning.trim().length === 0);

  return (
    <div className={`view-container ${darkMode ? "dark" : ""}`}>
      <Sidebar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        setLoggedIn={setLoggedIn}
      />

      <div className="view-content">
        <div className="view-header">
          <button className="back-btn" onClick={() => navigate("/readings")}>
            ← Back
          </button>
          <h1 className="view-title">VIEW READING MATERIAL</h1>
        </div>

        <p className="uploaded-date">
          Uploaded on:{" "}
          <span>{new Date(material.created_at).toLocaleDateString()}</span>
        </p>

        <div className="pdf-viewer">
          <div className="page-section">
            <h2 className="section-title">Title</h2>

            <div className="page-box">
              <input
                className="title-input"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={saveTitle}
                placeholder="Type a title..."
                disabled={savingTitle}
              />

              <button
                type="button"
                className="title-save-btn"
                onClick={saveTitle}
                disabled={savingTitle}
              >
                {savingTitle ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          <div className="page-section">
            <h2 className="section-title">Original Text</h2>
            <div className="page-box long-text">
              {material.raw_text?.split("\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div className="page-section">
            <h2 className="section-title">Segmented Text</h2>
            <div className="page-box long-text">{renderSegments()}</div>
          </div>

          <div className="page-section">
            <h2 className="section-title">Summary</h2>
            <div className="page-box long-text">
              <p>{getSummaryText(material.summary_data)}</p>
            </div>
          </div>
        </div>
      </div>

      {selectedTerm && (
        <div className="term-modal-overlay" onClick={closeTerm}>
          <div className="term-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="term-title">{selectedTerm}</h3>

            {vocabLoading || termLoading ? (
              <p>Loading meaning...</p>
            ) : hasMeaning ? (
              <p>
                <strong>Meaning:</strong> {meaningObj.meaning}
              </p>
            ) : (
              <>
                <p style={{ marginBottom: 8 }}>
                  <strong>Meaning:</strong>{" "}
                  {existsButNoMeaning ? "(not saved yet)" : "(not found)"}
                </p>

                <textarea
                  className="term-meaning-input"
                  placeholder="Type the meaning here..."
                  value={manualMeaning}
                  onChange={(e) => setManualMeaning(e.target.value)}
                  rows={3}
                />

                {existsButNoMeaning ? (
                  <button
                    className="term-save-btn"
                    onClick={() => updateMeaning(selectedTerm)}
                    disabled={savingMeaning}
                  >
                    {savingMeaning ? "Saving..." : "Save Meaning"}
                  </button>
                ) : (
                  <button
                    className="term-save-btn"
                    onClick={() => saveToVocabWithMeaning(selectedTerm, manualMeaning)}
                    disabled={savingMeaning}
                  >
                    {savingMeaning ? "Saving..." : "Save to Vocabulary"}
                  </button>
                )}
              </>
            )}

            <button className="term-close-btn" onClick={closeTerm}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewReading;
