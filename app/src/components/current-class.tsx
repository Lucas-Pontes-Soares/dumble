import { X } from "lucide-react"
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface CurrentClassProps {
  userType: 'teacher' | 'student';
  acronym: string;
  title: string;
  class_id: string;
}

export default function CurrentClass({ acronym, title, class_id, userType }: CurrentClassProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background p-4 pb-0">
        <div className="w-full max-w-2xl mx-auto border-2 dark:border-gray-800 white:border-gray-400 rounded-xl p-2 flex items-center gap-4">
            <Link to={`/${userType}s/classes`}>
              <X className="ml-2 h-5 w-5 text-gray-500" />
            </Link>
            <div className="ml-4 flex-grow">
              <Link to={`/${userType}s/${class_id}/info`}>
                <p className="cursor-pointer underline">{title}</p>
              </Link>
            </div>
            <Link to={`/${userType}s/${class_id}/info`}>
              <Avatar className="mr-4 w-12 h-12">
                  {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
                  <AvatarFallback className="bg-amber-500 text-white">{acronym}</AvatarFallback>
              </Avatar>
            </Link>
        </div>
    </div>
  );
}
