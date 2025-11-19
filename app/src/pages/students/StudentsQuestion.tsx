import { useEffect, useState } from "react";
import QuestionMatchingPairs from "@/components/question-matching-pairs";
import QuestionsFooter from "@/components/questions-footer";
import QuestionsProgressBar from "@/components/questions-progress-bar";
import { useNavigate, useParams } from "react-router";
import QuestionMultipleChoice from "@/components/question-multiple-choice";
import QuestionFillInTheBlank from "@/components/question-fill-in-the-blank";
import { verifyJWTToken } from "@/verifyJWTToken";
import api from "@/apiService";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function StudentsQuestion() {
  const { class_id, question_id } = useParams<{ class_id: string; question_id: string }>();
  const [questionData, setQuestionData] = useState<any>(null);
  const [questionType, setQuestionType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [footerState, setFooterState] = useState<'none' | 'correct' | 'wrong'>('none');
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [allSelected, setAllSelected] = useState(false);
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("student", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
      const token = localStorage.getItem("JWTToken");
      setJwtToken(token);
      checkIfAnswered(token, decodedToken.id);
    }
  }, [navigate, class_id, question_id]);

  async function checkIfAnswered(token: string | null, studentId: string) {
    try {
      const response = await api.get<any>(`/student/${studentId}/class/${class_id}/answers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const answeredQuestion = response.data.answers.find((ans: any) => ans.question_id.toString() === question_id);
        if (answeredQuestion) {
          toast.info("Você já respondeu esta questão.");
          navigate(`/students/classes/${class_id}`);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to check if question was answered:", error);
    }

    fetchQuestionData(token);
    fetchAllQuestions(token);
  }

  async function fetchAllQuestions(token: string | null) {
    try {
      const response = await api.get<any>(`/questions/class/${class_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setQuestions(response.data.questions);
      }
    } catch (error) {
      console.error("Failed to fetch all questions:", error);
    }
  }

  async function fetchQuestionData(token: string | null) {
    setIsLoading(true);
    try {
      const response = await api.get<any>(`/questions/${question_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const fetchedQuestion = response.data.question;
        setQuestionData(fetchedQuestion.data);
        
        let frontendType = '';
        switch (fetchedQuestion.type) {
          case 'QUESTIONS_MULTIPLE_CHOICE':
            frontendType = 'multiple-choice';
            break;
          case 'QUESTIONS_FILL_IN_THE_BLANK':
            frontendType = 'fill-in-the-blank';
            break;
          case 'QUESTIONS_MATCHING_PAIRS':
            frontendType = 'matching-pairs';
            break;
        }
        setQuestionType(frontendType);
      } else {
        toast.error("Failed to fetch question data.");
        navigate(`/students/classes/${class_id}`);
      }
    } catch (error: any) {
      console.error("Error fetching question data:", error);
      toast.error(error.response?.data?.message || "An error occurred while fetching the question.");
      navigate(`/students/classes/${class_id}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!userAnswer) {
      toast.error("Por favor, responda à questão.");
      return;
    }

    try {
      const response = await api.post<any>('/answers', 
        {
          question_id: question_id,
          answer: userAnswer,
        },
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );

      if (response.data.success) {
        setShowResults(true);
        setFooterState(response.data.is_correct ? 'correct' : 'wrong');
      } else {
        toast.error("Failed to submit answer.");
      }
    } catch (error: any) {
      console.error("Error submitting answer:", error);
      toast.error(error.response?.data?.message || "An error occurred while submitting the answer.");
    }
  }

  const handleContinue = () => {
    if (footerState === 'none') {
      handleSubmitAnswer();
    } else {
      const currentIndex = questions.findIndex(q => q.id.toString() === question_id);
      if (currentIndex !== -1 && currentIndex < questions.length - 1) {
        const nextQuestion = questions[currentIndex + 1];
        navigate(`/students/classes/${class_id}/questions/${nextQuestion.id}`);
      } else {
        navigate(`/students/classes/${class_id}`);
      }
      setShowResults(false);
      setFooterState('none');
    }
  };

  const handleAllSelectedChange = (selected: boolean, answer?: any) => {
    setAllSelected(selected);
    if(answer) {
      setUserAnswer(answer);
    }
  };

  const renderQuestion = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    if (!questionType || !questionData) {
      return <div>Questão não encontrada.</div>;
    }

    switch (questionType) {
      case 'multiple-choice':
        return (
          <QuestionMultipleChoice
            data={questionData}
            showResults={showResults}
            onValidationComplete={handleAllSelectedChange}
            onAllSelectedChange={handleAllSelectedChange}
          />
        );
      case 'fill-in-the-blank':
        return (
          <QuestionFillInTheBlank
            data={questionData}
            showResults={showResults}
            onValidationComplete={handleAllSelectedChange}
            onAllSelectedChange={handleAllSelectedChange}
          />
        );
      case 'matching-pairs':
        return (
          <QuestionMatchingPairs
            data={questionData}
            showResults={showResults}
            onValidationComplete={handleAllSelectedChange}
            onAllSelectedChange={handleAllSelectedChange}
          />
        );
      default:
        return <div>Tipo de questão desconhecido.</div>;
    }
  };

  return (
    <div>
      <div className="font-nunito flex justify-center pb-24">
        <QuestionsProgressBar class_id={class_id} question_id={question_id}/>
        {renderQuestion()}
        <QuestionsFooter state={footerState} onContinue={handleContinue} allSelected={allSelected} />
      </div>
    </div>
  );
}


