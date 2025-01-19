import React, { useEffect, useState } from "react";
import DogHome from "/dog_home.gif";
import DogFeedback from "/dog_feedback.gif";
import Bone from "/bone.png";
import ArrowIcon from "/arrow-icon.png";
import { LoadingModal } from "./loadingModal";
import { Feedback } from "./feedback";
import Review from "./review";
import Dropzone from "react-dropzone";

export interface Presentation {
  file_name: string;
  status: string;
  task_id: string;
  duration: string;
  uploaded_at: string;
}

const computeDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  if (minutes > 1) {
    return `${minutes} mins ${seconds}s`;
  } else if (minutes === 1) {
    return `${minutes} min ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

// this should be an env var but oh well
export const apiUrl = "http://127.0.0.1:8000";

const Chat: React.FC = () => {
  const [file, setFile] = useState<File | null>(null); // State to store the uploaded file
  const [isLoading, setIsLoading] = useState<boolean>(false); // State to manage loading status
  const [openPresentations, setOpenPresentations] = useState<Presentation[]>(
    []
  );
  const [focusedPresentation, setFocusedPresentation] =
    useState<Presentation | null>(null);
  const [presentationList, setPresentationList] = useState<Presentation[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  const presentationContains = (presentation: Presentation) => {
    return openPresentations.some(
      (openPresentation) => openPresentation.task_id === presentation.task_id
    );
  };

  useEffect(() => {
    const fetchData = () => {
      fetch(`${apiUrl}/all-analyses`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log("Fetched presentations:", data);
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

  useEffect(() => {
    // Automatically open the uploaded file when it's completed
    if (currentTaskId) {
      const updatedPresentation = presentationList.find(
        (presentation) =>
          presentation.task_id === currentTaskId &&
          presentation.status === "completed"
      );
      if (updatedPresentation && !presentationContains(updatedPresentation)) {
        setOpenPresentations([updatedPresentation, ...openPresentations]);
        setFocusedPresentation(updatedPresentation);
        setCurrentTaskId(null); // Reset currentTaskId after handling
      }
    }
  }, [presentationList, currentTaskId]); // Runs whenever presentationList or currentTaskId changes

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true); // Set loading to true
      fetch(`${apiUrl}/upload`, {
        method: "POST",
        body: formData,
      }).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            console.log("Uploaded file:", data);
            setCurrentTaskId(data.task_id);
          });
        } else {
          alert("Error uploading file.");
        }
      });
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
                src={!focusedPresentation ? DogHome : DogFeedback}
                className="Dog home"
                alt="Dog home"
                width={242}
                height={276}
              />
            </a>

            {/* Column 1 */}
            <div className="flex-1 p-4 text-left whitespace-nowrap">
              <h1 className="text-black text-[24px] mb-4 font-medium mt-[35px] ml-[200px]">
                {!focusedPresentation
                  ? "Let's practice a presentation today!"
                  : "We've fetched your results, friend!"}
              </h1>
            </div>
          </div>
        </div>

        {/*placeholder for tab texts styling*/}
        <div className="flex">
          <h3
            className={`h-20 text-black text-[24px] font-semibold px-8 mx-3 pt-3 mt-3 ${
              focusedPresentation != null
                ? "bg-[#558066] text-white"
                : "bg-[#F6F2ED]"
            } outline outline-3 outline-solid outline-[#86AD95] rounded-lg transition-all cursor-pointer`}
            onClick={() => setFocusedPresentation(null)}
          >
            Home
          </h3>
          {openPresentations.map((presentation) => (
            <h3
              className={`h-20 text-black text-[24px] pb-4 font-semibold px-6 mx-3 mt-3 py-3 ${
                focusedPresentation?.task_id !== presentation.task_id
                  ? "bg-black text-white"
                  : "bg-[#F6F2ED]"
              } outline outline-3 outline-solid outline-[#86AD95] rounded-lg cursor-pointer transition-all hover:outline-slate-500`}
              onClick={() => setFocusedPresentation(presentation)}
              key={presentation.task_id}
            >
              {presentation.file_name}
            </h3>
          ))}
        </div>
      </div>

      {!focusedPresentation ? (
        <div className="w-full fixed bottom-0 h-[62vh] bg-[#F6F2ED] pt-[35px] rounded-[20px] outline outline-3 outline-solid outline-[#86AD95]">
          {/* Dashboard Analytics */}
          <div className="flex items-start mb-3 ml-[58px]">
            <div className="flex gap-4">
              {/* Column 1 */}
              <div className="flex flex-col px-4 text-left whitespace-nowrap justify-between">
                <h1 className="text-black text-[24px] mb-4 font-medium">
                  My Dashboard
                </h1>
                <img
                  src={Bone}
                  className="-rotate-12 mx-auto mb-3"
                  alt="Bone icon"
                  width={135}
                  height={135}
                />
              </div>

              {/* Column 2 */}
              <div className="ml-[240px] flex-1 p-[20px] border bg-white text-left flex flex-row justify-between items-start w-[280px] h-[130px] rounded-[12px]">
                <p className="text-black text-[16px] mb-4 font-normal text-left">
                  Total times <br />
                  practiced
                </p>
                <p className="text-black text-[70px] mb-4 font-medium text-right">
                  {presentationList.length || "-"}
                </p>
              </div>

              {/* Column 3 */}
              <div className="flex-1 p-[20px] border bg-white text-left flex flex-row justify-between items-start w-[280px] h-[130px] rounded-[12px]">
                <p className="text-black text-[16px] mb-4 font-normal text-left">
                  Total minutes <br />
                  practiced
                </p>
                <p className="text-black text-[70px] mb-4 font-medium text-right">
                  {presentationList.reduce(
                    (total, presentation) =>
                      total + parseInt(presentation.duration),
                    0
                  ) / 60 || "-"}
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

            <div className="max-h-[25vh] overflow-y-auto">
              {presentationList &&
                presentationList.map((presentation) => (
                  <div
                    className="grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 py-4 border-b"
                    key={presentation.task_id}
                  >
                    <div
                      className="cursor-pointer hover:underline"
                      onClick={() => {
                        if (!presentationContains(presentation)) {
                          setOpenPresentations([
                            presentation,
                            ...openPresentations,
                          ]);
                        }
                        setFocusedPresentation(presentation);
                      }}
                    >
                      {presentation.file_name}
                    </div>
                    <div>
                      {new Date(presentation.uploaded_at).toLocaleDateString()}
                    </div>
                    <div>
                      {presentation.duration
                        ? computeDuration(parseInt(presentation.duration))
                        : "-"}{" "}
                    </div>
                    <div>{presentation.status}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <Feedback presentation={focusedPresentation} />
      )}

      {/* New div for File Input, Upload Button, Display Results with background */}
      {!focusedPresentation ? (
        <div className="absolute right-0 top-0 h-full w-[378px] bg-[#558066] flex flex-col items-center justify-start pt-8 pr-3 rounded-tl-[30px] rounded-bl-[30px]">
          {/*<div className="mb-[20px] w-[82%] h-[80%] bg-[#6E977D] outline outline-4 outline-dotted outline-white rounded-[10px] flex flex-col justify-center items-center">
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
          </div>*/}

          <Dropzone
            onDrop={(acceptedFiles) => setFile(acceptedFiles[0])}
            accept={{ "audio/wav": [".wav"] }}
          >
            {({ getRootProps, getInputProps, isDragAccept, isDragReject }) => (
              <div
                {...getRootProps()}
                className={`mb-[20px] w-[82%] h-[80%] rounded-[10px] flex flex-col justify-center items-center transition-all 
      outline outline-4 outline-dotted 
      ${
        isDragAccept
          ? "bg-green-600 outline-green-400"
          : isDragReject
          ? "bg-red-500 outline-red-400"
          : "bg-[#6E977D] outline-white"
      } hover:bg-[#5C816B] hover:scale-102.5 hover:shadow-lg cursor-pointer`}
              >
                <input {...getInputProps()} />
                <img
                  src={ArrowIcon}
                  className="Arrow icon"
                  alt="arrow icon"
                  width={80}
                  height={80}
                />
                <h3 className="text-center pt-[20px] text-white text-[16px] mb-4 font-normal">
                  {isDragReject
                    ? "Unsupported file. Please upload a .wav file."
                    : "Drag & drop your pitch here"}
                </h3>
                {file && (
                  <p className="text-white text-[16px] font-medium animate-fade-in">
                    {file.name}
                  </p>
                )}
              </div>
            )}
          </Dropzone>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className="bg-black rounded-lg m-6 px-8 py-3 text-white text-[18px] hover:bg-slate-700 transition-all cursor-pointer"
          >
            Upload
          </button>
        </div>
      ) : (
        <div className="absolute right-0 top-0 h-full w-[378px] bg-[#558066] flex flex-col items-center justify-start pt-8 pr-3 rounded-tl-[30px] rounded-bl-[30px]">
          <Review presentation={focusedPresentation} />
        </div>
      )}

      {currentTaskId &&
        // loading if the current task is status processing
        presentationList.some(
          (presentation) =>
            presentation.task_id === currentTaskId &&
            presentation.status === "processing"
        ) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <LoadingModal />
          </div>
        )}
    </div>
  );
};

export default Chat;
