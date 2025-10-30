
import { Check, X } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react"; 

interface QuestionsFooterProps {
  state: 'none' | 'correct' | 'wrong';
  onContinue: (state: 'none' | 'correct' | 'wrong') => void;
  allSelected: boolean;
}

const correctPhrases = [
  "Maravilha!",
  "Excelente!",
  "Perfeito!",
  "Mandou bem!",
  "Acertou em cheio!",
];

const wrongPhrases = [
  "Não foi dessa vez!",
  "Quase lá!",
  "Tente novamente!",
  "Continue praticando!",
  "Você consegue!",
];

export default function QuestionsFooter({ state, onContinue, allSelected }: QuestionsFooterProps) {
  const [displayPhrase, setDisplayPhrase] = useState('');

  useEffect(() => {
    if (state === 'correct') {
      const randomIndex = Math.floor(Math.random() * correctPhrases.length);
      setDisplayPhrase(correctPhrases[randomIndex]);
    } else if (state === 'wrong') {
      const randomIndex = Math.floor(Math.random() * wrongPhrases.length);
      setDisplayPhrase(wrongPhrases[randomIndex]);
    } else {
      setDisplayPhrase('');
    }
  }, [state]);

  const handleContinue = () => {
    onContinue(state);
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 p-4 border-t ${state === 'correct' ? 'bg-[#DCA7FF]' : state === 'wrong' ? 'bg-red-300' : 'bg-background '}`}>
        <div className="w-full max-w-2xl mx-auto p-4 flex flex-col items-start gap-4">
            {state === 'correct' ? (
                <div className="w-full flex items-center gap-2">
                    <div className="rounded-full border p-1 text-white bg-purple-predominant border-none">
                        <Check />
                    </div>
                    <span className="text-purple-predominant text-2xl font-extrabold">{displayPhrase}</span>
                </div>
            ) : state === 'wrong' ? (
                    <div className="w-full flex items-center gap-2">
                    <div className="rounded-full border p-1 text-white bg-red-500 border-none">
                        <X />
                    </div>
                    <span className="text-red-500 text-2xl font-extrabold">{displayPhrase}</span>
                </div>
            ) :
                <div className="w-0 h-0"></div>
            }
            <div className="w-full">
                {state === 'correct' ? (
                    <Button onClick={handleContinue} className={`w-full bg-purple-predominant rounded-xl border-b-4 border-b-dark-shadow p-6 font-extrabold hover:bg-purple-600`}>
                      CONTINUAR
                    </Button>
                ) : state === 'wrong' ? (
                    <Button onClick={handleContinue} className={`w-full bg-red-400 rounded-xl border-b-4 border-b-red-500 p-6 font-extrabold hover:bg-red-600`}>
                      CONTINUAR
                    </Button>
                ) : state === 'none' && allSelected ? (
                    <Button onClick={handleContinue} disabled={!allSelected} className={`w-full bg-purple-predominant rounded-xl border-b-4 border-b-dark-shadow p-6 font-extrabold hover:bg-purple-600`}>
                      VERIFICAR
                    </Button>
                ) : (
                    <Button onClick={handleContinue} disabled={!allSelected} className={`w-full border-b-4 rounded-xl p-6 font-extrabold bg-grey-disabled text-text-secondary`}>
                      VERIFICAR
                    </Button>
                )}
            </div>
        </div>
    </div>
  );
}

