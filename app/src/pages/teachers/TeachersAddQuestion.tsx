import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import AddQuestionMultipleChoice from "@/components/add-question-multiple-choice"
import AddQuestionFillInTheBlack from "@/components/add-question-fill-in-the-blank"
import AddQuestionMatchingPairs from "@/components/add-question-matching-pairs"
import { useNavigate, useParams } from "react-router"
import { verifyJWTToken } from "@/verifyJWTToken";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WandSparklesIcon, X } from "lucide-react";
import api from "@/apiService";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function TeachersAddQuestion() {
  const [questionType, setQuestionType] = useState<string | null>(null)
  const { class_id } = useParams<{ class_id: string }>();
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [suggestion, setSuggestion] = useState<any | null>(null);
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

  async function handleCreateSuggestion(){
    setIsLoading(true);
    setSuggestion(null);

    try {
      const response = await api.post<any>(`/suggestions/`, 
        { 
          class_id: class_id,
          content: prompt,
          question_type: questionType ? questionType : 'none',
        },
        { 
          headers: {                                                                         
              Authorization: `Bearer ${jwtToken}`,                                                
          }, 
        }
      );

      if (response.data.success === false) {
        toast.error("Error creating suggestion.");
        return;
      }

      let suggestionString = response.data.suggestion;
      
      const firstBrace = suggestionString.indexOf('{');
      const lastBrace = suggestionString.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
        toast.error("Invalid suggestion format from AI.");
        return;
      }

      suggestionString = suggestionString.substring(firstBrace, lastBrace + 1);

      const suggestionData = JSON.parse(suggestionString);
      
      setQuestionType(suggestionData.question_type);
      setSuggestion(suggestionData.suggestion);
    } catch (error: any) {
      console.error("Erro na requisição:", error);
      if (error instanceof SyntaxError) {
        toast.error("Falha ao processar a sugestão da IA. Tente novamente.");
      } else {
        toast.error(error.response?.data?.message || "Ocorreu um erro.");
      }
    } finally {
      setIsLoading(false);
    }
  }

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
                <h1 className="font-nunito text-xl font-extrabold">Adicionar Questão</h1>
            </div>
             <div className="flex-none cursor-pointer invisible" onClick={() => setOpen(true)}>
                <X className="text-[#AFAFAF]"/>
            </div>
        </div>
      </div>

      <div className="font-nunito min-h-screen pt-20 p-2 max-w-2xl mx-auto pb-48 md:pb-28">
        <div className="mt-4 rounded-md">
          <Label className="mb-2" >Informe o tipo de Questão</Label>
          <Select onValueChange={(value) => setQuestionType(value)} value={questionType || ''}>
              <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o tipo de questão" />
              </SelectTrigger>
              <SelectContent>
              <SelectGroup>
                  <SelectLabel>Tipos de Questão</SelectLabel>
                  <SelectItem value="multiple-choice">Múltipla Escolha</SelectItem>
                  <SelectItem value="fill-in-the-blank">Preencha a Lacuna</SelectItem>
                  <SelectItem value="matching-pairs">Pares Correspondentes</SelectItem>
              </SelectGroup>
              </SelectContent>
          </Select>
        </div>

        <div className="mt-4 dark:bg-neutral-900 rounded-md dark:border-neutral-700">
          <Label className="pb-4"><WandSparklesIcon size={16}/>Gerar questão com IA</Label>
          <Textarea 
            className="min-h-[100px]" 
            placeholder="Descreva a ideia da sua pergunta. Exemplo: 'uma pergunta sobre probabilidade condicional'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            />
          <Button 
            className="mt-4 w-full bg-purple-predominant rounded-xl border-b-4 border-b-dark-shadow p-6 font-nunito text-base hover:bg-purple-600" 
            onClick={() => handleCreateSuggestion()}
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : <WandSparklesIcon />} Gerar questão com IA
          </Button>
        </div>

        {questionType ? (
          <div>
              {questionType === 'multiple-choice' ? (
                  <AddQuestionMultipleChoice suggestion={suggestion} submitAction={submitAction} onFormSubmit={resetSubmitAction} />
              ) : questionType === 'fill-in-the-blank' ? (
                  <AddQuestionFillInTheBlack suggestion={suggestion} submitAction={submitAction} onFormSubmit={resetSubmitAction} />
              ) : questionType === 'matching-pairs' ? (
                  <AddQuestionMatchingPairs suggestion={suggestion} submitAction={submitAction} onFormSubmit={resetSubmitAction} />
              ) : null}
          </div> 
        ) : null}

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t-2 dark:border-t-gray-800 white:border-t-gray-400">
        
          <div className="w-full max-w-2xl mx-auto pb-2 mt-4 px-2">
            {questionType ? (
              <div className="flex flex-col sm:flex-row justify-between">
                <Button 
                  className="bg-transparent text-purple-predominant rounded-xl border-2 p-6 font-nunito text-base font-bold hover:border-purple-600 hover:bg-transparent mb-2 sm:mb-0" 
                  onClick={() => setSubmitAction('stop')} 
                  variant={"outline"}
                >
                  Criar e Parar
                </Button>
                <Button 
                  className="bg-purple-predominant rounded-xl border-b-4 border-b-dark-shadow p-6 font-nunito text-base font-bold hover:bg-purple-600" 
                  onClick={() => setSubmitAction('continue')}
                >
                  Criar e Continuar
                </Button>
              </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between">
                <Button 
                  className="bg-grey-disabled border-b-4 text-text-secondary rounded-xl border-2 p-6 font-nunito text-base font-bold mb-2 sm:mb-0" 
                  disabled
                  variant={"outline"}
                >
                  Criar e Parar
                </Button>
                <Button 
                  className="bg-grey-disabled border-b-4 text-text-secondary rounded-xl border-2 p-6 font-nunito text-base font-bold" 
                  disabled
                >
                  Criar e Continuar
                </Button>
              </div>
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