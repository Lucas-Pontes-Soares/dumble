import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import ClassItemSkeleton from "@/components/class-item-skeleton";
import ClassItem from "@/components/class-item";
import { useNavigate } from "react-router";
import { verifyJWTToken } from "@/verifyJWTToken";

export default function TeachersClasses() {
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [classAcronym, setClassAcronym] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("teacher", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
    }
  }, [navigate]);

  async function handleAddClass() {
    if (!className || !classAcronym || !classDescription) {
      toast.error("Por favor, informe todos os campos.");
      return;
    }

    setClassName("");
    setClassAcronym("");
    setClassDescription("");
    setOpen(false);
  }

  return (
  <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="w-full">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">Turmas do Professor</h1>

          <Button variant="outline" onClick={() => setOpen(true)} >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Turma

          </Button>

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
                    <Label htmlFor="classAcronym">Sigla</Label>
                    <Input
                      id="classAcronym"
                      name="classAcronym"
                      placeholder="DEVOPS"
                      value={classAcronym}
                      onChange={(e) => setClassAcronym(e.target.value)}
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
          <div className="w-full max-w-2xl mt-4">
          
            <p className="text-gray-500 text-center">Clique na turma para acessar</p>

            <div className="w-full mx-auto mt-4">
              <ClassItem acronym="ED" title="Estrutura de Dados" code="ED-1234" userType="teacher"/>

              <ClassItemSkeleton />
            </div>
          </div>
        </div>
    </div>
  );
}
