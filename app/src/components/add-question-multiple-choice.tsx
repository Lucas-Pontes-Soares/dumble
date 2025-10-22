import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";

export default function AddQuestionMultipleChoice({ suggestion }: { suggestion: any }) {
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

  const handleCreateAndStop = () => {
        console.log("Criar e Parar", { alternatives });
        setAlternatives([
            { id: "A", text: "" },
            { id: "B", text: "" },
            { id: "C", text: "" },
            { id: "D", text: "" },
        ]);
        setCorrectAlternative('');
        setStatement('');
        navigateTo('/teachers/classes/1/')
    };

    const handleCreateAndContinue = () => {
        console.log("Criar e Continuar", { alternatives });
        setAlternatives([
            { id: "A", text: "" },
            { id: "B", text: "" },
            { id: "C", text: "" },
            { id: "D", text: "" },
        ]);
        setCorrectAlternative('');
        setStatement('');
    };

  return (
    <div>
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
          className={`border rounded-md p-4 w-full cursor-pointer flex items-center gap-4 ${correctAlternative === 'option-A' ? 'border-lime-400' : ''}`}
        >
          <RadioGroupItem
            value="option-A"
            id="option-A"
            className="hidden"
          />
          <div className={`rounded-full w-10 h-9 flex items-center justify-center text-sm font-bold text-white ${correctAlternative === 'option-A' ? 'bg-lime-500' : 'bg-gray-400'}`}>
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
          className={`border rounded-md p-4 w-full cursor-pointer flex items-center gap-4 ${correctAlternative === 'option-B' ? 'border-lime-400' : ''}`}
        >
          <RadioGroupItem
            value="option-B"
            id="option-B"
            className="hidden"
          />
          <div className={`rounded-full w-10 h-9 flex items-center justify-center text-sm font-bold text-white ${correctAlternative === 'option-B' ? 'bg-lime-500' : 'bg-gray-400'}`}>
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
          className={`border rounded-md p-4 w-full cursor-pointer flex items-center gap-4 ${correctAlternative === 'option-C' ? 'border-lime-400' : ''}`}
        >
          <RadioGroupItem
            value="option-C"
            id="option-C"
            className="hidden"
          />
          <div className={`rounded-full w-10 h-9 flex items-center justify-center text-sm font-bold text-white ${correctAlternative === 'option-C' ? 'bg-lime-500' : 'bg-gray-400'}`}>
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
          className={`border rounded-md p-4 w-full cursor-pointer flex items-center gap-4 ${correctAlternative === 'option-D' ? 'border-lime-400' : ''}`}
        >
          <RadioGroupItem
            value="option-D"
            id="option-D"
            className="hidden"
          />
          <div className={`rounded-full w-10 h-9 flex items-center justify-center text-sm font-bold text-white ${correctAlternative === 'option-D' ? 'bg-lime-500' : 'bg-gray-400'}`}>
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

      <div className="mt-4 flex justify-between">
        <Button onClick={() => handleCreateAndStop()} variant={"outline"}>Criar e Parar</Button>
        <Button onClick={() => handleCreateAndContinue()}>Criar e Continuar</Button>
      </div>
    </div>
  );
}
