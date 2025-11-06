import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import getInitials from "@/getInitials";
import api from "@/apiService";
import React from "react";
import getAvatarColor from "@/getAvatarColor";

interface StudentPictureProps {
  picture?: string;
  student_name: string;
  className?: string;
  student_id: string;
}

export const StudentPicture: React.FC<StudentPictureProps> = ({
  picture,
  student_name,
  className,
  student_id: student_id,
}) => {
  const imageUrl = picture ? `${api.defaults.baseURL}/students/pictures/${picture}` : undefined;

  return (
    <Avatar className={className}>
      <AvatarImage src={imageUrl} alt={`@${student_name}`} />
      <AvatarFallback className={`${getAvatarColor(student_id)} text-white`}>{getInitials(student_name)}</AvatarFallback>
    </Avatar>
  );
};
