import DogLogo from "/dog_land.gif";
import "./App.css";

function App() {
  return (
    <main className="flex h-screen flex-col items-center bg-cover bg-[url('landingpage-bg4.svg')] bg-centre justify-center mx-auto">
      <img
        src={DogLogo}
        className="logo"
        alt="Dog logo"
        width={350}
        height={350}
      />
      <h1 className="text-black text-5xl mb-4 font-semibold">Pawfect Pitch</h1>
      <h3 className="text-black text-[24px] mb-4 font-normal">Perfect your pitch today</h3>

      <a
        className="bg-black rounded-lg m-6 px-8 py-3 text-white text-2xl hover:bg-slate-700 transition-all"
        href="/chat"
      >
        Get Started
      </a>



<div className="flex-1 border pl-[20px] pr-[20px] pt-[10px] pb-[10px] bg-white text-left flex flex-row justify-between items-start w-100 h-[111px] rounded-[12px] gap-4 items-center justify-start">

              <img
                src={DogLogo}
                className="logo"
                alt="Dog logo"
                width={80}
                height={80}
              />
              
              <p className="text-black text-[20px] mb-4 font-medium text-left">
                Filler Words
              </p>
              <p className="text-black text-[20px] mb-4 font-medium text-right">
                10
              </p>


              <img
                src={DogLogo}
                className="logo"
                alt="Dog logo"
                width={40}
                height={40}
              />
            </div>
    </main>
  );
}

export default App;
