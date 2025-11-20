import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import ClassItem from "@/components/class-item";
import ClassItemSkeleton from "@/components/class-item-skeleton";
import { verifyJWTToken } from "@/verifyJWTToken";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/apiService";

interface Class {
  id: string;
  title: string;
  description: string;
}

export default function TeachersClasses() {
  const [open, setOpen] = useState(false);
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [className, setClassName] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [classIdSelected, setClassIdSelected] = useState(""); 

  const navigate = useNavigate();

  useEffect(() => {
    const decoded = verifyJWTToken("teacher", navigate);
    if (decoded) {
      setDecodedToken(decoded);
      const token = localStorage.getItem("JWTToken");
      setJwtToken(token);
    }
  }, [navigate]);
  
  const fetchClasses = useCallback(async () => {
    if (!decodedToken || !jwtToken) return;
    setLoading(true);
    try {
      const response = await api.get<any>(`teachers/${decodedToken.id}/classes`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (response.data.success) {
        setTeacherClasses(response.data.classes);
      }
    } catch (error) {
      console.error("Error fetching teacher classes:", error);
      toast.error("Erro ao buscar suas turmas.");
    } finally {
      setLoading(false);
    }
  }, [decodedToken, jwtToken]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  async function handleJoinClass() {
    if (!classIdSelected) {
      toast.error("Por favor, selecione uma turma para entrar.");
      return;
    }
    navigate(`/teachers/classes/${classIdSelected}`);
  }

  async function handleAddClass() {
    if (!className || !classDescription || !decodedToken || !jwtToken) {
      toast.error("Por favor, informe todos os campos.");
      return;
    }

    try {
      const response = await api.post<any>('/classes', {
        title: className,
        description: classDescription,
        teacher_id: decodedToken.id,
      }, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      if (response.data.success) {
        toast.success("Turma criada com sucesso!");
        setClassName("");
        setClassDescription("");
        setOpen(false);
        fetchClasses(); // Refresh list after adding
      } else {
        toast.error(response.data.message || "Erro ao criar turma.");
      }
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error("Erro ao criar turma. Tente novamente.");
    }
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-nunito text-2xl font-extrabold">Criadas</h2>
                <Button variant="outline" onClick={() => setOpen(true)} >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Turma
                </Button>
              </div>

              {loading ? (
                <>
                  <ClassItemSkeleton />
                  <ClassItemSkeleton />
                </>
              ) : (
                teacherClasses.length > 0 ? (
                  teacherClasses.map((c) => (
                    <ClassItem 
                      key={c.id} 
                      id={c.id} 
                      classIdSelected={classIdSelected} 
                      title={c.title} 
                      userType="teacher" 
                      registered={true}
                      onSelect={(id) => setClassIdSelected(id)} // Re-added onSelect
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-500">Você ainda não criou nenhuma turma.</p>
                )
              )}
            </div>
          </div>
        </div>
        
        {/* Re-added bottom bar */}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Turma</DialogTitle>
            <DialogDescription>
              Informe os dados para criar a nova turma.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="className">Nome</Label>
              <Input
                id="className"
                name="className"
                placeholder="Ex: Integração e Entrega Contínua"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="classDescription">Descrição</Label>
              <Textarea
                id="classDescription"
                name="classDescription"
                placeholder="Ex: Práticas de CI/CD com GitHub Actions"
                value={classDescription}
                onChange={(e) => setClassDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
            <Button onClick={handleAddClass}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
