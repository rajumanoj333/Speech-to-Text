import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");           // Final + interim combined display
  const [finalText, setFinalText] = useState(""); // Only confirmed text
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript + " ";
        else interim += transcript;
      }

      // Save only final transcripts separately (avoids duplicates)
      setFinalText(final);
      // Display both in UI
      setText(final + interim);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleStart = () => {
    setText("");
    setFinalText("");
    startListening();
  };

  const saveTextToFile = () => {
    const textToSave = finalText.trim() || text.trim();
    if (!textToSave) {
      alert("No text to save!");
      return;
    }
    const blob = new Blob([textToSave], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Voice_as_text.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const clearText = () => {
    setText("");
    setFinalText("");
  };

  return (
    <div className="container">
      <header className="App-header">
        <h1>🎙️ React Speech to Text</h1>
      </header>

      <main>
        <textarea
          className="text-area"
          value={text}
          readOnly
          placeholder="Speak something... it will appear here."
        />

        <div className="buttons">
          {!isListening ? (
            <button onClick={handleStart} className="button start">
              🎤 Start Listening
            </button>
          ) : (
            <button onClick={stopListening} className="button stop">
              🛑 Stop Listening
            </button>
          )}
          <button
            onClick={saveTextToFile}
            className="button save"
            disabled={!text.trim()}
          >
            💾 Save as Text
          </button>
          <button
            onClick={clearText}
            className="button clear"
            disabled={!text.trim()}
          >
            🗑️ Clear
          </button>
        </div>

        <div className="info">
          <p>
            Browser:{" "}
            {navigator.userAgent.includes("Chrome")
              ? "Chrome (Recommended)"
              : "Other (Support may vary)"}
          </p>
          <p>Tip: Speak clearly into your microphone.</p>
        </div>
      </main>
    </div>
  );
}

export default App;
