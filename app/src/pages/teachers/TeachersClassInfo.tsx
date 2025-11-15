import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StudentsDataTable } from "../../components/students-data-table";
import { columns, Students } from "../../components/students-columns";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { verifyJWTToken } from "@/verifyJWTToken";
import api from "@/apiService";
import getInitials from "@/getInitials";
import TeachersNavigation from "@/components/teachers-navigation";
import CurrentClass from "@/components/current-class";
import { TeacherPicture } from "@/components/teacher-picture";
import getAvatarColor from "@/getAvatarColor";

export default function TeachersClassInfo() {
  const [students, setStudents] = useState<Students[]>([]);
  const [teacher, setTeacher] = useState<any>(null);
  const [classInfo, setClassInfo] = useState<any>(null);
  const { class_id } = useParams<{ class_id: string }>();
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("teacher", navigate);
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
      const teacherResponse = await api.get<any>(`/classes/${class_id}/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (teacherResponse.data.success) {
        setTeacher(teacherResponse.data.teacher);
        setClassInfo(teacherResponse.data.class);
      }

      // Fetch students
      const studentsResponse = await api.get<any>(`/classes/${class_id}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (studentsResponse.data.success) {
        const formattedStudents = studentsResponse.data.students.map((student: any) => ({
          id: student.id,
          picture: student.picture,
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
    <div className="font-nunito min-h-screen p-6 max-w-2xl mx-auto pb-24">
        <CurrentClass class_id={`${class_id}`} title={classInfo?.title} userType="teacher"/>
        <div className="mt-24">
          {classInfo && (
              <div className="py-4">
                  <div className="flex items-center gap-4">
                      <Avatar className="h-32 w-32">
                          <AvatarFallback className={`${getAvatarColor(classInfo.id.toString())} text-white`}>{getInitials(classInfo.title)}</AvatarFallback>
                      </Avatar>
                      <div className="w-full space-y-2">
                          <p className="mb-2">{classInfo.title}</p>
                          <p className="">{classInfo.description}</p>
                      </div>
                  </div>
              </div>
          )}
          {teacher && (
              <div className="py-4">
                  <p className="py-4 text-xl font-bold">Professor:</p>
                  <div className="w-full max-w-2xl border-2 dark:border-gray-800 white:border-gray-400 rounded-xl p-2 flex items-center gap-4 mb-2">
                      <TeacherPicture picture={teacher.picture} teacher_id={teacher.id} teacher_name={teacher.name} className="w-12 h-12" />
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
        <TeachersNavigation activePage="none"/>
    </div>
  );
}