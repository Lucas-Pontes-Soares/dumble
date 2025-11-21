import { useState, useEffect } from "react";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from '@/lib/utils';

interface Option {
  label: string;
  is_correct: boolean;
}

interface QuestionMultipleChoiceProps {
  data: {
    statement: string;
    options: Option[];
  };
  showResults: boolean;
  onValidationComplete: (selected: boolean, answer?: any) => void;
  onAllSelectedChange: (selected: boolean, answer?: any) => void;
}

export default function QuestionMultipleChoice({ data, showResults, onValidationComplete, onAllSelectedChange }: QuestionMultipleChoiceProps) {
  const [selectedValue, setSelectedValue] = useState("");
  const correctAnswer = data.options.find(opt => opt.is_correct)?.label || "";

  useEffect(() => {
    if (showResults && selectedValue) {
      const isCorrect = selectedValue === correctAnswer;
      onValidationComplete(isCorrect);
    }
  }, [showResults, selectedValue, onValidationComplete, correctAnswer]);

  useEffect(() => {
    onAllSelectedChange(!!selectedValue, selectedValue);
  }, [selectedValue, onAllSelectedChange]);

  const handleValueChange = (value: string) => {
    if (showResults) return;
    setSelectedValue(value);
  };

  const getOptionClass = (optionValue: string) => {
    const isSelected = selectedValue === optionValue;
    const isCorrectOption = optionValue === correctAnswer;

    return cn(
      `border rounded-md p-4 w-full cursor-pointer flex items-center gap-4`,
      {
        'hover:bg-[#F7F7F7] dark:hover:bg-[#3C3C3C]': !showResults,
        'border-blue-base': isSelected && !showResults,
        'border-purple-predominant': showResults && isCorrectOption,
        'border-red-500': showResults && isSelected && !isCorrectOption,
      }
    );
  };

  const getIndicatorClass = (optionValue: string, index: number) => {
    const isSelected = selectedValue === optionValue;
    const isCorrectOption = optionValue === correctAnswer;

    return cn(
      `border rounded-full w-10 h-10 flex items-center justify-center font-bold`,
      {
        'border-blue-base': isSelected && !showResults,
        'border-purple-predominant': showResults && isCorrectOption,
        'border-red-500': showResults && isSelected && !isCorrectOption,
      }
    );
  };

  return (
    <div className="flex flex-col max-h-screen w-2xl mt-24 pb-24">
      <div className="p-4">
        <small className="text-base mt-2 text-[#AFAFAF]">* Escolha a alternativa:</small>
        <p className="text-base mt-4 mb-4">{data.statement}</p>
        <div className="flex flex-col items-center w-full p-4">
          <RadioGroup
            value={selectedValue}
            onValueChange={handleValueChange}
            className="w-full flex flex-col gap-3"
          >
            {data.options.map((option, index) => (
              <Label
                key={index}
                htmlFor={`option-${index}`}
                className={getOptionClass(option.label)}
              >
                <RadioGroupItem
                  value={option.label}
                  id={`option-${index}`}
                  className="hidden"
                />
                <div className={getIndicatorClass(option.label, index)}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="flex-1 text-left font-bold">{option.label}</span>
                <div className="w-10 h-10 flex items-center justify-center font-bold" />
              </Label>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}