import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ClassItem from "@/components/class-item";
import ClassItemSkeleton from "@/components/class-item-skeleton";
import { verifyJWTToken } from "@/verifyJWTToken";
import { useNavigate } from "react-router-dom";
import api from "@/apiService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { X } from "lucide-react";

interface Class {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
}

export default function StudentsClasses() {
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [classIdSelected, setClassIdSelected] = useState("");
  const [enrolledClasses, setEnrolledClasses] = useState<Class[]>([]);
  const [otherClasses, setOtherClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isClassSelectedRegistered, setIsClassSelectedRegistered] = useState(false); 
  const [classTitleSelected, setClassTitleSelected] = useState(""); 

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("student", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
      const token = localStorage.getItem("JWTToken");
      setJwtToken(token);
    }
  }, [navigate]);

  useEffect(() => {
    if (decodedToken) {
      const fetchClasses = async () => {
        setLoading(true);
        try {
          const enrolledResponse = await api.get<any>(`/students/${decodedToken.id}/classes`,
            {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
              }
            }
          );
          if (enrolledResponse.data.success) {
            setEnrolledClasses(enrolledResponse.data.classes);
          }

          const allClassesResponse = await api.get<any>('/classes',
            {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
              }
            }
          );
          if (allClassesResponse.data.success) {
            const allClasses = allClassesResponse.data.classes;
            let filteredOtherClasses;
            if(enrolledResponse.data.success) {
              const enrolledIds = new Set(enrolledResponse.data.classes.map((c: Class) => c.id));
              filteredOtherClasses = allClasses.filter((c: Class) => !enrolledIds.has(c.id));
            } else {
              filteredOtherClasses = allClasses;
            }
            setOtherClasses(filteredOtherClasses);
          }

        } catch (error) {
          console.error("Error fetching classes:", error);
          toast.error("Erro ao buscar as turmas. Tente novamente.");
        } finally {
          setLoading(false);
        }
      };

      fetchClasses();
    }
  }, [decodedToken, jwtToken]);

  async function handleMakeEnrollmentClass(){
    try {
      if (!decodedToken) {
        toast.error("Sessão expirada. Faça login novamente.");
        navigate('/login');
        return;
      }
      const response = await api.post<any>(`/classes/${classIdSelected}/enroll`,
        {
          student_id: decodedToken.id
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("Matrícula realizada com sucesso!");
        navigate(`/students/classes/${classIdSelected}`);
      } else {
        toast.error(response.data.message || "Erro ao se matricular na turma.");
      }

    } catch (error: any) {
      console.error("Error enrolling in class:", error);
      if (error.response && error.response.status === 409) {
        toast.warning("Você já está matriculado nesta turma.");
        navigate(`/students/classes/${classIdSelected}`);
      } else {
        toast.error("Erro ao se matricular na turma. Verifique o código e tente novamente.");
      }
    }
  }

  async function handleJoinClass() {
    if (!classIdSelected) {
      toast.error("Por favor, selecione uma turma para entrar.");
      return;
    }

    if (isClassSelectedRegistered) { 
      navigate(`/students/classes/${classIdSelected}`);
      return;
    }

    setOpen(true);
  }

  async function handleLogout() {
    localStorage.removeItem("JWTToken");
    toast.success("Logged out successfully.");
    navigate("/login");
  }

  return (
    <div className="min-h-screen">
      <div className="w-full">
        <div className="fixed top-0 left-0 right-0 z-50 bg-background text-center border-b-2 dark:border-b-gray-800 white:border-b-gray-400">
         <div className="w-full max-w-2xl mx-auto p-4 flex items-center gap-8">
            <div className="flex-none cursor-pointer" onClick={() => handleLogout()}>
                <X className="text-[#AFAFAF]"/>
            </div>
            <div className="flex-grow flex justify-center w-full">
                <h1 className="font-nunito text-xl font-extrabold">Turmas</h1>
            </div>
             <div className="flex-none cursor-pointer invisible" onClick={() => handleLogout()}>
                <X className="text-[#AFAFAF]"/>
            </div>
        </div>
      </div>

        <div className="w-full max-w-2xl mx-auto pt-20 pb-20 p-6">
          <div className="w-full mx-auto">
            <div className="pt-4">
              <h2 className="font-nunito mb-4 text-2xl font-extrabold">Matriculado</h2>
              {loading ? (
                <>
                  <ClassItemSkeleton />
                  <ClassItemSkeleton />
                </>
              ) : (
                enrolledClasses.length > 0 ? (
                  enrolledClasses.map(c => (
                    <ClassItem id={c.id} key={c.id} classIdSelected={classIdSelected} title={c.title} userType="student" onSelect={(id) => {
                      setClassIdSelected(id);
                      setIsClassSelectedRegistered(true);
                      setClassTitleSelected(c.title);
                    }} registered={true} />
                  ))
                ) : (
                  <p className="text-center text-gray-500">Você não está matriculado em nenhuma turma.</p>
                )
              )}
            </div>
            <div className="pt-4">
              <h2 className="font-nunito mb-4 text-2xl font-extrabold">Outros</h2>
              {loading ? (
                <>
                  <ClassItemSkeleton />
                  <ClassItemSkeleton />
                  <ClassItemSkeleton />
                </>
              ) : (
                otherClasses.length > 0 ? (
                  otherClasses.map(c => (
                    <ClassItem id={c.id} key={c.id} classIdSelected={classIdSelected} title={c.title} userType="student" onSelect={(id) => {
                      setClassIdSelected(id);
                      setIsClassSelectedRegistered(false);
                      setClassTitleSelected(c.title);
                    }} registered={false} />
                  ))
                ) : (
                  <p className="text-center text-gray-500">Não há outras turmas disponíveis.</p>
                )
              )}
            </div>
          </div>

        </div>
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t-2 dark:border-t-gray-800 white:border-t-gray-400">
          <div className="w-full max-w-2xl mx-auto p-6">
            {classIdSelected ? (
              <Button className="w-full bg-purple-predominant border-b-4 border-b-dark-shadow p-6 font-nunito text-lg font-extrabold hover:bg-purple-600 dark:text-white" onClick={handleJoinClass}>ENTRAR</Button>
            ) : (
              <Button disabled className="w-full bg-grey-disabled border-b-4 text-text-secondary p-6 font-nunito text-lg font-extrabold" onClick={handleJoinClass}>ENTRAR</Button>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Você deseja se matricular nessa turma?</AlertDialogTitle>
              <AlertDialogDescription>
                  Ao aceitar, você vai ser adicionado como aluno da turma "{classTitleSelected}".
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleMakeEnrollmentClass()}>Matricular</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
