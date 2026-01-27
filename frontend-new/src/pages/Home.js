// src/pages/Home.js
import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import {
  Folder,
  ChevronDown,
  FileText,
  RefreshCcw,
  Layers,
  Info,
  Copy,
  Download,
} from "lucide-react";
import "../styles/Home.css";
import { segmentTextAPI } from "../api/materialsApi";
import { useMaterial } from "../context/MaterialContext";

const Home = ({ darkMode, toggleDarkMode, setLoggedIn }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isTextFocused, setIsTextFocused] = useState(false);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const uploadAbortRef = useRef(null);

  const { currentMaterialId, setCurrentMaterialId } = useMaterial();

  // ✅ WORD LIMIT CONSTANT
  const MAX_WORDS = 1000;

  // ✅ FILE VALIDATION CONSTANTS
  const MAX_FILE_MB = 30;
  const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

  const ALLOWED_MIME_TYPES = new Set([
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ]);

  // ✅ HELPER: Truncate text to word limit
  const truncateToWordLimit = (text, maxWords) => {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ');
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const showFileError = (title, text) => {
    Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonColor: "#7b2cbf",
    });
  };

  const showEmptyInputAlert = () => {
    Swal.fire({
      icon: "warning",
      title: "Nothing to process",
      text: "Please paste some text or upload a file first.",
      confirmButtonColor: "#0b616e",
    });
  };

  useEffect(() => {
    return () => {
      if (uploadAbortRef.current) {
        uploadAbortRef.current.abort();
      }
    };
  }, []);

  // --------------------------
  // FILE UPLOAD WITH WORD LIMIT
  // --------------------------
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      showFileError(
        "File too large",
        `Please upload a file smaller than ${MAX_FILE_MB}MB.`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!file.type || !ALLOWED_MIME_TYPES.has(file.type)) {
      showFileError("Unsupported file", "Supported files: PDF, TXT, DOC, DOCX.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadedFile(file);
    setTextInput("");
    setTitleInput(file.name);
    setCurrentMaterialId(null);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("access");
      if (!token) {
        showToastMessage("You are not logged in!");
        return;
      }

      if (uploadAbortRef.current) {
        uploadAbortRef.current.abort();
      }
      uploadAbortRef.current = new AbortController();

      const res = await fetch("http://localhost:8000/api/materials/upload-file/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        signal: uploadAbortRef.current.signal,
      });

      const data = await res.json();
      console.log("UPLOAD RESPONSE:", data);

      if (res.ok) {
        const extractedText = data.cleaned_text || "";
        const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

        // ✅ CHECK WORD LIMIT
        if (wordCount > MAX_WORDS) {
          const truncated = truncateToWordLimit(extractedText, MAX_WORDS);

          Swal.fire({
            icon: "warning",
            title: "Word Limit Reached",
            html: `The extracted text contains <b>${wordCount.toLocaleString()} words</b>.<br>
                   Maximum allowed: <b>${MAX_WORDS.toLocaleString()} words</b>.<br><br>
                   Text has been automatically truncated.`,
            confirmButtonColor: "#0b616e",
          });

          setTextInput(truncated);
        } else {
          setTextInput(extractedText);
        }

        setCurrentMaterialId(null);
        showToastMessage("File uploaded and extracted successfully!");
      } else {
        showToastMessage(data.error || "Upload failed");
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error(err);
      showToastMessage("Network error while uploading");
    } finally {
      setIsProcessing(false);
    }
  };

  const openFilePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload({ target: { files: [file] } });
  };

  // --------------------------
  // SEGMENT
  // --------------------------
  const handleSegment = async () => {
    if (!textInput.trim() && !uploadedFile) {
      showEmptyInputAlert();
      return;
    }

    if (!textInput.trim()) {
      showEmptyInputAlert();
      return;
    }

    setIsProcessing(true);

    try {
      const res = await segmentTextAPI(textInput, titleInput);
      const segmentedData = res.data.segmented_data;

      const formatted = segmentedData
        .map(
          (seg, i) =>
            `Segment ${i + 1}:\n${seg.segment}\n\nExplanation: ${
              seg.explanation
            }\nKey Terms: ${seg.key_terms.join(", ")}\nExample: ${seg.example}`
        )
        .join("\n\n--------------------------------\n\n");

      setTextInput(formatted);
      setCurrentMaterialId(res.data.id);
      showToastMessage("Segmentation completed!");
    } catch (error) {
      console.error(error);
      showToastMessage("Segmentation failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --------------------------
  // SUMMARIZE
  // --------------------------
  const handleSummarize = () => {
    if (!textInput.trim() && !uploadedFile) {
      showEmptyInputAlert();
      return;
    }

    if (!textInput.trim()) {
      showEmptyInputAlert();
      return;
    }

    if (!currentMaterialId) {
      Swal.fire({
        icon: "info",
        title: "Not ready yet",
        text: "Please segment the text first before summarizing.",
        confirmButtonColor: "#0b616e",
      });
      return;
    }

    navigate(`/summary/${currentMaterialId}`);
  };

  // --------------------------
  // CLEAR
  // --------------------------
  const handleClear = () => {
    setTextInput("");
    setUploadedFile(null);
    setTitleInput("");
    setCurrentMaterialId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsTextFocused(false);
  };

  // --------------------------
  // COPY / DOWNLOAD
  // --------------------------
  const handleCopy = () => {
    if (!textInput.trim()) return;

    const payload = JSON.stringify({
      materialId: currentMaterialId || null,
      content: textInput,
    });

    navigator.clipboard.writeText(payload);
    showToastMessage("Copied!");
  };

  const handleDownload = () => {
    if (!textInput.trim()) return;

    const blob = new Blob([textInput], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "text.txt";
    link.click();
    showToastMessage("Download started!");
  };

  const wordCount = textInput.split(/\s+/).filter(Boolean).length;
  const charCount = textInput.length;

  return (
    <div
      className={`home-container ${darkMode ? "dark" : ""}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Sidebar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        setLoggedIn={setLoggedIn}
      />

      <div className={`home-content ${darkMode ? "dark" : ""}`}>
        <div className="floating-shape shape1"></div>
        <div className="floating-shape shape2"></div>
        <div className="floating-shape shape3"></div>

        <h1 className={`home-title ${darkMode ? "dark" : ""}`}>
          READ SMARTER <br />
          UNDERSTAND BETTER
        </h1>

        <p className={`home-subtitle ${darkMode ? "dark" : ""}`}>
          Paste your text, upload a file, or try our tools below.
          <span
            className="tooltip-icon-inline"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Info size={16} />
          </span>
        </p>

        {showTooltip && (
          <div className={`tooltip ${darkMode ? "dark" : ""}`}>
            Tip: Segment splits sentences. Summarize redirects to summary page.
          </div>
        )}

        <div className="upload-section">
          <div className="upload-group">
            <label
              className={`upload-main ${darkMode ? "dark" : ""}`}
              onClick={openFilePicker}
            >
              <span className="upload-icon">
                <Folder size={16} />
              </span>
              <span className="upload-text">Upload</span>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </label>

            <button
              type="button"
              className={`upload-dropdown ${darkMode ? "dark" : ""}`}
              onClick={openFilePicker}
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div
          className={`work-box ${textInput.trim() ? "has-actions" : ""} ${
            darkMode ? "dark" : ""
          }`}
        >
          {!textInput.trim() && !isProcessing && !isTextFocused && (
            <div className={`empty-overlay ${darkMode ? "dark" : ""}`}>
              <div className="empty-overlay-inner">
                <div className="empty-title">📄 Paste text or drop a file here</div>
                <div className="empty-sub">
                  Try lecture notes, articles, PDFs, or long readings — then click{" "}
                  <b>Summarize</b> or <b>Segment</b>.
                </div>

                <div className="empty-chips">
                  <span className="chip">Lecture notes</span>
                  <span className="chip">Articles</span>
                  <span className="chip">Research</span>
                  <span className="chip">PDF text</span>
                </div>
              </div>
            </div>
          )}

          {textInput.trim() && (
            <div className="preview-actions">
              <button className="preview-btn" onClick={handleCopy} aria-label="Copy">
                <Copy size={16} />
                <span className="btn-text">Copy</span>
              </button>

              <button
                className="preview-btn"
                onClick={handleDownload}
                aria-label="Download"
              >
                <Download size={16} />
                <span className="btn-text">Download</span>
              </button>
            </div>
          )}

          <textarea
            className={`text-input ${darkMode ? "dark" : ""}`}
            placeholder="Paste here or drag a file..."
            value={textInput}
            onChange={(e) => {
              const newText = e.target.value;
              const newWordCount = newText.split(/\s+/).filter(Boolean).length;

              // ✅ CHECK WORD LIMIT ON PASTE/TYPE
              if (newWordCount > MAX_WORDS) {
                const truncated = truncateToWordLimit(newText, MAX_WORDS);

                Swal.fire({
                  icon: "warning",
                  title: "Word Limit Reached",
                  text: `Maximum ${MAX_WORDS.toLocaleString()} words allowed.`,
                  confirmButtonColor: "#0b616e",
                  timer: 2000,
                  timerProgressBar: true,
                });

                setTextInput(truncated);
              } else {
                setTextInput(newText);
              }
            }}
            onFocus={() => setIsTextFocused(true)}
            onBlur={() => setIsTextFocused(false)}
          />

          {/* ✅ UPDATED COUNTER WITH WORD LIMIT */}
          <div
            className={`text-counter ${
              wordCount > MAX_WORDS * 0.9 ? "near-limit" : ""
            } ${darkMode ? "dark" : ""}`}
          >
            {wordCount}/{MAX_WORDS.toLocaleString()} words | {charCount} characters
          </div>

          {isProcessing && <div className="processing">Processing...</div>}
        </div>

        <div className="action-buttons-right">
          <button onClick={handleSummarize}>
            <FileText size={18} /> Summarize
          </button>
          <button onClick={handleSegment}>
            <Layers size={18} /> Segment
          </button>
          <button onClick={handleClear}>
            <RefreshCcw size={18} /> Clear
          </button>
        </div>

        <div className={`info-box ${darkMode ? "dark" : ""}`}>
          {uploadedFile ? (
            <p>Recent Upload: {uploadedFile.name}</p>
          ) : (
            <p>Upload a file to get started.</p>
          )}
        </div>
      </div>

      {showToast && (
        <div className={`toast ${darkMode ? "dark" : ""}`}>{toastMessage}</div>
      )}
    </div>
  );
};

export default Home;