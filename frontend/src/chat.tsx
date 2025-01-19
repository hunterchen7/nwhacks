import React, { useEffect, useState } from "react";
import DogHome from "/dog_home.gif";
import ArrowIcon from "/arrow-icon.png";

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
          feedback
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
          feedback
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
