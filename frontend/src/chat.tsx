import React, { useEffect, useState } from "react";
import DogHome from "/dog_home.gif";
import ArrowIcon from "/arrow-icon.png";
import Filler from "/filler.png";
import Emotion from "/emotion.png";
import Pacing from "/pace.png";
import Volume from "/volume.png";
import AudioTrans from "/audiotrans.png";


interface Presentation {
  file_name: string;
  status: string;
  task_id: string;
  duration: string;
  uploaded_at: string;
}

// this should be an env var but oh well
const apiUrl = "http://127.0.0.1:8000";

const Chat: React.FC = () => {
  const [file, setFile] = useState<File | null>(null); // State to store the uploaded file
  const [isLoading, setIsLoading] = useState<boolean>(false); // State to manage loading status
  const [openPresentations, setOpenPresentations] = useState<Presentation[]>(
    []
  );
  const [focusedPresentation, setFocusedPresentation] =
    useState<Presentation | null>(null);
  const [presentationList, setPresentationList] = useState<Presentation[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  useEffect(() => {
    console.log("Presentation list changed:", presentationList);
  }, [presentationList]);

  useEffect(() => {
    const fetchData = () => {
      fetch(`${apiUrl}/all-analyses`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched presentations:", data);
          setPresentationList(data.tasks);
        })
        .catch((error) => {
          console.error("Error fetching presentations:", error);
        });
    };

    // Call fetchData initially and set up an interval to refetch every second
    fetchData();
    const intervalId = setInterval(fetchData, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true); // Set loading to true
      const response = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file.");
      }

      await response.json();
      console.log(`Successfully uploaded file: ${response}`);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false); // Set loading to false
    }
  };

  return (
    <div className="max-h-screen flex-col items-center bg-cover bg-[url('dashboard-bg8.svg')] bg-centre justify-center mx-auto items-start justify-start">
      <div>
        {/*Mascot Chat*/}
        <div className="flex items-start mb-4">
          <div className="flex gap-4">
            {/* Column 1 */}
            <a href="/">
              <img
                src={DogHome}
                className="Dog home"
                alt="Dog home"
                width={242}
                height={276}
              />
            </a>

            {/* Column 1 */}
            <div className="flex-1 p-4 text-left whitespace-nowrap">
              <h1 className="text-black text-[24px] mb-4 font-medium mt-[35px] ml-[160px]">
                Let's practice a presentation today!
              </h1>
            </div>
          </div>
        </div>

        {/*placeholder for tab texts styling*/}
        <div className="flex max-w-[60vw] overflow-x-auto">
          <h3
            className={`h-24 text-black text-[24px] pb-4 font-semibold px-4 mx-3 ${
              focusedPresentation === null ? "bg-black" : "bg-[#F6F2ED]"
            } outline outline-3 outline-solid outline-[#86AD95] rounded-lg`}
            onClick={() => setFocusedPresentation(null)}
          >
            Home
          </h3>
          {openPresentations.map((presentation) => (
            <h3
              className={`h-24 text-black text-[24px] pb-4 font-semibold px-4 mx-3 ${
                focusedPresentation === presentation
                  ? "bg-black"
                  : "bg-[#F6F2ED]"
              } outline outline-3 outline-solid outline-[#86AD95] rounded-lg`}
              onClick={() => setFocusedPresentation(presentation)}
            >
              {presentation.file_name}
            </h3>
          ))}
        </div>
      </div>

      {!focusedPresentation ? (
        <div className="w-full h-flex bg-[#F6F2ED] pt-[35px] pb-[35px] rounded-[20px] outline outline-3 outline-solid outline-[#86AD95]">
          {/* Dashboard Analytics */}
          <div className="flex items-start mb-8 ml-[58px]">
            <div className="flex gap-4">
              {/* Column 1 */}
              <div className="flex-1 p-4 text-left whitespace-nowrap">
                <h1 className="text-black text-[24px] mb-4 font-medium">
                  My Dashboard
                </h1>
              </div>

              {/* Column 2 */}
              <div className=" ml-[240px] flex-1 p-[20px] border bg-white text-left flex flex-row justify-between items-start w-[280px] h-[130px] rounded-[12px]">
                <p className="text-black text-[16px] mb-4 font-normal text-left">
                  Total times <br />
                  practiced
                </p>
                <p className="text-black text-[70px] mb-4 font-medium text-right">
                  10
                </p>
              </div>

              {/* Column 3 */}
              <div className="flex-1 p-[20px] border bg-white text-left flex flex-row justify-between items-start w-[280px] h-[130px] rounded-[12px]">
                <p className="text-black text-[16px] mb-4 font-normal text-left">
                  Total hours <br />
                  practiced
                </p>
                <p className="text-black text-[70px] mb-4 font-medium text-right">
                  3
                </p>
              </div>
            </div>
          </div>

          {/* Past Presentations */}
          <h1 className="text-black text-[24px] mb-4 font-medium text-left ml-[58px]">
            Past Presentations
          </h1>

          <div className="w-full max-w-5xl p-4 border rounded-lg bg-white ml-[58px]">
            <div className="grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 border-b py-4 font-semibold text-black">
              <div>Title</div>
              <div>Date</div>
              <div>Duration</div>
              <div>Status</div>
            </div>

            <div className="max-h-[30vh] overflow-y-auto">
              {presentationList &&
                presentationList.map((presentation) => (
                  <div
                    className="grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 py-4 border-b"
                    onClick={() => {
                      if (!openPresentations.includes(presentation)) {
                        setOpenPresentations([
                          presentation,
                          ...openPresentations,
                        ]);
                      }
                      setFocusedPresentation(presentation);
                    }}
                  >
                    <div>{presentation.file_name}</div>
                    <div>
                      {new Date(presentation.uploaded_at).toLocaleDateString()}
                    </div>
                    <div>{presentation.duration} </div>
                    <div>{presentation.status}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-flex bg-[#F6F2ED] pt-[35px] pb-[35px] rounded-[20px] outline outline-3 outline-solid outline-[#86AD95] min-h-[50vh]">

          <div className="p-6 bg-[#F7F4ED] min-h-screen w-[1100px]">
  {/* Header */}
  <h1 className="text-[#5A6E58] text-[24px] font-bold mb-6">
    Tail-wagging feedback, just for you!
  </h1>

  {/* General Feedback */}
  <div className="mb-6">
    <h2 className="text-[#5A6E58] text-[20px] font-medium mb-2">General Feedback</h2>
    <div className="bg-white rounded-lg border border-[#D7DAC7] p-4">
      <ul className="list-disc list-inside text-[#5A6E58] text-[16px]">
        <li>You sound upset here—try speaking more calmly.</li>
        <li>It’s hard to hear this part—speak louder.</li>
        <li>Good job! Speak a bit slower here.</li>
      </ul>
    </div>
  </div>

  {/* Audio Transcript */}
  <div className="mb-6">
    <h2 className="text-[#5A6E58] text-[20px] font-medium mb-2">Audio Transcript</h2>
    <div className="bg-white rounded-lg border border-[#D7DAC7] p-4 flex flex-col items-center">
      {/* Waveform Placeholder */}
      <div className="w-full h-[50px] bg-[#D7DAC7] rounded-md mb-4 flex justify-center items-center">
        {/* Replace this with an audio waveform image or a player */}

        <img
        src={AudioTrans}
        className="audiotrans"
        alt="audio"
        width={800}
        height={276}
  />

      </div>
      {/* Controls */}
      <div className="flex items-center justify-between w-full">
        <p className="text-[#5A6E58] text-[14px]">0:00</p>
        <div className="flex gap-2">
          <button className="text-[#5A6E58]">⏮</button>
          <button className="text-[#5A6E58]">▶</button>
          <button className="text-[#5A6E58]">⏭</button>
        </div>
        <p className="text-[#5A6E58] text-[14px]">0:45</p>
      </div>
    </div>
  </div>

  {/* Highlighted Timestamps */}
  <div>
    <h2 className="text-[#5A6E58] text-[20px] font-medium mb-2">Highlighted timestamps</h2>
    <div className="bg-white rounded-lg border border-[#D7DAC7] p-4 shadow-md">
      <div className="flex items-start gap-4">
        {/* Audio Icon */}
        <div className="flex flex-col items-center">

          <p className="text-[#5A6E58] text-[14px]">0:23</p>
        </div>
        {/* Description */}
        <div className="flex-1">
          <h3 className="text-[#5A6E58] text-[16px] font-medium mb-1">Too much filler words</h3>
          <p className="text-[#5A6E58] text-[14px]">
            The use of filler words such as “um” and “um, um” detracts from the
            speaker’s credibility and makes the text seem less polished.
          </p>
        </div>
      </div>
      {/* Suggestions */}
      <div className="mt-4 flex gap-2 pl-[40px]">
        <button className="bg-[#A4B494] text-white text-[14px] px-4 py-2 rounded-md">
          Create an energetic tone
        </button>
        <button className="bg-[#A4B494] text-white text-[14px] px-4 py-2 rounded-md">
          Pause instead of saying “um”
        </button>
      </div>
    </div>
  </div>
</div>




        </div>
      )}

      {/* New div for File Input, Upload Button, Display Results with background */}
      {!focusedPresentation ? (
        <div className="absolute right-0 top-0 h-full w-[378px] bg-[#558066] flex flex-col items-center justify-start pt-8 pr-3 rounded-tl-[30px] rounded-bl-[30px]">
          <div className="mb-[20px] w-[82%] h-[80%] bg-[#6E977D] outline outline-4 outline-dotted outline-white rounded-[10px] flex flex-col justify-center items-center">
            <img
              src={ArrowIcon}
              className="Arrow icon"
              alt="arrow icon"
              width={100}
              height={100}
            />
            <h3 className="text-center pt-[20px] text-white text-[16px] mb-4 font-normal">
              Drag & drop <br></br> your pitch here
            </h3>
          </div>

          {/* File Input */}
          <input
            type="file"
            accept=".wav"
            onChange={handleFileChange}
            className="mb-4"
          />

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className="bg-black rounded-lg m-6 px-8 py-3 text-white text-[18px] hover:bg-slate-700 transition-all cursor-pointer"
          >
            Upload .wav file
          </button>
        </div>
      ) : (
        <div className="absolute right-0 top-0 h-full w-[378px] bg-[#558066] flex flex-col items-center justify-start pt-8 pr-3 rounded-tl-[30px] rounded-bl-[30px]">

          
          <div className="min-h-screen flex flex-col items-center justify-start p-6 gap-4">
    {/* Header */}
    <h1 className="text-white text-[24px] font-medium mb-4">Review Suggestions</h1>

    {/* Suggestion Items */}
    <div className="flex items-center justify-between bg-white w-[90%] rounded-[20px] px-4 py-3 shadow-md">
      <div className="flex items-center gap-3">
        <img
          src={Filler}
          alt="Filler Words icon"
          className="w-[36px] h-[36px] object-contain"
        />
        <p className="text-black text-[16px] font-medium">Filler Words</p>
      </div>
      <div className="text-black text-[16px] font-medium">12</div>
      
    </div>

    <div className="flex items-center justify-between bg-white w-[90%] rounded-[20px] px-4 py-3 shadow-md">
      <div className="flex items-center gap-3">
        <img
          src={Emotion}
          alt="Emotions icon"
          className="w-[36px] h-[36px] object-contain"
        />
        <p className="text-black text-[16px] font-medium">Emotions</p>
      </div>
      <div className="text-black text-[16px] font-medium">12</div>
    </div>

    <div className="flex items-center justify-between bg-white w-[90%] rounded-[20px] px-4 py-3 shadow-md">
      <div className="flex items-center gap-3">
        <img
          src={Pacing}
          alt="Pacing icon"
          className="w-[36px] h-[36px] object-contain"
        />
        <p className="text-black text-[16px] font-medium">Pacing</p>
      </div>
      <div className="text-black text-[16px] font-medium">12</div>
    </div>

    <div className="flex items-center justify-between bg-white w-[90%] rounded-[20px] px-4 py-3 shadow-md">
      <div className="flex items-center gap-3">
        <img
          src={Volume}
          alt="Inconsistent Volume icon"
          className="w-[36px] h-[36px] object-contain"
        />
        <p className="text-black text-[16px] font-medium">Inconsistent Volume</p>
      </div>
      <div className="text-black text-[16px] font-medium">12</div>
    </div>
  </div>





        </div>
      )}
    </div>

          
        



  );
};

export default Chat;

/*const examplePresentations = [
  {
    title: "NwHacks Presentation",
    duration: "60.34",
    date: "2025-01-19T03:39:26.931200",
  },
  {
    title: "Introduction to Figma",
    duration: "15.23",
    date: "2024-11-17T03:39:26.931200",
  },
  {
    title: "Van Gogh Lecture: Techniques",
    duration: "60.00",
    date: "2024-11-05T03:39:26.931200",
  },
  {
    title: "Introduction to Creative Coding with Processing.js",
    duration: "30.00",
    date: "2024-10-29T03:39:26.931200",
  },
  {
    title: "Introduction to Figma 2",
    duration: "30.00",
    date: "2024-08-18T03:39:26.931200",
  },
  {
    title: "NwHacks Presentation 2",
    duration: "60.34",
    date: "2025-01-19T03:39:26.931200",
  },
];
*/
