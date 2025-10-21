import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StudentsDataTable } from "../../components/students-data-table";
import { columns, Students } from "../../components/students-columns";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { verifyJWTToken } from "@/verifyJWTToken";
import api from "@/apiService";
import getInitials from "@/getInitials";

interface Teacher {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
}

interface ClassInfo {
  id: string;
  title: string;
  code: string;
  description: string;
}

export default function StudentsClassInfo() {
  const [students, setStudents] = useState<Students[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const { classCode } = useParams<{ classCode: string }>();
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("student", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
      const token = localStorage.getItem("JWTToken");
      setJwtToken(token);
      getClassInfo(token);
    }
  }, [navigate]);

  async function getClassInfo(token: string | null) {
    try {
      // Fetch teacher and class info
      const teacherResponse = await api.get<any>(`/classes/${classCode}/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (teacherResponse.data.success) {
        setTeacher(teacherResponse.data.teacher);
        setClassInfo(teacherResponse.data.class);
      }

      // Fetch students
      const studentsResponse = await api.get<any>(`/classes/${classCode}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (studentsResponse.data.success) {
        const formattedStudents = studentsResponse.data.students.map((student: any) => ({
          id: student.id,
          avatar: student.avatar_url,
          name: student.name,
          email: student.email,
          enrollmentDate: new Date(student.created_at).toLocaleDateString(),
        }));
        setStudents(formattedStudents);
      }
    } catch (error) {
      console.error("Error fetching class info:", error);
    }
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Informações da Sala</h1>
        {classInfo && (
            <div className="py-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-32 w-32">
                        <AvatarFallback className="bg-amber-500 text-white text-4xl">{getInitials(classInfo.title)}</AvatarFallback>
                    </Avatar>
                    <div className="w-full space-y-2">
                        <p className="mb-2">{classInfo.title} - <span className="text-gray-600">{classInfo.code}</span></p>
                        <p className="">{classInfo.description}</p>
                    </div>
                </div>
            </div>
        )}
        {teacher && (
            <div className="py-4">
                <p className="py-4 text-xl font-bold">Professor:</p>
                <div className="w-full max-w-2xl border-2 dark:border-gray-800 white:border-gray-400 rounded-xl p-2 flex items-center gap-4 mb-2">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={teacher.avatar_url} />
                        <AvatarFallback className="bg-blue-500 text-white">{getInitials(teacher.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <p>{teacher.name}</p>
                        <p className="text-gray-600">{teacher.email}</p>
                    </div>
                </div>
            </div>
        )}

        <div className="py-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Alunos</h2>
                <span className="text-gray-600">Total de alunos: {students.length}</span>
            </div>
            <StudentsDataTable columns={columns} data={students} />
        </div>
    </div>
  );
}