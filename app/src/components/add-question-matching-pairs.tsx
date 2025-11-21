import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";

interface AddQuestionMatchingPairsProps {
  suggestion: any;
  submitAction: 'stop' | 'continue' | 'update' | 'delete' | null;
  onFormSubmit: (data: any) => void;
}

export default function AddQuestionMatchingPairs({ suggestion, submitAction, onFormSubmit }: AddQuestionMatchingPairsProps) {
  const [statement, setStatement] = useState("");
  const [pairs, setPairs] = useState([
    { label: "", answer: "" },
    { label: "", answer: "" },
  ]);

  useEffect(() => {
    if (suggestion) {
      setStatement(suggestion.statement || "");
      if (suggestion.pairs && suggestion.pairs.length > 0) {
        setPairs(suggestion.pairs);
      }
    }
  }, [suggestion]);

  useEffect(() => {
    if (submitAction) {
      handleSubmit();
    }
  }, [submitAction]);

  const handlePairChange = (index: number, field: 'label' | 'answer', value: string) => {
    const newPairs = [...pairs];
    newPairs[index][field] = value;
    setPairs(newPairs);
  };

  const addPair = () => {
    setPairs([...pairs, { label: "", answer: "" }]);
  };

  const removePair = (index: number) => {
    if (pairs.length <= 2) {
      toast.error("A questão deve ter no mínimo 2 pares.");
      return;
    }
    setPairs(pairs.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!statement.trim()) {
      toast.error("O enunciado da questão não pode estar vazio.");
      onFormSubmit(null);
      return;
    }
    if (pairs.some(p => !p.label.trim() || !p.answer.trim())) {
      toast.error("Todos os campos dos pares devem ser preenchidos.");
      onFormSubmit(null);
      return;
    }

    const formattedData = {
      statement: statement,
      pairs: pairs,
    };

    onFormSubmit(formattedData);
  };

  return (
    <div className="mt-6 pt-6">
      <h2 className="text-lg font-semibold mb-4">Pares Correspondentes</h2>
      
      <div className="mb-4">
        <Label htmlFor="statement" className="font-bold">Enunciado da Questão</Label>
        <Textarea
          id="statement"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="Ex: Relacione o país com a sua capital."
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-x-2">
        <Label className="font-bold">Item</Label>
        <Label className="font-bold">Correspondência</Label>
      </div>
      {pairs.map((pair, index) => (
        <div key={index} className="flex items-center gap-2 mb-2 mt-1">
          <Input
            value={pair.label}
            onChange={(e) => handlePairChange(index, 'label', e.target.value)}
            placeholder={`Item ${index + 1}`}
          />
          <Input
            value={pair.answer}
            onChange={(e) => handlePairChange(index, 'answer', e.target.value)}
            placeholder={`Correspondência ${index + 1}`}
          />
          <Button variant="outline" size="icon" onClick={() => removePair(index)} disabled={pairs.length <= 2} className="group">
            <Trash2 className="text-[#AFAFAF] group-hover:text-red-500"/>
          </Button>
        </div>
      ))}

      <Button variant="outline" onClick={addPair} className="mt-2 w-full">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Par
      </Button>
    </div>
  );
}
