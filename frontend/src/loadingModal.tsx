import loadingDog from "/dog_load.gif";

export const LoadingModal = () => {
  return (
    <div className="min-w-[34vw] min-h-[50vh] bg-gradient-to-b from-[#86AD95] to-[#F6F2ED] rounded-lg p-4 flex flex-col items-center justify-center">
      <img src={loadingDog} alt="loading dog" width={400} height={300} />
      <div className="font-base text-3xl pb-4">Sit tight, fetching your results...</div>
    </div>
  );
};
