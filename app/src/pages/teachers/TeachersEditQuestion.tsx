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

import { Trash2 } from "lucide-react";

function transformDataForComponent(questionType: string, data: any): any {
    if (!data) {
        return null;
    }

    switch (questionType) {
        case 'multiple-choice': {
            const options = Array.isArray(data.options) ? data.options.map((opt: any) => {
                return {
                    label: opt.label || opt.text || '',
                    is_correct: opt.is_correct || false,
                };
            }) : [];

            return {
                statement: data.statement || data.prompt || '',
                options: options,
            };
        }
        case 'fill-in-the-blank': {
            const correct_answers = Array.isArray(data.correct_answers) ? data.correct_answers : [];
            const wrong_answers = Array.isArray(data.wrong_answers) ? data.wrong_answers : [];

            return {
                statement: data.statement || data.prompt_template || '',
                correct_answers: correct_answers,
                wrong_answers: wrong_answers,
            };
        }
        case 'matching-pairs': {
            const pairs = Array.isArray(data.pairs) ? data.pairs.map((p: any) => {
                return {
                    label: p.label || p.prompt || '',
                    answer: p.answer || '',
                };
            }) : [];

            return {
                statement: data.statement || data.prompt || '',
                pairs: pairs,
            };
        }
        default:
            return data;
    }
}

export default function TeachersEditQuestion() {
  const { class_id, question_id } = useParams<{ class_id: string; question_id: string }>();
  const [questionType, setQuestionType] = useState<string | null>(null)
  const [questionData, setQuestionData] = useState<any | null>(null);
  const [transformedData, setTransformedData] = useState<any | null>(null);
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<'update' | 'delete' | null>(null);
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

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
      if (question_id && token) {
        fetchQuestionData(question_id, token);
      }
    }
  }, [navigate, question_id]);

  async function fetchQuestionData(id: string, token: string) {
    setIsLoading(true);
    try {
      const response = await api.get<any>(`/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 && response.data) {
        const fetchedQuestion = response.data.question;
        setQuestionData(fetchedQuestion);
        
        let frontendType = '';
        switch (fetchedQuestion.type) {
          case 'QUESTIONS_MULTIPLE_CHOICE':
            frontendType = 'multiple-choice';
            break;
          case 'QUESTIONS_FILL_IN_THE_BLANK':
            frontendType = 'fill-in-the-blank';
            break;
          case 'QUESTIONS_MATCHING_PAIRS':
            frontendType = 'matching-pairs';
            break;
        }
        setQuestionType(frontendType);
        const transformed = transformDataForComponent(frontendType, fetchedQuestion.data);
        setTransformedData(transformed);
      } else {
        toast.error("Failed to fetch question data.");
        navigate(`/teachers/classes/${class_id}`);
      }
    } catch (error: any) {
      console.error("Error fetching question data:", error);
      toast.error(error.response?.data?.error || "An error occurred while fetching the question.");
      navigate(`/teachers/classes/${class_id}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateQuestion(formData: any) {
    if (!questionType || submitAction !== 'update') {
      resetSubmitAction();
      return;
    }

    if (!formData) {
      toast.error("Por favor, preencha todos os campos da questão.");
      resetSubmitAction();
      return;
    }

    let backendQuestionType: string;
    switch (questionType) {
      case 'multiple-choice':
        backendQuestionType = 'QUESTIONS_MULTIPLE_CHOICE';
        break;
      case 'fill-in-the-blank':
        backendQuestionType = 'QUESTIONS_FILL_IN_THE_BLANK';
        break;
      case 'matching-pairs':
        backendQuestionType = 'QUESTIONS_MATCHING_PAIRS';
        break;
      default:
        toast.error("Tipo de questão inválido.");
        resetSubmitAction();
        return;
    }

    const requestBody = {
      class_id: class_id,
      type: backendQuestionType,
      data: formData,
    };

    setIsSubmitting(true);
    try {
      const response = await api.put<any>(`/questions/${question_id}`, requestBody, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (response.status === 200) {
        toast.success("Questão atualizada com sucesso!");
        navigate(`/teachers/classes/${class_id}`);
      }
    } catch (error: any) {
      console.error("Erro ao atualizar questão:", error);
      const errorData = error.response?.data;
      if (errorData?.details?.fieldErrors) {
        const fieldErrors = errorData.details.fieldErrors;
        const firstErrorKey = Object.keys(fieldErrors)[0];
        const errorMessage = fieldErrors[firstErrorKey]?.[0];
        if (errorMessage) {
          toast.error(`Erro: ${errorMessage}`);
        } else {
          toast.error(errorData.error || "Dados da questão inválidos.");
        }
      } else {
        toast.error(errorData?.message || "Ocorreu um erro ao atualizar a questão.");
      }
    } finally {
      setIsSubmitting(false);
      resetSubmitAction();
    }
  }

  function handleExitQuestion(){
    navigate(`/teachers/classes/${class_id}`)
  }

  async function handleDeleteQuestion() {
    try {
      const response = await api.delete<any>(`/questions/${question_id}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (response.status === 200) {
        toast.success("Questão excluída com sucesso!");
        navigate(`/teachers/classes/${class_id}`);
      }
    } catch (error: any) {
      console.error("Erro ao excluir questão:", error);
      toast.error(error.response?.data?.error || "Ocorreu um erro ao excluir a questão.");
    }
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
             <div className="flex-none cursor-pointer" onClick={() => setOpenDelete(true)}>
                <Trash2 className="text-[#AFAFAF] hover:text-red-500"/>
            </div>
        </div>
      </div>

      <div className="font-nunito min-h-screen pt-20 p-2 max-w-2xl mx-auto pb-48 md:pb-28">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : questionType && transformedData ? (
          <div>
              {questionType === 'multiple-choice' ? (
                  <AddQuestionMultipleChoice suggestion={transformedData} submitAction={submitAction} onFormSubmit={handleUpdateQuestion} />
              ) : questionType === 'fill-in-the-blank' ? (
                  <AddQuestionFillInTheBlack suggestion={transformedData} submitAction={submitAction} onFormSubmit={handleUpdateQuestion} />
              ) : questionType === 'matching-pairs' ? (
                  <AddQuestionMatchingPairs suggestion={transformedData} submitAction={submitAction} onFormSubmit={handleUpdateQuestion} />
              ) : null}
          </div> 
        ) : null}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t-2 dark:border-t-gray-800 white:border-t-gray-400">
          <div className="w-full max-w-2xl mx-auto pb-2 mt-4 px-2">
            {questionType ? (
                <Button 
                    className="w-full bg-purple-predominant rounded-xl border-b-4 border-b-dark-shadow p-6 font-nunito text-base font-bold hover:bg-purple-600 dark:text-white" 
                    onClick={() => setSubmitAction('update')}
                    disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner/> : null}
                  EDITAR
                </Button>
            ) : (
                <Button 
                    className="w-full bg-grey-disabled border-b-4 text-text-secondary rounded-xl border-2 p-6 font-nunito text-base font-bold" 
                    disabled
                >
                    EDITAR
                </Button>
            )}
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

        <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza que quer excluir a questão?</AlertDialogTitle>
                <AlertDialogDescription>
                    Ao excluir, a questão será permanentemente removida.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteQuestion()}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}