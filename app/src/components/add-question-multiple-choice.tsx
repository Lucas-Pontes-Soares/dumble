import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";

export default function AddQuestionMultipleChoice({ suggestion, submitAction, onFormSubmit }: { suggestion?: any, submitAction: string | null, onFormSubmit: () => void }) {
  const [statement, setStatement] = useState("");
  const [correctAlternative, setCorrectAlternative] = useState("");
  const [alternatives, setAlternatives] = useState([
    { id: "A", text: "" },
    { id: "B", text: "" },
    { id: "C", text: "" },
    { id: "D", text: "" },
  ]);

  const navigateTo = useNavigate();

  useEffect(() => {
    if (suggestion) {
      setStatement(suggestion.statement || "");
      setAlternatives([
        { id: "A", text: suggestion.alternative_a || "" },
        { id: "B", text: suggestion.alternative_b || "" },
        { id: "C", text: suggestion.alternative_c || "" },
        { id: "D", text: suggestion.alternative_d || "" },
      ]);
      if (suggestion.correct_alternative) {
        const correctMap: { [key: string]: string } = {
          "alternative_a": "option-A",
          "alternative_b": "option-B",
          "alternative_c": "option-C",
          "alternative_d": "option-D",
        };
        setCorrectAlternative(correctMap[suggestion.correct_alternative]);
      }
    }
  }, [suggestion]);

  useEffect(() => {
    if (submitAction) {
      handleSubmit(submitAction);
    }
  }, [submitAction]);

  function handleAlternativeChange(id: string, newText: string) {
    setAlternatives((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((alt) => alt.id === id);
      if (index !== -1) {
        updated[index] = { ...updated[index], text: newText };
      }
      return updated;
    });
  }

  const handleSubmit = (action: string) => {
    console.log(`Creating question with action: ${action}`, { statement, alternatives, correctAlternative });

    // Reset form
    setStatement("");
    setAlternatives([
        { id: "A", text: "" },
        { id: "B", text: "" },
        { id: "C", text: "" },
        { id: "D", text: "" },
    ]);
    setCorrectAlternative('');

    if (action === 'stop') {
      navigateTo('/teachers/classes/1/');
    }

    onFormSubmit();
  };

  return (
    <div>
      <div className="mt-4 p-4 dark:bg-neutral-900 rounded-md border-1 dark:border-neutral-700">
        <Label className="mb-2">Enunciado:</Label>
        <Textarea
          id="statement"
          placeholder="Informe o Enunciado"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          className="h-32"
        />

        <Label className="mt-4 mb-2">Faça as Alternativas e marque a correta:</Label>
        <RadioGroup
          value={correctAlternative}
          onValueChange={setCorrectAlternative}
          className="mt-4"
        >

          <Label
            htmlFor="option-A"
            className={`border rounded-md p-4 w-full cursor-pointer flex items-center gap-4 ${correctAlternative === 'option-A' ? 'border-purple-predominant' : ''}`}
          >
            <RadioGroupItem
              value="option-A"
              id="option-A"
              className="hidden"
            />
            <div className={`rounded-full w-10 h-9 flex items-center justify-center text-sm font-bold text-white ${correctAlternative === 'option-A' ? 'bg-purple-predominant' : 'bg-gray-400'}`}>
              A
            </div>
            <Input
              type="text"
              placeholder="Texto Alternativa A"
              value={alternatives[0].text}
              onChange={(e) => handleAlternativeChange("A", e.target.value)}
            />
          </Label>

          <Label
            htmlFor="option-B"
            className={`border rounded-md p-4 w-full cursor-pointer flex items-center gap-4 ${correctAlternative === 'option-B' ? 'border-purple-predominant' : ''}`}
          >
            <RadioGroupItem
              value="option-B"
              id="option-B"
              className="hidden"
            />
            <div className={`rounded-full w-10 h-9 flex items-center justify-center text-sm font-bold text-white ${correctAlternative === 'option-B' ? 'bg-purple-predominant' : 'bg-gray-400'}`}>
              B
            </div>
            <Input
              type="text"
              placeholder="Texto Alternativa B"
              value={alternatives[1].text}
              onChange={(e) => handleAlternativeChange("B", e.target.value)}
            />
          </Label>

          <Label
            htmlFor="option-C"
            className={`border rounded-md p-4 w-full cursor-pointer flex items-center gap-4 ${correctAlternative === 'option-C' ? 'border-purple-predominant' : ''}`}
          >
            <RadioGroupItem
              value="option-C"
              id="option-C"
              className="hidden"
            />
            <div className={`rounded-full w-10 h-9 flex items-center justify-center text-sm font-bold text-white ${correctAlternative === 'option-C' ? 'bg-purple-predominant' : 'bg-gray-400'}`}>
              C
            </div>
            <Input
              type="text"
              placeholder="Texto Alternativa C"
              value={alternatives[2].text}
              onChange={(e) => handleAlternativeChange("C", e.target.value)}
            />
          </Label>

          <Label
            htmlFor="option-D"
            className={`border rounded-md p-4 w-full cursor-pointer flex items-center gap-4 ${correctAlternative === 'option-D' ? 'border-purple-predominant' : ''}`}
          >
            <RadioGroupItem
              value="option-D"
              id="option-D"
              className="hidden"
            />
            <div className={`rounded-full w-10 h-9 flex items-center justify-center text-sm font-bold text-white ${correctAlternative === 'option-D' ? 'bg-purple-predominant' : 'bg-gray-400'}`}>
              D
            </div>
            <Input
              type="text"
              placeholder="Texto Alternativa D"
              value={alternatives[3].text}
              onChange={(e) => handleAlternativeChange("D", e.target.value)}
            />
          </Label>

        </RadioGroup>
      </div>
      

    </div>

  );
}
