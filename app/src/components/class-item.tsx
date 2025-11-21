import { Avatar, AvatarFallback } from "./ui/avatar";
import getInitials from "@/getInitials";
import getAvatarColor from "@/getAvatarColor";

interface ClassItemProps {
  userType: 'teacher' | 'student';
  title: string;
  id: string;
  classIdSelected: string;
  onSelect?: (id: string) => void;
  registered: boolean;
}

export default function ClassItem({ id, classIdSelected, title, onSelect, registered }: ClassItemProps) {
  return (
    classIdSelected == id ? (
      <div className="w-full max-w-2xl border-2 border-blue-base bg-blue-ice dark:bg-blue-800 text-blue-base rounded-xl p-2 cursor-pointer flex items-center gap-4 mb-2">
        <Avatar className="w-12 h-12">
            <AvatarFallback className={`${getAvatarColor(id.toString())} text-white`}>{getInitials(title)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
            <p>{title}</p>
        </div>
      </div>
    ) : (
      <div onClick={() => onSelect?.(id)} className="w-full max-w-2xl border-2 dark:border-gray-800 rounded-xl p-2 cursor-pointer flex items-center gap-4 mb-2">
        <Avatar className="w-12 h-12">
            <AvatarFallback className={`${getAvatarColor(id.toString())} text-white`}>{getInitials(title)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
            <p>{title}</p>
        </div>
      </div>
    )
  );
}
