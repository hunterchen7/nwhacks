import DogLogo from "/dog_land.gif";
import "./App.css";

function App() {
  return (
    <main className="flex h-screen flex-col items-center bg-cover bg-[url('landingpage-bg.svg')] bg-centre justify-center mx-auto">
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
    </main>
  );
}

export default App;
