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
import { WandSparklesIcon } from "lucide-react";
import api from "@/apiService";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function TeachersAddQuestion() {
  const [questionType, setQuestionType] = useState<string | null>(null)
  const { classCode } = useParams<{ classCode: string }>();
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [suggestion, setSuggestion] = useState<any | null>(null);

  const navigate = useNavigate();

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
          class_code: classCode,
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

  return (
    <div className="min-h-screen p-2 max-w-2xl mx-auto">
      <div className="mt-4 p-4 bg-neutral-900 rounded-md border-1 border-neutral-700">
        <Label className="mb-2" >Informe o tipo de Questão</Label>
        <Select onValueChange={(value) => setQuestionType(value)} value={questionType || ''}>
            <SelectTrigger className="w-[280px]">
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

      <div className="mt-4 p-4 bg-neutral-900 rounded-md border-1 border-neutral-700">
        <Label className="pb-4"><WandSparklesIcon size={16}/>Gerar questão com IA</Label>
        <Textarea 
          className="min-h-[100px]" 
          placeholder="Descreva a ideia da sua pergunta. Exemplo: 'uma pergunta sobre probabilidade condicional'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          />
        <Button 
          className="mt-4 w-full" 
          onClick={() => handleCreateSuggestion()}
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : <WandSparklesIcon />} Gerar questão com IA
        </Button>
      </div>

      {questionType ? (
        <div className="mt-4 p-4 bg-neutral-900 rounded-md border-1 border-neutral-700">
            {questionType === 'multiple-choice' ? (
                <AddQuestionMultipleChoice suggestion={suggestion} />
            ) : questionType === 'fill-in-the-blank' ? (
                <AddQuestionFillInTheBlack suggestion={suggestion} />
            ) : questionType === 'matching-pairs' ? (
                <AddQuestionMatchingPairs suggestion={suggestion} />
            ) : null}
        </div> 
      ) : null}
    </div>
  )
}