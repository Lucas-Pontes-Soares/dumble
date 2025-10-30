import { X } from "lucide-react";
import { Progress } from "./ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useState } from "react";
import { useNavigate } from "react-router";

interface QuestionsProgressBarProps {
  class_id?: string;
}

export default function QuestionsProgressBar({ class_id }: QuestionsProgressBarProps) {
  const [open, setOpen] = useState(false);

  const navigateTo = useNavigate();

  function handleExitQuestion(){
    navigateTo(`/students/classes/${class_id}`)
  }
  return (
     <div className="fixed top-0 left-0 right-0 z-50 bg-background p-4 pb-0">
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza que quer sair?</AlertDialogTitle>
                <AlertDialogDescription>
                    Ao sair você vai parar de responder essa questão, mas pode voltar a hora que quiser!
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleExitQuestion()}>Sair</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <div className="w-full max-w-2xl mx-auto p-4 flex items-center gap-8">
            <div className="flex-none cursor-pointer" onClick={() => setOpen(true)}>
                <X className="text-[#AFAFAF]"/>
            </div>
            <div className="flex-grow flex justify-center w-full">
                <Progress value={20} className="h-4" />
            </div>
        </div>
    </div>
  );
}
