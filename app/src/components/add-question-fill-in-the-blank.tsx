import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useNavigate } from "react-router";

export default function AddQuestionFillInTheBlack({ suggestion }: { suggestion: any }) {
  const [statement, setStatement] = useState("");
  const [gaps, setGaps] = useState([
    { id: "1", text: "" },
    { id: "2", text: "" },
    { id: "3", text: "" },
    { id: "4", text: "" },
    { id: "5", text: "" },
  ]);

  const navigateTo = useNavigate();

  useEffect(() => {
    if (suggestion) {
      setStatement(suggestion.statement || "");
      setGaps([
        { id: "1", text: suggestion.correct_blank1 || "" },
        { id: "2", text: suggestion.correct_blank2 || "" },
        { id: "3", text: suggestion.correct_blank3 || "" },
        { id: "4", text: suggestion.blank4 || "" },
        { id: "5", text: suggestion.blank5 || "" },
      ]);
    }
  }, [suggestion]);

  const handleCreateAndStop = () => {
        console.log("Criar e Parar", { gaps });
        setGaps([
            { id: "1", text: "" },
            { id: "2", text: "" },
            { id: "3", text: "" },
            { id: "4", text: "" },
            { id: "5", text: "" },
        ]);
        setStatement('');
        navigateTo('/teachers/ED-1234/')
    };

    const handleCreateAndContinue = () => {
        console.log("Criar e Continuar", { gaps });
        setGaps([
            { id: "1", text: "" },
            { id: "2", text: "" },
            { id: "3", text: "" },
            { id: "4", text: "" },
            { id: "5", text: "" },
        ]);
        setStatement('');
    };

  const handleGapChange = (id: string, text: string) => {
    setGaps(
      gaps.map((gap) => {
        if (gap.id === id) {
          return { ...gap, text };
        }
        return gap;
      })
    );
  };

  return (
   <div>
      <Label className="mb-2">Enunciado:</Label>
      <Label className="mt-4 mb-2">Adicone "_" para fazer a lacuna:</Label>
      <small>No máximo 3 lacunas corretas</small>
      <Textarea
        id="statement"
        placeholder="Informe o Enunciado"
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
        className="h-32"
      />

      <Label className="mt-4 mb-2">Preencha o valor da lacuna:</Label>

      <ul className="list-disc list-inside">
        <li className="mb-4">Lacunas corretas em ordem:</li>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-2">
            <div className="rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold text-white bg-gray-400">
              1
            </div>
            <Input
              type="text"
              placeholder="Lacuna 1"
              value={gaps[0].text}
              onChange={(e) => handleGapChange(gaps[0].id, e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold text-white bg-gray-400">
              2
            </div>
            <Input
              type="text"
              placeholder="Lacuna 2"
              value={gaps[1].text}
              onChange={(e) => handleGapChange(gaps[1].id, e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold text-white bg-gray-400">
              3
            </div>
            <Input
              type="text"
              placeholder="Lacuna 3"
              value={gaps[2].text}
              onChange={(e) => handleGapChange(gaps[2].id, e.target.value)}
            />
          </div>
        </div>
        <li className="my-4">Lacunas Faltantes (Erradas):</li>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-2">
            <div className="rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold text-white bg-gray-400">
              4
            </div>
            <Input
              type="text"
              placeholder="Lacuna 4"
              value={gaps[3].text}
              onChange={(e) => handleGapChange(gaps[3].id, e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold text-white bg-gray-400">
              5
            </div>
            <Input
              type="text"
              placeholder="Lacuna 5"
              value={gaps[4].text}
              onChange={(e) => handleGapChange(gaps[4].id, e.target.value)}
            />
          </div>
        </div>
    </ul>



      <div className="mt-4 flex justify-between">
        <Button onClick={() => handleCreateAndStop()} variant={"outline"}>Criar e Parar</Button>
        <Button onClick={() => handleCreateAndContinue()}>Criar e Continuar</Button>
      </div>
    </div>
  );
}