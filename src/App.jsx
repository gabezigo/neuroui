import React from "react";
import NeuroUIGenerator from "./components/NeuroGenerator";
import "./App.css"; // ✅ New clean global stylesheet

function App() {
  return (
    <div className="app">
      <NeuroUIGenerator />
    </div>
  );
}

export default App;
