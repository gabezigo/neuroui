import React from "react";

const PromptInputForm = ({ prompt, setPrompt, onGenerate, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim() && !loading) {
      onGenerate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="prompt-form card">
      <textarea
        rows="4"
        placeholder="Describe your component idea... (e.g., 'A sleek pricing card with gradient borders and hover glow')"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="prompt-textarea"
        disabled={loading}
      />

      <div className="prompt-btn-wrap">
        <button
          type="submit"
          className={`prompt-btn ${loading ? "loading" : ""}`}
          disabled={loading}
        >
          {loading ? (
            <span className="loading-spinner">
              <svg
                className="spinner"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="spinner-track"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="spinner-head"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Generating...
            </span>
          ) : (
            "Generate Component"
          )}
        </button>
      </div>
    </form>
  );
};

export default PromptInputForm;