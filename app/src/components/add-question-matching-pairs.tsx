import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { Textarea } from "./ui/textarea";

export default function AddQuestionMatchingPairs({ suggestion }: { suggestion: any }) {
    const [pairs, setPairs] = useState([
        { left: "", right: "" },
        { left: "", right: "" },
        { left: "", right: "" },
        { left: "", right: "" },
    ]);
    const [statement, setStatement] = useState("");

    const navigateTo = useNavigate();

    useEffect(() => {
        if (suggestion) {
            setStatement(suggestion.statement || "");
            setPairs([
                { left: suggestion.alternative1_left || "", right: suggestion.alternative1_right || "" },
                { left: suggestion.alternative2_left || "", right: suggestion.alternative2_right || "" },
                { left: suggestion.alternative3_left || "", right: suggestion.alternative3_right || "" },
                { left: suggestion.alternative4_left || "", right: suggestion.alternative4_right || "" },
            ]);
        }
    }, [suggestion]);

    const handlePairChange = (index: number, side: 'left' | 'right', value: string) => {
        const newPairs = [...pairs];
        newPairs[index][side] = value;
        setPairs(newPairs);
    };

    const handleCreateAndStop = () => {
        console.log("Criar e Parar", { pairs });
        setPairs([
            { left: "", right: "" },
            { left: "", right: "" },
            { left: "", right: "" },
            { left: "", right: "" }
        ]);
        navigateTo('/teachers/ED-1234/')
    };

    const handleCreateAndContinue = () => {
        console.log("Criar e Continuar", { pairs });
        setPairs([
            { left: "", right: "" },
            { left: "", right: "" },
            { left: "", right: "" },
            { left: "", right: "" }
        ]);
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

            <div className="flex flex-col gap-4 mt-4">
                {pairs.map((pair, index) => (
                    <div key={index} className="flex gap-4">
                    <Input
                        type="text"
                        placeholder={`Par ${index + 1} - Esquerda`}
                        value={pair.left}
                        onChange={(e) => handlePairChange(index, 'left', e.target.value)}
                    />
                    <Input
                        type="text"
                        placeholder={`Par ${index + 1} - Direita`}
                        value={pair.right}
                        onChange={(e) => handlePairChange(index, 'right', e.target.value)}
                    />
                    </div>
                ))}
            </div>

        <div className="mt-4 flex justify-between">
            <Button onClick={() => handleCreateAndStop()} variant={"outline"}>Criar e Parar</Button>
            <Button onClick={() => handleCreateAndContinue()}>Criar e Continuar</Button>
        </div>
    </div>
  );
}