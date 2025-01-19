import React, { useEffect, useState } from "react";
import DogHome from "/dog_home.gif";
import ArrowIcon from "/arrow-icon.png";
import Filler from "/filler.png";
import Emotion from "/emotion.png";
import Pacing from "/pace.png";
import Volume from "/volume.png";
import { LoadingModal } from "./loadingModal";
import { Feedback } from "./feedback";

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

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
              <div className="flex flex-col p-4 text-left whitespace-nowrap">
                <h1 className="text-black text-[24px] mb-4 font-medium">
                  My Dashboard
                </h1>
                <svg
                  width="120"
                  height="71"
                  viewBox="0 0 120 71"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M87.8531 43.3747C89.6798 44.4302 91.4579 45.8884 93.0733 47.2659C97.7278 51.2352 103.526 53.8782 109.68 53.299C113.436 52.9456 115.791 52.458 117.823 48.9416C120.457 44.3831 113.925 37.6849 110.429 35.076C109.843 34.6387 105.728 32.8818 106.211 32.0454C106.959 30.7504 108.334 29.3671 109.28 28.1939C111.629 25.2826 113.284 21.7521 115.149 18.5231C116.11 16.86 118.106 14.5572 117.816 12.5017C117.344 9.15211 115.064 5.86034 112.252 4.06816C105.501 -0.233907 99.755 1.1401 94.5618 6.94014C91.8243 9.99741 89.1026 13.5182 90.8824 17.6887C91.5049 19.1473 92.3859 20.6509 92.7066 22.2113C92.8492 22.905 93.7853 23.5535 93.7103 24.2599C93.5438 25.8293 83.8121 28.032 82.2661 28.4908C74.1236 30.9072 66.2092 34.1336 57.7903 35.5354C55.7649 35.8727 53.8396 36.7692 51.9146 37.484C46.3069 39.5662 39.9246 40.201 34.0143 40.8282C32.8415 40.9526 31.583 41.1253 30.4085 41.1197C29.0956 41.1134 29.7905 40.291 29.8744 39.1236C30.181 34.8598 30.0427 32.7668 26.3135 30.0352C21.3553 26.4033 13.1012 22.9508 6.99044 25.6201C-1.01313 29.1162 2.31864 38.7897 7.99238 42.7608C10.7543 44.6939 13.8775 45.7965 16.8204 47.3304C17.6061 47.7399 24.1904 49.1609 22.7231 49.5535C14.2488 51.8211 15.3507 62.526 21.3926 67.3778C26.3105 71.3269 33.9335 66.6031 36.4827 62.1911C37.2102 60.9321 37.9567 58.7683 39.2447 58.0059C41.6571 56.5779 44.38 55.7207 47.0753 54.9995C49.435 54.3681 51.7866 53.9459 54.1827 53.7314C57.212 53.4602 60.0961 52.5832 63.1977 52.1905C68.4725 51.5227 72.6967 47.7473 77.6563 46.4202C80.1109 45.7634 82.3641 44.1689 85.0959 44.469C85.8502 44.5519 89.2268 44.295 89.7835 43.9277"
                    stroke="black"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Column 2 */}
              <div className=" ml-[240px] flex-1 p-[20px] border bg-white text-left flex flex-row justify-between items-start w-[280px] h-[130px] rounded-[12px]">
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
                  ) || "-"}
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
          <div className="flex flex-col items-center justify-start p-6 gap-4">
            {/* Header */}
            <h1 className="text-white text-[24px] font-medium mb-4">
              Review Suggestions
            </h1>

            {/* Suggestion Items */}
            <div className="flex items-center justify-between bg-white w-[90%] rounded-[20px] px-4 py-3 shadow-md">
              <div className="flex items-center gap-3">
                <img
                  src={Filler}
                  alt="Filler Words icon"
                  className="w-[36px] h-[36px] object-contain"
                />
                <p className="text-black text-[16px] font-medium">
                  Filler Words
                </p>
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
                <p className="text-black text-[16px] font-medium">
                  Inconsistent Volume
                </p>
              </div>
              <div className="text-black text-[16px] font-medium">12</div>
            </div>
          </div>
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
