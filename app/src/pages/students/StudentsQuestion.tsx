import { useEffect, useState } from "react";
import QuestionMatchingPairs from "@/components/question-matching-pairs";
import QuestionsFooter from "@/components/questions-footer";
import QuestionsProgressBar from "@/components/questions-progress-bar";
import { useNavigate, useParams } from "react-router";
import QuestionMultipleChoice from "@/components/question-multiple-choice";
import QuestionFillInTheBlank from "@/components/question-fill-in-the-blank";
import { verifyJWTToken } from "@/verifyJWTToken";

export default function StudentsQuestion() {
  const { class_id, questionId } = useParams<{ class_id: string; questionId: string }>();
  const [showResults, setShowResults] = useState(false);
  const [footerState, setFooterState] = useState<'none' | 'correct' | 'wrong'>('none');
  const [isRemake, setIsRemake] = useState(false);
  const [isRemakeAll, setIsRemakeAll] = useState(false);
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("student", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
    }
  }, [navigate]);


  const navigateTo = useNavigate();

  const handleContinue = (status: 'none' | 'correct' | 'wrong') => {
    if(status === 'none') { // se não tinha clicado ainda
      setShowResults(true);
    } else { // se ja tinha resultado, ao clicar, leva para a proxima
      if(isRemake && !isRemakeAll){
        setShowResults(false); 
        setIsRemake(false);
        setFooterState('none');
        setIsRemakeAll(false);
        navigateTo(`/students/classes/1`)
        
      } else {
        const questionIdNumber = Number(questionId);
        setShowResults(false); 
        setIsRemake(false);
        setFooterState('none');
        setIsRemakeAll(false);
        navigateTo(`/students/classes/1/questions/${questionIdNumber + 1}`)
      }
    }
  };

  const handleValidationComplete = (status: 'none' | 'correct' | 'wrong') => {
    setFooterState(status);
  };

  return (
    <div>
      <div className="flex justify-center pb-24">
        <QuestionsProgressBar class_id={class_id} />
        
        {questionId === '1' ? (
          <QuestionMatchingPairs 
            showResults={showResults} 
            onValidationComplete={handleValidationComplete} 
          />
        ) : questionId === '2' ?(
          <QuestionMultipleChoice 
            showResults={showResults} 
            onValidationComplete={handleValidationComplete}
          />
        ) : (
          <QuestionFillInTheBlank 
            showResults={showResults} 
            onValidationComplete={handleValidationComplete}
          />
        )}

        <QuestionsFooter state={footerState} onContinue={handleContinue} />
      </div>
    </div>
  )
}

