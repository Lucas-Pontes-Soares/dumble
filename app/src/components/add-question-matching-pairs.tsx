import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { Textarea } from "./ui/textarea";

export default function AddQuestionMatchingPairs({ suggestion, submitAction, onFormSubmit }: { suggestion?: any, submitAction: string | null, onFormSubmit: () => void }) {
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

    useEffect(() => {
        if (submitAction) {
            handleSubmit(submitAction);
        }
    }, [submitAction]);

    const handlePairChange = (index: number, side: 'left' | 'right', value: string) => {
        const newPairs = [...pairs];
        newPairs[index][side] = value;
        setPairs(newPairs);
    };

    const handleSubmit = (action: string) => {
        console.log(`Creating question with action: ${action}`, { statement, pairs });

        // Reset form
        setStatement("");
        setPairs([
            { left: "", right: "" },
            { left: "", right: "" },
            { left: "", right: "" },
            { left: "", right: "" }
        ]);

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
        </div>


    </div>
  );
}