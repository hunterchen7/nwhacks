/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { apiUrl, Presentation } from "./chat";

// Import images
import Filler from "/filler.png";
import Emotion from "/emotion.png";
import Pacing from "/pace.png";
import Volume from "/volume.png";

const Review = (props: { presentation: Presentation }) => {
  const { presentation } = props;
  const [analysis, setAnalysis] = useState<any>(null);
  const [fillerOpen, setFillerOpen] = useState<boolean>(false);
  const [emotionOpen, setEmotionOpen] = useState<boolean>(false);
  const [pacingOpen, setPacingOpen] = useState<boolean>(false);
  const [volumeOpen, setVolumeOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const analysisResponse = await fetch(
          `${apiUrl}/fetch-analysis/${presentation.task_id}`
        );
        if (!analysisResponse.ok) {
          throw new Error("Failed to fetch analysis");
        }
        const analysisData = await analysisResponse.json();
        setAnalysis(analysisData);
        console.log("analysisData", analysisData);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    fetchFeedback();
  }, [presentation.task_id]);

  if (!analysis || !analysis.results) {
    return <div>Loading...</div>;
  }

  const segments = analysis?.results?.segments ?? [];
  const averageVolume = analysis?.results?.average_volume ?? 0;
  const averagePacing = analysis?.results?.average_pacing ?? 0;

  // Initialize variables
  let volumenBelow = 0;
  let volumenAbove = 0;
  let paceBelow = 0;
  let paceAbove = 0;
  const emotionCounts: { [key: string]: number } = {};

  if (segments.length > 0) {
    segments.forEach((segment: any) => {
      const currEmotion =
        segment?.emotion_analysis?.predicted_emotion ?? "Unknown";
      if (emotionCounts[currEmotion]) {
        emotionCounts[currEmotion]++;
      } else {
        emotionCounts[currEmotion] = 1;
      }
      if (segment.volume < averageVolume * 0.9) {
        volumenBelow++;
      } else if (segment.volume > averageVolume * 1.1) {
        volumenAbove++;
      }
      if (segment.pacing < averagePacing * 0.7) {
        paceBelow++;
      } else if (segment.pacing > averagePacing * 1.3) {
        paceAbove++;
      }
    });
  }

  const mostFrequentEmotion = Object.keys(emotionCounts).reduce(
    (a, b) => (emotionCounts[a] > emotionCounts[b] ? a : b),
    "Unknown"
  );

  // Extract relevant data with default values
  const totalFillerWords = segments.reduce(
    (sum: number, segment: any) =>
      sum + (segment?.filler_analysis?.total_fillers ?? 0),
    0
  );
  const totalSegments = segments.length;
  const formattedPacing = averagePacing.toFixed(2);
  const formattedVolume = averageVolume.toFixed(2);

  return (
    <div className="flex flex-col items-center justify-start p-6 gap-4">
      {/* Header */}
      <h1 className="text-white text-[24px] font-medium mb-4">
        Review Suggestions
      </h1>

      {/* Filler Words */}
      <div>
        <div
          className="flex items-center justify-between bg-white w-[90%] rounded-[20px] px-4 py-3 shadow-md cursor-pointer transition-all"
          onClick={() => setFillerOpen(!fillerOpen)}
        >
          <div className="flex items-center gap-3">
            <img
              src={Filler}
              alt="Filler Words icon"
              className="w-[36px] h-[36px] object-contain"
            />
            <p className="text-black text-[16px] font-medium">Filler Words</p>
          </div>
          {fillerOpen ? <OpenAccordion /> : <ClosedAccordion />}
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out bg-white rounded-[20px] px-4 py-3 shadow-md ${
            fillerOpen ? "max-h-[200px] opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <p>You used {totalFillerWords} filler words like "um" and "uh".</p>
        </div>
      </div>

      {/* Emotions */}
      <div>
        <div
          className="flex items-center justify-between bg-white rounded-[20px] px-4 py-3 shadow-md cursor-pointer transition-all"
          onClick={() => setEmotionOpen(!emotionOpen)}
        >
          <div className="flex items-center gap-3">
            <img
              src={Emotion}
              alt="Emotions icon"
              className="w-[36px] h-[36px] object-contain"
            />
            <p className="text-black text-[16px] font-medium">Emotions</p>
          </div>
          {emotionOpen ? <OpenAccordion /> : <ClosedAccordion />}
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out bg-white w-[300px] rounded-[20px] px-4 py-3 shadow-md ${
            emotionOpen ? "max-h-[300px] opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          In this recording, you appeared {mostFrequentEmotion}.
        </div>
      </div>

      {/* Pacing */}
      <div>
        <div
          className="flex items-center justify-between bg-white rounded-[20px] px-4 py-3 shadow-md cursor-pointer transition-all mx-0"
          onClick={() => setPacingOpen(!pacingOpen)}
        >
          <div className="flex items-center gap-3">
            <img
              src={Pacing}
              alt="Pacing icon"
              className="w-[36px] h-[36px] object-contain"
            />
            <p className="text-black text-[16px] font-medium">Pacing</p>
          </div>
          {pacingOpen ? <OpenAccordion /> : <ClosedAccordion />}
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out bg-white rounded-[20px] px-4 py-3 shadow-md ${
            pacingOpen ? "max-h-[200px] opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <p>
            Your average pacing is {formattedPacing} words per second. There
            were {paceAbove} segments where you were too fast, and {paceBelow}{" "}
            segments where you were too slow.
          </p>
        </div>
      </div>

      {/* Inconsistent Volume */}
      <div>
        <div
          className="flex items-center justify-between bg-white rounded-[20px] px-4 py-3 shadow-md cursor-pointer transition-all mx-0"
          onClick={() => setVolumeOpen(!volumeOpen)}
        >
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
          {volumeOpen ? <OpenAccordion /> : <ClosedAccordion />}
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out bg-white w-[90%] rounded-[20px] px-4 py-3 shadow-md ${
            volumeOpen ? "max-h-[200px] opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <p>
            Over {totalSegments} segments, there were {volumenBelow} segments
            where you were too quiet, and {volumenAbove} segments where you were
            too loud.
          </p>
        </div>
      </div>
    </div>
  );
};

const OpenAccordion = () => {
  return (
    <svg
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 16.5L10.5858 9.91421C11.3668 9.13316 12.6332 9.13316 13.4142 9.91421L20 16.5"
        stroke="black"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

const ClosedAccordion = () => {
  return (
    <svg
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 8.5L13.4142 15.0858C12.6332 15.8668 11.3668 15.8668 10.5858 15.0858L4 8.5"
        stroke="black"
        stroke-width="3"
        stroke-linecap="round"
      />
    </svg>
  );
};

export default Review;
