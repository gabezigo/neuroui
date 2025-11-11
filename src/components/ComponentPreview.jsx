import React, { useEffect, useMemo } from "react";

// --- FIX: Mock DOMPurify to prevent import error ---
// In production, run: npm install dompurify
const DOMPurify = {
  sanitize: (html) => {
    if (!html) return "";
    return html
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
      .replace(/javascript:/gi, "");
  },
};

const ComponentPreview = ({ componentName, componentHtml, cssCode }) => {
  const safeHtml = useMemo(() => {
    return DOMPurify.sanitize(componentHtml);
  }, [componentHtml]);

  useEffect(() => {
    if (!cssCode) return;

    let styleTag = document.getElementById("custom-component-style");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "custom-component-style";
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = cssCode;

    return () => {
      if (styleTag) {
        styleTag.textContent = "";
      }
    };
  }, [cssCode]);

  if (!componentHtml || componentHtml.trim() === "") {
    return (
      <div className="preview-empty">
        Generate a component above to see the live preview here.
      </div>
    );
  }

  return (
    <div className="preview-wrapper card">

      <div className="preview-surface">
        <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
      </div>
    </div>
  );
};

export default ComponentPreview;