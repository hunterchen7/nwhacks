import { apiUrl, Presentation } from "./chat";
import { useEffect, useState } from "react";

export const Feedback = (props: { presentation: Presentation }) => {
  const { presentation } = props;

  const [audioFile, setAudioFile] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analysis, setAnalysis] = useState<any>(null);
  // const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        // setIsLoading(true);

        // Fetch analysis
        const analysisResponse = await fetch(
          `${apiUrl}/fetch-analysis/${presentation.task_id}`
        );
        if (!analysisResponse.ok) {
          throw new Error("Failed to fetch analysis");
        }
        const analysisData = await analysisResponse.json();
        setAnalysis(analysisData);
        console.log("analysisData", analysisData);

        // Fetch audio file
        const audioResponse = await fetch(
          `${apiUrl}/fetch-audio/${presentation.task_id}`
        );
        if (!audioResponse.ok) {
          throw new Error("Failed to fetch audio file");
        }

        // Create a temporary URL for the audio file
        const audioBlob = await audioResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioFile(audioUrl);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [presentation.task_id]);

  return (
    <div className="w-full fixed bottom-0 h-[62vh] bg-[#F6F2ED] pt-[35px] rounded-[20px] outline outline-3 outline-solid outline-[#86AD95]">
      <div className="p-6 bg-[#F7F4ED] w-[1100px]">
        {/* Header */}
        <h1 className="text-[#5A6E58] text-[24px] font-bold mb-6">
          Tail-wagging feedback, just for you!
        </h1>

        {/* General Feedback */}
        <div className="mb-6">
          <h2 className="text-[#5A6E58] text-[20px] font-medium mb-2">
            General Feedback
          </h2>
          <div className="bg-white rounded-lg border border-[#D7DAC7] p-4">
            {analysis?.results?.summarized_feedback}
          </div>
        </div>

        {/* Audio Transcript */}
        <div className="mb-6">
          <h2 className="text-[#5A6E58] text-[20px] font-medium mb-2">
            Audio Transcript
          </h2>
          <div className="bg-white rounded-lg border border-[#D7DAC7] p-4 flex flex-col items-center">
            <div className="w-full h-[50px] bg-[#D7DAC7] rounded-md mb-4 flex justify-center items-center">
              {audioFile && (
                <audio controls>
                  <source src={audioFile} type="audio/wav" />
                </audio>
              )}
            </div>
          </div>
        </div>

        {/* Highlighted Timestamps */}
        {/*<div>
          <h2 className="text-[#5A6E58] text-[20px] font-medium mb-2">
            Highlighted timestamps
          </h2>
          <div className="bg-white rounded-lg border border-[#D7DAC7] p-4 shadow-md">
            <div className="flex items-start gap-4">

              <div className="flex flex-col items-center">
                <p className="text-[#5A6E58] text-[14px]">0:23</p>
              </div>

              <div className="flex-1">
                <h3 className="text-[#5A6E58] text-[16px] font-medium mb-1">
                  Too much filler words
                </h3>
                <p className="text-[#5A6E58] text-[14px]">
                  The use of filler words such as “um” and “um, um” detracts
                  from the speaker’s credibility and makes the text seem less
                  polished.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2 pl-[40px]">
              <button className="bg-[#A4B494] text-white text-[14px] px-4 py-2 rounded-md">
                Create an energetic tone
              </button>
              <button className="bg-[#A4B494] text-white text-[14px] px-4 py-2 rounded-md">
                Pause instead of saying “um”
              </button>
            </div>
          </div>
        </div>*/}
      </div>
    </div>
  );
};
