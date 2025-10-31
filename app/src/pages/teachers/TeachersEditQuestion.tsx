import { useEffect, useState } from "react";
import AddQuestionMultipleChoice from "@/components/add-question-multiple-choice"
import AddQuestionFillInTheBlack from "@/components/add-question-fill-in-the-blank"
import AddQuestionMatchingPairs from "@/components/add-question-matching-pairs"
import { useNavigate, useParams } from "react-router"
import { verifyJWTToken } from "@/verifyJWTToken";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import api from "@/apiService";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function TeachersEditQuestion() {
  const [questionType, setQuestionType] = useState<string | null>(null)
  const { class_id } = useParams<{ class_id: string }>();
  const { question_id } = useParams<{ question_id: string }>();
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitAction, setSubmitAction] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const resetSubmitAction = () => {
    setSubmitAction(null);
  };

  useEffect(() => {
    const decodedToken = verifyJWTToken("teacher", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
      const token = localStorage.getItem("JWTToken");
      setJwtToken(token);
    }
  }, [navigate]);

  function handleExitQuestion(){
    navigate(`/teachers/classes/${class_id}`)
  }

  return (
    <div className="w-full">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background text-center border-b-2 dark:border-b-gray-800 white:border-b-gray-400">
         <div className="w-full max-w-2xl mx-auto p-4 flex items-center gap-8">
            <div className="flex-none cursor-pointer" onClick={() => setOpen(true)}>
                <X className="text-[#AFAFAF]"/>
            </div>
            <div className="flex-grow flex justify-center w-full">
                <h1 className="font-nunito text-xl font-extrabold">Editar Questão</h1>
            </div>
             <div className="flex-none cursor-pointer invisible" onClick={() => setOpen(true)}>
                <X className="text-[#AFAFAF]"/>
            </div>
        </div>
      </div>

      <div className="font-nunito min-h-screen pt-20 p-2 max-w-2xl mx-auto pb-48 md:pb-28">
        {question_id ? (
          <div>
              {question_id === '2' ? (
                  <AddQuestionMultipleChoice submitAction={submitAction} onFormSubmit={resetSubmitAction} />
              ) : question_id === '3' ? (
                  <AddQuestionFillInTheBlack submitAction={submitAction} onFormSubmit={resetSubmitAction} />
              ) : question_id === '1' ? (
                  <AddQuestionMatchingPairs submitAction={submitAction} onFormSubmit={resetSubmitAction} />
              ) : null}
          </div> 
        ) : null}

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t-2 dark:border-t-gray-800 white:border-t-gray-400">
        
          <div className="w-full max-w-2xl mx-auto pb-2 mt-4 px-2">
            {question_id === '1' ? (
                <Button 
                    className="w-full bg-purple-predominant rounded-xl border-b-4 border-b-dark-shadow p-6 font-nunito text-base font-bold hover:bg-purple-600" 
                    onClick={() => setSubmitAction('continue')}
                >
                    Editar
                </Button>
            ) : (
                <Button 
                    className="w-full bg-grey-disabled border-b-4 text-text-secondary rounded-xl border-2 p-6 font-nunito text-base font-bold" 
                    disabled
                >
                    Editar
                </Button>
            )}
          </div>
      </div>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza que quer sair?</AlertDialogTitle>
                <AlertDialogDescription>
                    Ao sair, todas as alterações não salvas serão perdidas.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleExitQuestion()}>Sair</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}