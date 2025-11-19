import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";

interface AddQuestionFillInTheBlankProps {
  suggestion: any;
  submitAction: 'stop' | 'continue' | 'update' | 'delete' | null;
  onFormSubmit: (data: any) => void;
}

export default function AddQuestionFillInTheBlank({ suggestion, submitAction, onFormSubmit }: AddQuestionFillInTheBlankProps) {
  const [statement, setStatement] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState([""]);
  const [wrongAnswers, setWrongAnswers] = useState([""]);

  useEffect(() => {
    if (suggestion) {
      setStatement(suggestion.statement || "");
      if (suggestion.correct_answers && suggestion.correct_answers.length > 0) {
        setCorrectAnswers(suggestion.correct_answers);
      }
      if (suggestion.wrong_answers && suggestion.wrong_answers.length > 0) {
        setWrongAnswers(suggestion.wrong_answers);
      }
    }
  }, [suggestion]);

  useEffect(() => {
    if (submitAction) {
      handleSubmit();
    }
  }, [submitAction]);

  const handleCorrectAnswerChange = (index: number, value: string) => {
    const newAnswers = [...correctAnswers];
    newAnswers[index] = value;
    setCorrectAnswers(newAnswers);
  };

  const addCorrectAnswer = () => {
    setCorrectAnswers([...correctAnswers, ""]);
  };

  const removeCorrectAnswer = (index: number) => {
    if (correctAnswers.length <= 1) {
      toast.error("A questão deve ter no mínimo 1 resposta correta.");
      return;
    }
    setCorrectAnswers(correctAnswers.filter((_, i) => i !== index));
  };

  const handleWrongAnswerChange = (index: number, value: string) => {
    const newAnswers = [...wrongAnswers];
    newAnswers[index] = value;
    setWrongAnswers(newAnswers);
  };

  const addWrongAnswer = () => {
    setWrongAnswers([...wrongAnswers, ""]);
  };

  const removeWrongAnswer = (index: number) => {
    setWrongAnswers(wrongAnswers.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!statement.trim()) {
      toast.error("O enunciado da questão não pode estar vazio.");
      onFormSubmit(null);
      return;
    }
    if (correctAnswers.some(ans => !ans.trim())) {
      toast.error("Todas as respostas corretas devem ser preenchidas.");
      onFormSubmit(null);
      return;
    }

    const finalCorrectAnswers = correctAnswers.map(ans => ans.trim()).filter(ans => ans !== "");
    const finalWrongAnswers = wrongAnswers.map(ans => ans.trim()).filter(ans => ans !== "");

    if (finalCorrectAnswers.length === 0) {
      toast.error("Deve haver pelo menos uma resposta correta.");
      onFormSubmit(null);
      return;
    }

    const formattedData = {
      statement: statement,
      correct_answers: finalCorrectAnswers,
      wrong_answers: finalWrongAnswers,
    };

    onFormSubmit(formattedData);
  };

  return (
    <div className="mt-6 pt-6">
      <h2 className="text-lg font-semibold mb-4">Preencha a Lacuna</h2>
      <div className="mb-4">
        <Label htmlFor="statement" className="font-bold">Enunciado da Questão</Label>
        <Textarea
          id="statement"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="Use _ para indicar onde a lacuna deve ser preenchida. Ex: A capital do Brasil é _."
          className="mt-2"
        />
      </div>

      <div className="mb-6">
        <Label className="font-bold">Respostas Corretas (na ordem das lacunas)</Label>
        {correctAnswers.map((answer, index) => (
          <div key={index} className="flex items-center gap-2 mb-2 mt-2">
            <Input
              value={answer}
              onChange={(e) => handleCorrectAnswerChange(index, e.target.value)}
              placeholder={`Resposta correta ${index + 1}`}
            />
            <Button variant="outline" size="icon" onClick={() => removeCorrectAnswer(index)} disabled={correctAnswers.length <= 1} className="group">
              <Trash2 className="text-[#AFAFAF] group-hover:text-red-500"/>
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addCorrectAnswer} className="mt-2 w-full">
           <Plus className="h-4 w-4 mr-2" />
          Adicionar Resposta Correta
        </Button>
      </div>

      <div>
        <Label className="font-bold">Palavras para confundir (respostas incorretas)</Label>
        {wrongAnswers.map((answer, index) => (
          <div key={index} className="flex items-center gap-2 mb-2 mt-2">
            <Input
              value={answer}
              onChange={(e) => handleWrongAnswerChange(index, e.target.value)}
              placeholder={`Resposta incorreta ${index + 1}`}
            />
            <Button variant="outline" size="icon" onClick={() => removeWrongAnswer(index)} className="group">
              <Trash2 className="text-[#AFAFAF] group-hover:text-red-500"/>
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addWrongAnswer} className="mt-2 w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Resposta Incorreta
        </Button>
      </div>
    </div>
  );
}
