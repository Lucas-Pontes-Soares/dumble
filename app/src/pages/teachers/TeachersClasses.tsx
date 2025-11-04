import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ClassItem from "@/components/class-item";
import ClassItemSkeleton from "@/components/class-item-skeleton";
import { verifyJWTToken } from "@/verifyJWTToken";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function TeachersClasses() {
  const [open, setOpen] = useState(false);
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [classIdSelected, setClassIdSelected] = useState("");
  const [className, setClassName] = useState("");
  const [classDescription, setClassDescription] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("teacher", navigate);
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

    navigate("/teachers/classes/1")
  }

  async function handleAddClass() {
    if (!className || !classDescription) {
      toast.error("Por favor, informe todos os campos.");
      return;
    }

    setClassName("");
    setClassDescription("");
    setOpen(false);
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-nunito text-2xl font-extrabold">Criadas</h2>
                <Button variant="outline" onClick={() => setOpen(true)} >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Turma
                </Button>
              </div>
          
              <ClassItem acronym="ED" id="1" classIdSelected={classIdSelected} title="Estrutura de Dados" userType="student" onSelect={(id) => setClassIdSelected(id)} registered={true}/>

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
                placeholder="Integracao e Entrega Continua"
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
                placeholder="Aplicação Integracao e Entrega Continua"
                value={classDescription}
                onChange={(e) => setClassDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
            <Button onClick={() => handleAddClass()}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
    </div>
  );
}
