import { Presentation } from "./chat";
import AudioTrans from "/audiotrans.png";

export const Feedback = (props: { presentation: Presentation }) => {
  const { presentation } = props;

  console.log("presentation", presentation);

  return (
    <div className="w-full h-flex bg-[#F6F2ED] pt-[35px] pb-[35px] rounded-[20px] outline outline-3 outline-solid outline-[#86AD95] min-h-[50vh]">
      <div className="p-6 bg-[#F7F4ED] min-h-screen w-[1100px]">
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
            <ul className="list-disc list-inside text-[#5A6E58] text-[16px]">
              <li>You sound upset here—try speaking more calmly.</li>
              <li>It’s hard to hear this part—speak louder.</li>
              <li>Good job! Speak a bit slower here.</li>
            </ul>
          </div>
        </div>

        {/* Audio Transcript */}
        <div className="mb-6">
          <h2 className="text-[#5A6E58] text-[20px] font-medium mb-2">
            Audio Transcript
          </h2>
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
          <h2 className="text-[#5A6E58] text-[20px] font-medium mb-2">
            Highlighted timestamps
          </h2>
          <div className="bg-white rounded-lg border border-[#D7DAC7] p-4 shadow-md">
            <div className="flex items-start gap-4">
              {/* Audio Icon */}
              <div className="flex flex-col items-center">
                <p className="text-[#5A6E58] text-[14px]">0:23</p>
              </div>
              {/* Description */}
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
  );
};
