import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ClassItem from "@/components/class-item";
import ClassItemSkeleton from "@/components/class-item-skeleton";
import { verifyJWTToken } from "@/verifyJWTToken";
import { useNavigate } from "react-router-dom";

export default function StudentsClasses() {
  const [open, setOpen] = useState(false);
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [classIdSelected, setClassIdSelected] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("student", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
    }
  }, [navigate]);

  async function handleJoinClass() {
    if (!classIdSelected) {
      toast.error("Por favor, informe o código da turma.");
      return;
    }

    console.log(`opa ${classIdSelected}`);
    setClassIdSelected("")
    setOpen(false);

    navigate("/students/classes/1")
  }

  return (
    <div className="min-h-screen">
      <div className="w-full">
        <div className="fixed top-0 left-0 right-0 z-50 bg-background space-y-4 pt-4 pb-2 text-center border-b-2 dark:border-b-gray-800 white:border-b-gray-400">
          <h1 className="font-nunito text-xl font-extrabold">Turmas</h1> 
        </div>
        <div className="w-full max-w-2xl mx-auto pt-20 pb-20 p-6">
          <div className="w-full mx-auto">
            <div className="pt-4">
              <h2 className="font-nunito mb-4 text-2xl font-extrabold">Matriculado</h2>
              <ClassItem acronym="ED" id="1" classIdSelected={classIdSelected} title="Estrutura de Dados" userType="student" onSelect={(id) => setClassIdSelected(id)} registered={true}/>

              <ClassItemSkeleton />
            </div>
            <div className="pt-4">
              <h2 className="font-nunito mb-4 text-2xl font-extrabold">Outros</h2>
              <ClassItem acronym="ED" id="2" classIdSelected={classIdSelected} title="Estrutura de Dados" userType="student" onSelect={(id) => setClassIdSelected(id)} registered={false}/>

              <ClassItem acronym="ED" id="3" classIdSelected={classIdSelected} title="Estrutura de Dados" userType="student" onSelect={(id) => setClassIdSelected(id)} registered={false}/>

              <ClassItemSkeleton />
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
    </div>
  );
}
