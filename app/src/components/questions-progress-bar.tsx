import { X } from "lucide-react";
import { Progress } from "./ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "@/apiService";
import { verifyJWTToken } from "@/verifyJWTToken";

interface QuestionsProgressBarProps {
  class_id?: string;
  question_id?: string;
}

export default function QuestionsProgressBar({ class_id, question_id  }: QuestionsProgressBarProps) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("student", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
      const token = localStorage.getItem("JWTToken");
      setJwtToken(token);
      fetchProgress(token, decodedToken.id);
    }
  }, [class_id, question_id]);

  async function fetchProgress(token: string | null, studentId: string) {
    try {
      const [questionsResponse, answersResponse] = await Promise.all([
        api.get<any>(`/questions/class/${class_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get<any>(`/student/${studentId}/class/${class_id}/answers/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const totalQuestions = questionsResponse.data.questions.length;
      const answeredQuestions = answersResponse.data.answers.length;

      if (totalQuestions > 0) {
        const progressPercentage = (answeredQuestions / totalQuestions) * 100;
        setProgress(progressPercentage);
      }
    } catch (error) {
      console.error("Failed to fetch progress:", error);
    }
  }

  function handleExitQuestion(){
    navigate(`/students/classes/${class_id}`)
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
                <Progress value={progress} className="h-4" />
            </div>
        </div>
    </div>
  );
}
