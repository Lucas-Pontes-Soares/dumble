import { useState, useEffect } from "react";
import { cn } from '@/lib/utils';

interface QuestionFillInTheBlackProps {
  data: {
    statement: string;
    correct_answers: string[];
    wrong_answers: string[];
  };
  showResults: boolean;
  onValidationComplete: (selected: boolean, answer?: any) => void;
  onAllSelectedChange: (selected: boolean, answer?: any) => void;
}

function shuffleArray(array: any[]) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

export default function QuestionFillInTheBlack({ data, showResults, onValidationComplete, onAllSelectedChange }: QuestionFillInTheBlackProps) {
  const [filledBlanks, setFilledBlanks] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  useEffect(() => {
    const blanks = data.correct_answers;
    const allWords = shuffleArray([...data.correct_answers, ...data.wrong_answers]);
    setFilledBlanks(Array(blanks.length).fill(""));
    setAvailableWords(allWords);
  }, [data.statement, JSON.stringify(data.correct_answers), JSON.stringify(data.wrong_answers)]);

  useEffect(() => {
    if (showResults) {
      const isCorrect = filledBlanks.every((word, index) => word === data.correct_answers[index]);
      onValidationComplete(isCorrect);
    }
  }, [showResults, filledBlanks, onValidationComplete, data.correct_answers]);

  useEffect(() => {
    if(filledBlanks.length > 0) {
      const allBlanksFilled = filledBlanks.every(blank => blank !== "");
      onAllSelectedChange(allBlanksFilled, filledBlanks);
    }
  }, [filledBlanks, onAllSelectedChange]);

  const handleWordClick = (word: string) => {
    if (showResults) return;

    const firstEmptyIndex = filledBlanks.findIndex(blank => blank === "");
    if (firstEmptyIndex !== -1) {
      const newFilledBlanks = [...filledBlanks];
      newFilledBlanks[firstEmptyIndex] = word;
      setFilledBlanks(newFilledBlanks);

      setAvailableWords(prev => {
        const index = prev.indexOf(word);
        if (index > -1) {
          return [...prev.slice(0, index), ...prev.slice(index + 1)];
        }
        return prev;
      });
    }
  };

  const handleBlankClick = (index: number) => {
    if (showResults) return;

    const wordToReturn = filledBlanks[index];
    if (wordToReturn) {
      const newFilledBlanks = [...filledBlanks];
      newFilledBlanks[index] = "";
      setFilledBlanks(newFilledBlanks);

      setAvailableWords(prev => [...prev, wordToReturn]);
    }
  };

  const renderSentence = () => {
    const sentenceParts = data.statement.split("_");
    return (
      <p className="flex flex-wrap items-center text-base mt-4 mb-4">
        {sentenceParts.map((part, index) => (
          <span key={index}>
            {part}
            {index < sentenceParts.length - 1 && (
              <span
                className={cn(
                  "p-2 inline-flex items-center justify-center w-auto h-8 mx-2 overflow-hidden leading-8 underline underline-offset-1",
                  {
                    "border rounded-md  border-purple-predominant": showResults && filledBlanks[index] === data.correct_answers[index],
                    "border rounded-md  border-red-500": showResults && filledBlanks[index] !== data.correct_answers[index] && filledBlanks[index] !== "",
                    "border rounded-md border-blue-base": !showResults && filledBlanks[index] !== '',
                    "cursor-pointer": !showResults
                  }
                )}
                onClick={() => handleBlankClick(index)}
              >
                {filledBlanks[index] !== '' ? filledBlanks[index] : '_'}
              </span>
            )}
          </span>
        ))}
      </p>
    );
  };

  return (
    <div className="flex flex-col max-h-screen w-2xl mt-24 p-4 pb-24">
      <small className="text-base mt-2 text-[#AFAFAF]">* Preencha as lacunas</small>
      <div className="mt-2">
        {renderSentence()}
        <div className="flex flex-wrap gap-2 p-4">
          {availableWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className={cn(
                "border rounded-md p-2 cursor-pointer",
                {
                  "bg-gray-200 text-gray-700": showResults,
                  "hover:bg-[#F7F7F7] dark:hover:bg-[#3C3C3C]": !showResults
                }
              )}
              onClick={() => handleWordClick(word)}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
