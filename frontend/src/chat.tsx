import React, { useState } from "react";
import DogHome from "/dog_home.gif";
import ArrowIcon from "/arrow-icon.png";



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
    <div className="h-screen flex-col items-center bg-cover bg-[url('dashboard-bg8.svg')] bg-centre justify-center mx-auto items-start justify-start">

    {/*Mascot Chat*/}
    <div className="flex items-start mb-4">
      <div className="flex gap-4">

        {/* Column 1 */}
        <div >
          <img
            src={DogHome}
            className="Dog home"
            alt="Dog home"
            width={242}
            height={276}
          />
        </div>

        {/* Column 1 */}
        <div className="flex-1 p-4 text-left whitespace-nowrap">
          <h1 className="text-black text-[24px] mb-4 font-medium mt-[35px] ml-[160px]">Let's practice a presentation today!</h1>
        </div>

      </div>
    </div>

    <div className="w-full h-flex bg-[#F6F2ED] pt-[35px] pb-[35px] rounded-[20px] outline outline-3 outline-solid outline-[#86AD95]">

      {/* Dashboard Analytics */}
      <div className="flex items-start mb-8 ml-[58px]">
        <div className="flex gap-4">

          {/* Column 1 */}
          <div className="flex-1 p-4 text-left whitespace-nowrap">
            <h1 className="text-black text-[24px] mb-4 font-medium">My Dashboard</h1>
          </div>

          {/* Column 2 */}
          <div className=" ml-[240px] flex-1 p-[20px] border bg-white text-left flex flex-row justify-between items-start w-[280px] h-[130px] rounded-[12px]">
            <p className="text-black text-[16px] mb-4 font-normal text-left">Total times <br />practiced</p>
            <p className="text-black text-[70px] mb-4 font-medium text-right">10</p>
          </div>

          {/* Column 3 */}
          <div className="flex-1 p-[20px] border bg-white text-left flex flex-row justify-between items-start w-[280px] h-[130px] rounded-[12px]">
            <p className="text-black text-[16px] mb-4 font-normal text-left">Total hours <br />practiced</p>
            <p className="text-black text-[70px] mb-4 font-medium text-right">3</p>
          </div>

        </div>
      </div>

      {/* Past Presentations */}
      <h1 className="text-black text-[24px] mb-4 font-medium text-left ml-[58px]">Past Presentations</h1> 

      <div className="w-full max-w-5xl p-4 border rounded-lg bg-white ml-[58px]">
        <div className="grid grid-cols-[3fr_1fr_1fr] gap-4 border-b py-4 font-semibold text-black">
          <div>Title</div>
          <div>Date</div>
          <div>Duration</div>
        </div>

        <div className="grid grid-cols-[3fr_1fr_1fr] gap-4 py-4 border-b">
          <div>NwHacks Presentation</div>
          <div>18/01/2025</div>
          <div>45 minutes</div>
        </div>
        <div className="grid grid-cols-[3fr_1fr_1fr] gap-4 py-4 border-b">
          <div>Introduction to Figma</div>
          <div>017/11/2024</div>
          <div>15 minutes</div>
        </div>
        <div className="grid grid-cols-[3fr_1fr_1fr] gap-4 py-4 border-b">
          <div>Van Gogh Lecture: Techniques</div>
          <div>05/11/2024</div>
          <div>60 minutes</div>
        </div>
        <div className="grid grid-cols-[3fr_1fr_1fr] gap-4 py-4 border-b">
          <div>Introduction to Creative Coding with Processing.js</div>
          <div>29/10/2024</div>
          <div>30 minutes</div>
        </div>
        <div className="grid grid-cols-[3fr_1fr_1fr] gap-4 py-4">
          <div>Introduction to Figma</div>
          <div>18/08/2024</div>
          <div>30 minutes</div>
        </div>
      </div>

    </div>

          {/* New div for File Input, Upload Button, Display Results with background */}
      <div className="absolute right-0 top-0 h-full w-[378px] bg-[#558066] flex flex-col items-center justify-start pt-8 pr-3 rounded-tl-[30px] rounded-bl-[30px]">

        <div className="mb-[20px] w-[82%] h-[80%] bg-[#6E977D] outline outline-4 outline-dotted outline-white rounded-[10px] flex flex-col justify-center items-center">
        <img
            src={ArrowIcon}
            className="Arrow icon"
            alt="arrow icon"
            width={100}
            height={100}
          />
          <h3 className="text-center pt-[20px] text-white text-[16px] mb-4 font-normal">Drag & drop <br></br> your pitch here</h3>
          
        </div>

        {/* File Input */}
        <input type="file" accept=".wav" onChange={handleFileChange} className="mb-4" />
        
        <a
        className="bg-black rounded-lg m-6 px-8 py-3 text-white text-[18px] hover:bg-slate-700 transition-all"
        href="/chat" /*need to make new page for the feedback one*/
      >
        Upload .mp3 or .wav file
      </a>

        {/* Upload Button */}
        <button onClick={handleUpload} disabled={!file || isLoading} className="mb-4 p-2 bg-blue-500 text-white rounded">
          {isLoading ? "Uploading..." : "Upload"}
        </button>

        {/* Display Results */}
        {result && (
          <div className="text-left">
            <h2 className="font-medium">Results:</h2>
            <pre>{result}</pre>
          </div>
        )}
      </div>

    </div>
  );
};

export default Chat;
