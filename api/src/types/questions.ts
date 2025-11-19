// 1. O enum que você já tem
export enum QuestionType {
  MULTIPLE_CHOICE = "QUESTIONS_MULTIPLE_CHOICE",
  MATCHING_PAIRS = "QUESTIONS_MATCHING_PAIRS",
  FILL_IN_THE_BLANK = "QUESTIONS_FILL_IN_THE_BLANK",
}

// 2. Os "Contratos" do JSON para cada tipo
export interface MultipleChoiceData {
  statement: string;
  options: {
    label: string;
    is_correct: boolean;
  }[];
}

export interface MatchingPairsData {
  statement: string;
  pairs: {
    label: string;
    answer: string;
  }[];
}

export interface FillInTheBlankData {
  statement: string;
  correct_answers: string[];
  wrong_answers: string[];
}

// 3. Um "Type Union" para facilitar a vida
export type QuestionData = MultipleChoiceData | MatchingPairsData | FillInTheBlankData;