// 1. O enum que você já tem
export enum QuestionType {
  MULTIPLE_CHOICE = "QUESTIONS_MULTIPLE_CHOICE",
  MATCHING_PAIRS = "QUESTIONS_MATCHING_PAIRS",
  FILL_IN_THE_BLANK = "QUESTIONS_FILL_IN_THE_BLANK",
}

// 2. Os "Contratos" do JSON para cada tipo
export interface MultipleChoiceData {
  options: {
    text: string;
    is_correct: boolean;
  }[];
  // pode ter um "prompt" aqui também, ou o prompt pode ser
  // uma coluna separada na tabela 'questions'. Decisão sua.
  // prompt: string; 
}

export interface MatchingPairsData {
  pairs: {
    prompt: string;
    answer: string;
  }[];
}

export interface FillInTheBlankData {
  prompt_template: string; // Ex: "A capital da França é ____."
  correct_answers: string[]; // Ex: ["Paris"]
}

// 3. Um "Type Union" para facilitar a vida
export type QuestionData = MultipleChoiceData | MatchingPairsData | FillInTheBlankData;