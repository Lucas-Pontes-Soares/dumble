import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import ClassItem from "@/components/class-item";
import ClassItemSkeleton from "@/components/class-item-skeleton";
import { verifyJWTToken } from "@/verifyJWTToken";
import { useNavigate } from "react-router-dom";

export default function StudentsClasses() {
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState("");
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("student", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
    }
  }, [navigate]);

  async function handleJoinClass() {
    if (!classId) {
      toast.error("Por favor, informe o código da turma.");
      return;
    }

    console.log("opa");
    setClassId("")
    setOpen(false);
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="w-full">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">Turmas do Estudante</h1>
          <Button variant="outline" onClick={() => setOpen(true)} className="mx-auto">
            <Plus className="mr-2 h-4 w-4" />
            Entrar em Turma

          </Button>
          <p className="text-gray-500">Peça ao seu professor, o código da turma. </p>
          <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Entrar em uma Turma</DialogTitle>
                  <DialogDescription>
                    Informe o código da turma que você deseja entrar.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="classId">Código</Label>
                    <Input
                      id="classId"
                      name="classId"
                      placeholder="DS-1234"
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Fechar</Button>
                  </DialogClose>
                  <Button onClick={() => handleJoinClass()}>Entrar</Button>
                </DialogFooter>
              </DialogContent>
          </Dialog>
        </div>
        <div className="w-full max-w-2xl mt-4">

          <p className="text-gray-500 text-center">Clique na turma para acessar</p>

          <div className="w-full mx-auto mt-4">
            <ClassItem acronym="ED" title="Estrutura de Dados" code="ED-1234" userType="student"/>

            <ClassItemSkeleton />
          </div>

        </div>
      </div>
    </div>
  );
}
