import React, { useState } from "react";

const Chat: React.FC = () => {
  const [file, setFile] = useState<File | null>(null); // State to store the uploaded file
  const [result, setResult] = useState<string | null>(null); // State to store the server response
  const [isLoading, setIsLoading] = useState<boolean>(false); // State to manage loading status

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true); // Set loading to true
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file.");
      }

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2)); // Store the server response as JSON
    } catch (error) {
      console.error("Error uploading file:", error);
      setResult("Error uploading file. Please try again.");
    } finally {
      setIsLoading(false); // Set loading to false
    }
  };

  return (
    <div>
      <h1>Chat</h1>

      {/* File Input */}
      <input type="file" accept=".wav" onChange={handleFileChange} />
      <br />

      {/* Upload Button */}
      <button onClick={handleUpload} disabled={!file || isLoading}>
        {isLoading ? "Uploading..." : "Upload"}
      </button>

      {/* Display Results */}
      {result && (
        <div>
          <h2>Results:</h2>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default Chat;
