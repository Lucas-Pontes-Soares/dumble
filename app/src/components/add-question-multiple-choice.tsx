import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { Plus, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";

interface AddQuestionMultipleChoiceProps {
  suggestion: any;
  submitAction: 'stop' | 'continue' | 'update' | 'delete' | null;
  onFormSubmit: (data: any) => void;
}

export default function AddQuestionMultipleChoice({ suggestion, submitAction, onFormSubmit }: AddQuestionMultipleChoiceProps) {
  const [statement, setStatement] = useState("");
  const [options, setOptions] = useState([
    { label: "", is_correct: true },
    { label: "", is_correct: false },
  ]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);

  useEffect(() => {
    if (suggestion) {
      setStatement(suggestion.statement || "");
      if (suggestion.options && suggestion.options.length > 0) {
        setOptions(suggestion.options);
        const correctIndex = options.findIndex((opt: any) => opt.is_correct);
        setCorrectOptionIndex(correctIndex !== -1 ? correctIndex : 0);
      }
    }
  }, [suggestion]);

  useEffect(() => {
    if (submitAction) {
      handleSubmit();
    }
  }, [submitAction]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].label = value;
    setOptions(newOptions);
  };

  const handleCorrectOptionChange = (indexStr: string) => {
    const index = parseInt(indexStr, 10);
    setCorrectOptionIndex(index);
    setOptions(prevOptions => 
      prevOptions.map((opt, i) => ({ ...opt, is_correct: i === index }))
    );
  };

  const addOption = () => {
    setOptions([...options, { label: "", is_correct: false }]);
  };

  const removeOption = (indexToRemove: number) => {
    if (options.length <= 2) {
      toast.error("A questão deve ter no mínimo 2 opções.");
      return;
    }
    
    let newCorrectIndex = correctOptionIndex;
    if (indexToRemove === correctOptionIndex) {
      newCorrectIndex = 0;
    } else if (indexToRemove < correctOptionIndex) {
      newCorrectIndex--;
    }

    const newOptions = options.filter((_, i) => i !== indexToRemove);
    
    setOptions(newOptions.map((opt, i) => ({ ...opt, is_correct: i === newCorrectIndex })));
    setCorrectOptionIndex(newCorrectIndex);
  };

  const handleSubmit = () => {
    if (!statement.trim()) {
      toast.error("O enunciado da questão não pode estar vazio.");
      onFormSubmit(null);
      return;
    }
    if (options.some(opt => !opt.label.trim())) {
      toast.error("Todas as opções devem ter um enunciado.");
      onFormSubmit(null);
      return;
    }

    const formattedData = {
      statement: statement,
      options: options,
    };

    onFormSubmit(formattedData);
  };

  return (
    <div className="mt-6 pt-6">
      <h2 className="text-lg font-semibold mb-4">Múltipla Escolha</h2>
      <div className="mb-4">
        <Label htmlFor="statement" className="font-bold">Enunciado da Questão</Label>
        <Textarea
          id="statement"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="Ex: Qual a capital do Brasil?"
          className="mt-2"
        />
      </div>

      <Label className="font-bold">Opções (marque a correta)</Label>
      <RadioGroup value={correctOptionIndex.toString()} onValueChange={handleCorrectOptionChange} className="mt-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <RadioGroupItem value={index.toString()} id={`option-${index}`} />
            <Input
              value={option.label}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Opção ${index + 1}`}
            />
            <Button variant="outline" size="icon" onClick={() => removeOption(index)} disabled={options.length <= 2} className="group">
              <Trash2 className="text-[#AFAFAF] group-hover:text-red-500"/>
            </Button>
          </div>
        ))}
      </RadioGroup>

      <Button variant="outline" onClick={addOption} className="mt-2 w-full">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Opção
      </Button>
    </div>
  );
}