import { X } from "lucide-react"
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "./ui/avatar";
import getInitials from "@/getInitials";
import getAvatarColor from "@/getAvatarColor";

interface CurrentClassProps {
  userType: 'teacher' | 'student';
  title: string;
  class_id: string;
}

export default function CurrentClass({ title, class_id, userType }: CurrentClassProps) {
  return (
    <div className="font-nunito fixed top-0 left-0 right-0 z-50 p-4 h-auto bg-white dark:bg-[#09090b]">
        <div className="w-full max-w-2xl mx-auto bg-purple-predominant rounded-xl border-b-4 border-b-dark-shadow p-2 flex items-center gap-4 text-white">
            <Link to={`/${userType}s/classes`}>
              <X className="ml-2 h-5 w-5 text-white" />
            </Link>
            <div className="ml-4 flex-grow">
              <Link to={`/${userType}s/classes/${class_id}/info`}>
                {title ? (
                  <p className="cursor-pointer font-bold underline">{title.toUpperCase()}</p>
                ) : "..."}
                  
              </Link>
            </div>
            <Link to={`/${userType}s/classes/${class_id}/info`}>
              <Avatar className="mr-4 w-12 h-12">
                  <AvatarFallback className={`${getAvatarColor(class_id.toString())} text-white`}>{getInitials(title)}</AvatarFallback>
              </Avatar>
            </Link>
        </div>
    </div>
  );
}
