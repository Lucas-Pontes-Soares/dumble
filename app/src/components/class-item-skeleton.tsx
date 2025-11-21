import { Skeleton } from "./ui/skeleton";

export default function ClassItemSkeleton() {
  return (
    <div className="w-full max-w-2xl border-2 dark:border-gray-800 rounded-xl p-2 flex items-center gap-4 mb-2">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-grow">
            <Skeleton className="h-4 w-3/4" />
            {/*<Skeleton className="h-4 mt-2 w-1/4" />*/}
        </div>
        {/*<Skeleton className="h-5 w-5" />*/}
    </div>
  );
}
