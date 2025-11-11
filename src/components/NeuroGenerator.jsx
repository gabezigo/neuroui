import React, { useState, useEffect } from "react";

// import "./App.css";

// MODEL_ID = "gemini-2.5-flash";
const MODEL_ID = "gemini-2.5-flash";

function NeuroUIGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [componentData, setComponentData] = useState({
    name: "Untitled Component",
    html: "",
    css: "",
  });
  const [error, setError] = useState("");

  const YOUR_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const generateComponent = async () => {
    setLoading(true);
    setError("");

    if (!YOUR_API_KEY) {
      setLoading(false);
      setError("API key not found. Add VITE_GEMINI_API_KEY to your .env file.");
      return;
    }

    if (!prompt.trim()) {
      setLoading(false);
      setError("Please enter a component description first.");
      return;
    }

    try {
      const systemPrompt = `
You are an expert front-end developer specializing in modern CSS.

Reply ONLY with a single JSON object exactly following this schema:
{
  "componentName": "string",
  "componentHtml": "string",
  "cssCode": "string"
}

CRITICAL RULES:
- Return ONLY the JSON object with NO markdown fences, explanations, or backticks
- componentHtml MUST contain semantic HTML with class names
- cssCode MUST contain complete, modern CSS that fully styles the HTML
- Implement EVERY design detail requested: colors, shadows, borders, effects, animations, hover states, etc.
- Use modern CSS features: flexbox, grid, backdrop-filter, gradients, transforms, transitions, etc.
- NEVER return unstyled HTML or placeholder CSS
- Add hover states and transitions for interactive elements
- Use responsive units (%, rem, em) not fixed large px values
- Add overflow: auto to scrollable content sections
- Limit component height to max 600px or add overflow-y: auto
- Wrap root element in a container div with consistent padding
- For tables: wrap in a div with overflow-x: auto; max-width: 100%;
- Prefer layouts that wrap vertically over horizontal-only scrolling
- Add box-sizing: border-box; to root element
- Add subtle hover effects on interactive rows/items for better UX
- Components can use natural, full-width sizing
- Wrap root element with: padding: 2rem; box-sizing: border-box; width: 100%;
- Use natural grid layouts without forcing wrapping (e.g. grid-template-columns: repeat(6, 1fr) for 6 cards)
- Design components at professional desktop sizes
- For pricing cards or card grids: each card should be minimum 280px wide
- Use grid-template-columns: repeat(5, minmax(280px, 1fr)) for 5 cards
- Let the grid overflow naturally if cards don't fit, container will scroll

EXAMPLE - User: "red button with shadow and rounded corners"
{
  "componentName": "RedShadowButton",
  "componentHtml": "<button class='red-btn'>Click Me</button>",
  "cssCode": ".red-btn { background: #ef4444; color: white; padding: 12px 24px; border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); font-weight: 600; cursor: pointer; transition: all 0.3s; font-size: 16px; } .red-btn:hover { background: #dc2626; box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6); transform: translateY(-2px); }"
}

EXAMPLE - User: "glass card with blur background"
{
  "componentName": "GlassCard",
  "componentHtml": "<div class='glass-card'><h2 class='glass-title'>Title</h2><p class='glass-text'>Content goes here</p></div>",
  "cssCode": ".glass-card { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 16px; padding: 24px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); } .glass-title { margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #1f2937; } .glass-text { margin: 0; font-size: 16px; color: #4b5563; line-height: 1.6; }"
}

EXAMPLE - User: "purple gradient button with glow effect"
{
  "componentName": "GlowButton",
  "componentHtml": "<button class='glow-btn'>Glow Button</button>",
  "cssCode": ".glow-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border: none; border-radius: 8px; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.4s; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); } .glow-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6); }"
}

Now generate the component based on the user's request. Include ALL requested styling details in the cssCode.
`;

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\nUser request:\n${prompt}\n\nIMPORTANT: Return fully styled HTML and CSS.`,
              },
            ],
          },
        ],
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${YOUR_API_KEY}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        console.error("Gemini API Error:", errBody);
        throw new Error(
          `Gemini API error ${response.status}: ${
            errBody.error?.message || "Invalid request"
          }`
        );
      }

      const result = await response.json();
      const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!jsonText) throw new Error("Empty or malformed AI response.");

      const cleanText = jsonText
        .replace(/```json/i, "")
        .replace(/```/g, "")
        .trim();

      if (!cleanText.trim().startsWith("{") || !cleanText.includes("componentHtml")) {
        throw new Error("Gemini returned non-JSON text. Please re-generate.");
      }

      const parsed = JSON.parse(cleanText);

      setComponentData({
        name: parsed.componentName || "Generated Component",
        html: parsed.componentHtml || "<div>Error: No HTML generated.</div>",
        css: parsed.cssCode || "",
      });
    } catch (e) {
      console.error("Gemini API Error:", e);
      setError(`Failed to generate component: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

    // 🪄 Smooth reveal effect when component is generated
  useEffect(() => {
    const preview = document.querySelector(".preview-wrapper");
    const code = document.querySelector(".preview-code");
    const body = document.body;

    if (componentData?.html) {
      preview?.classList.add("active");
      code?.classList.add("active");

      body.classList.add("content-active");
    } else {
      preview?.classList.remove("active");
      code?.classList.remove("active");

      body.classList.remove("content-active");
    }
  }, [componentData]);


  return (
    <div className="app">
      <div className="app-header">
      <h1>NeuroUI</h1>
      <p className="header-sub">Describe your component — see it, copy it, export it.</p>

      <div className="prompt-form card">
        <PromptInputForm
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={generateComponent}
          loading={loading}
        />
      </div>
      </div>

      {error && <div className="preview-empty">{error}</div>}

      <div className="preview-wrapper card">
        <ComponentPreview
          componentName={componentData.name}
          componentHtml={componentData.html}
          cssCode={componentData.css}
        />
      </div>
    </div>
  );
}

function PromptInputForm({ prompt, setPrompt, onGenerate, loading }) {
  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., create a red background button with glass shadow and rounded borders"
        className="prompt-textarea"
        rows={4}
      />
      <div className="prompt-btn-wrap">
        <button
          onClick={onGenerate}
          disabled={loading}
          className={`prompt-btn ${loading ? "loading" : ""}`}
        >
          {loading ? "Generating..." : "Generate Component"}
        </button>
      </div>
    </div>
  );
}

function ComponentPreview({ componentName, componentHtml, cssCode }) {
  if (!componentHtml) return null;

return (
  <>
    <div className="preview-surface">
      <style>{cssCode}</style>
      <div dangerouslySetInnerHTML={{ __html: componentHtml }} />
    </div>

    <div className="preview-code">
      <div className="code-actions">
        {/* Copy both HTML + CSS (literal markup) - UNCHANGED */}
        <button
          className="action-btn"
          onClick={() => {
            const htmlMarkup =
              typeof componentHtml === "string"
                ? componentHtml
                : new XMLSerializer().serializeToString(componentHtml);

            const combined = `\n${htmlMarkup}\n\n/* CSS */\n${cssCode}`;
            navigator.clipboard.writeText(combined);
            alert("✅ Code copied to clipboard!");
          }}
        >
          Copy Code
        </button>

        {/* Export Files - MODIFIED to export raw source code as a single .txt file */}
        <button
          className="action-btn"
          onClick={() => {
            // 1. Get the literal HTML markup
            const htmlMarkup =
              typeof componentHtml === "string"
                ? componentHtml
                : new XMLSerializer().serializeToString(componentHtml);

            // 2. Combine HTML and CSS into a single source code string
            const combinedSourceCode = `\n${htmlMarkup}\n\n/* CSS */\n${cssCode}`;

            // 3. Export the combined source code as a .txt file (plain text)
            const textBlob = new Blob([combinedSourceCode], { type: "text/plain" });
            const textLink = document.createElement("a");
            textLink.href = URL.createObjectURL(textBlob);
            textLink.download = "source_code.txt"; // Downloads as a text file
            textLink.click();
            URL.revokeObjectURL(textLink.href);
          }}
        >
          Export Files
        </button>
      </div>

      <details>
        <summary>HTML Code</summary>
        <pre>
          <code>{componentHtml}</code>
        </pre>
      </details>

      <details>
        <summary>CSS Code</summary>
        <pre>
          <code>{cssCode}</code>
        </pre>
      </details>
    </div>
  </>
);





}

export default NeuroUIGenerator;