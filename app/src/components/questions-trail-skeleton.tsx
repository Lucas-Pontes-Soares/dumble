import { Skeleton } from "./ui/skeleton";

export default function QuestionsTrailSkeleton(){
  return (
    <div className="flex flex-col items-center min-h-screen bg-background py-12">
      <div className="flex flex-col items-center space-y-8">
        <div className={`font-nunito relative w-20 h-20`}>
          <Skeleton className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg" />
        </div>
        <div className={`font-nunito relative w-20 h-20 mr-22`}>
          <Skeleton className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg" />
        </div>
        <div className={`font-nunito relative w-20 h-20 mr-32`}>
          <Skeleton className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg" />
        </div>
        <div className={`font-nunito relative w-20 h-20 mr-22`}>
          <Skeleton className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg" />
        </div>
        <div className={`font-nunito relative w-20 h-20`}>
          <Skeleton className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg" />
        </div>
        <div className={`font-nunito relative w-20 h-20 ml-22`}>
          <Skeleton className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg" />
        </div>
         <div className={`font-nunito relative w-20 h-20 ml-32`}>
          <Skeleton className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg" />
        </div>
      </div>
    </div>
  );
};
