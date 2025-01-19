/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
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
  const fillerSegments: any[] = [];
  const pacingSegments: any[] = [];
  const volumeSegments: any[] = [];
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

      // Collect filler word segments
      if (segment?.filler_analysis?.total_fillers > 0) {
        fillerSegments.push({
          start: segment.start,
          end: segment.end,
          fillers: segment.filler_analysis.total_fillers,
        });
      }

      // Collect pacing segments
      if (segment.pacing < averagePacing * 0.7) {
        pacingSegments.push({ start: segment.start, end: segment.end, type: "slow" });
      } else if (segment.pacing > averagePacing * 1.3) {
        pacingSegments.push({ start: segment.start, end: segment.end, type: "fast" });
      }

      // Collect volume segments
      if (segment.volume < averageVolume * 0.9) {
        volumeSegments.push({ start: segment.start, end: segment.end, type: "quiet" });
      } else if (segment.volume > averageVolume * 1.1) {
        volumeSegments.push({ start: segment.start, end: segment.end, type: "loud" });
      }
    });
  }

  const mostFrequentEmotion = Object.keys(emotionCounts).reduce(
    (a, b) => (emotionCounts[a] > emotionCounts[b] ? a : b),
    "Unknown"
  );

  // Extract relevant data with default values
  const totalFillerWords = fillerSegments.reduce(
    (sum, segment) => sum + segment.fillers,
    0
  );

  const totalSegments = segments.length;
  const formattedPacing = averagePacing.toFixed(2);

  return (
    <div className="flex flex-col items-center justify-start p-6 gap-4">
      {/* Header */}
      <h1 className="text-white text-[24px] font-medium mb-4">
        Review Suggestions
      </h1>

      {/* Filler Words */}
      <Accordion
        title="Filler Words"
        isOpen={fillerOpen}
        setIsOpen={setFillerOpen}
        icon={Filler}
        content={
          <>
            <p>You used {totalFillerWords} filler words like "um" and "uh".</p>
            <ul className="list-disc pl-4">
              {fillerSegments.map((segment, index) => (
                <li key={index}>
                  Between {segment.start.toFixed(2)}s and{" "}
                  {segment.end.toFixed(2)}s: {segment.fillers} filler words
                </li>
              ))}
            </ul>
          </>
        }
      />

      {/* Emotions */}
      <Accordion
        title="Emotions"
        isOpen={emotionOpen}
        setIsOpen={setEmotionOpen}
        icon={Emotion}
        content={`In this recording, you appeared ${mostFrequentEmotion}.`}
      />

      {/* Pacing */}
      <Accordion
        title="Pacing"
        isOpen={pacingOpen}
        setIsOpen={setPacingOpen}
        icon={Pacing}
        content={
          <>
            <p>
              Your average pacing is {formattedPacing} words per second. There
              were {pacingSegments.filter((s) => s.type === "fast").length}{" "}
              segments where you were too fast and{" "}
              {pacingSegments.filter((s) => s.type === "slow").length} segments
              where you were too slow.
            </p>
            <ul className="list-disc pl-4">
              {pacingSegments.map((segment, index) => (
                <li key={index}>
                  Between {segment.start.toFixed(2)}s and{" "}
                  {segment.end.toFixed(2)}s: {segment.type}
                </li>
              ))}
            </ul>
          </>
        }
      />

      {/* Inconsistent Volume */}
      <Accordion
        title="Inconsistent Volume"
        isOpen={volumeOpen}
        setIsOpen={setVolumeOpen}
        icon={Volume}
        content={
          <>
            <p>
              Over {totalSegments} segments, there were{" "}
              {volumeSegments.filter((s) => s.type === "quiet").length} segments
              where you were too quiet and{" "}
              {volumeSegments.filter((s) => s.type === "loud").length} segments
              where you were too loud.
            </p>
            <ul className="list-disc pl-4">
              {volumeSegments.map((segment, index) => (
                <li key={index}>
                  Between {segment.start.toFixed(2)}s and{" "}
                  {segment.end.toFixed(2)}s: {segment.type}
                </li>
              ))}
            </ul>
          </>
        }
      />
    </div>
  );
};

const Accordion = ({
  title,
  isOpen,
  setIsOpen,
  icon,
  content,
}: {
  title: string;
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
  icon: string;
  content: React.ReactNode;
}) => {
  return (
    <div className="w-[90%]">
      <div
        className="flex items-center justify-between bg-white rounded-[20px] px-4 py-3 shadow-md cursor-pointer transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <img
            src={icon}
            alt={`${title} icon`}
            className="w-[36px] h-[36px] object-contain"
          />
          <p className="text-black text-[16px] font-medium">{title}</p>
        </div>
        {isOpen ? <OpenAccordion /> : <ClosedAccordion />}
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out bg-white rounded-[20px] px-4 py-3 shadow-md ${
          isOpen ? "max-h-[400px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        {content}
      </div>
    </div>
  );
};

const OpenAccordion = () => (
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

const ClosedAccordion = () => (
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
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export default Review;
