import ItemQuestionTrail, { type Question } from "./item-question-trail";

interface QuestionsTrailProps {
  questions: Question[];
  userType: 'teacher' | 'student';
}

export default function QuestionsTrail({ questions, userType }: QuestionsTrailProps){
  return (
    <div className="flex flex-col items-center min-h-screen bg-background py-12">
      <div className="flex flex-col items-center space-y-8">
        {questions.map((question, index) => (
          <ItemQuestionTrail key={question.id} question={question} userType={userType} questionNumber={index + 1}/>
        ))}      </div>
    </div>
  );
};
