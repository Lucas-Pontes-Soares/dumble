import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import getInitials from "@/getInitials";
import api from "@/apiService";
import React from "react";
import getAvatarColor from "@/getAvatarColor";

interface TeacherPictureProps {
  picture?: string;
  teacher_name: string;
  className?: string;
  teacher_id: string;
}

export const TeacherPicture: React.FC<TeacherPictureProps> = ({
  picture,
  teacher_name,
  className,
  teacher_id
}) => {
  const imageUrl = picture ? `${api.defaults.baseURL}/teachers/pictures/${picture}` : undefined;

  return (
    <Avatar className={className}>
      <AvatarImage src={imageUrl} alt={`@${teacher_name}`} />
      <AvatarFallback className={`${getAvatarColor(teacher_id)} text-white`}>{getInitials(teacher_name)}</AvatarFallback>
    </Avatar>
  );
};
