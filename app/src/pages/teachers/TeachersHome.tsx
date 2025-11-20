import CurrentClass from "@/components/current-class";
import TeachersNavigation from "@/components/teachers-navigation";
import QuestionsTrail from '@/components/questions-trail';
import { useNavigate, useParams } from "react-router";
import { Question } from "@/components/item-question-trail";
import { useEffect, useState } from "react";
import { verifyJWTToken } from "@/verifyJWTToken";
import api from "@/apiService";
import { Skeleton } from "@/components/ui/skeleton";
import { verifyClass } from "@/verifyClass";
import QuestionsTrailSkeleton from "@/components/questions-trail-skeleton";

export default function TeachersHome() {
  const { class_id } = useParams<{ class_id: string }>();
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [actuallyClass, setActuallyClass] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();


  useEffect(() => {
    const run = async () => {
      const decodedToken = verifyJWTToken("teacher", navigate);

      if (decodedToken) {
        setDecodedToken(decodedToken);
        const token = localStorage.getItem("JWTToken");
        setJwtToken(token);

        const isValid = await verifyClass(navigate, class_id, decodedToken);

        if (isValid) {
          fetchData(token);
        }
      }
    };

    run();
  }, [navigate, class_id]);

  async function fetchData(token: string | null) {
    setIsLoading(true);
    await Promise.all([
      fetchActuallyClasses(token),
      fetchQuestions(token)
    ]);
    setIsLoading(false);
  }

  async function fetchActuallyClasses(token: string | null) {
    try {
      const enrolledResponse = await api.get<any>(`/classes/${class_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (enrolledResponse.data.success) {
        setActuallyClass(enrolledResponse.data.class);
      }
    } catch (error) {
      console.error("Failed to fetch class details:", error);
    }
  }

  async function fetchQuestions(token: string | null) {
    const determinePositionAndSide = (index: number): { position: 1 | 2 | 3; side: 'left' | 'right' | 'none' } => {
      const sequence = [
          { position: 1, side: 'none' as 'none' },
          { position: 2, side: 'left' as 'left' },
          { position: 3, side: 'left' as 'left' },
          { position: 2, side: 'left' as 'left' },
          { position: 1, side: 'none' as 'none' },
          { position: 2, side: 'right' as 'right' },
          { position: 3, side: 'right' as 'right' },
          { position: 2, side: 'right' as 'right' },
      ];
      const result = sequence[index % 8];
      return {
        position: result.position as (1 | 2 | 3),
        side: result.side
      }
    };

    const createNewQuestionButton = (index: number): Question => {
        const { position, side } = determinePositionAndSide(index);
        return {
            id: -1,
            status: 'new',
            position: position,
            side: side,
            type: 'none',
        };
    };

    try {
      console.log(`Fetching questions for class_id: ${class_id}`);
      const response = await api.get<any>(`/questions/class/${class_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("API Response:", response.data);

      if (Array.isArray(response.data.questions)) {
        const mapApiTypeToFrontendType = (apiType: string): 'multiple' | 'pairs' | 'fill' => {
          switch (apiType) {
            case 'QUESTIONS_MULTIPLE_CHOICE': return 'multiple';
            case 'QUESTIONS_MATCHING_PAIRS': return 'pairs';
            case 'QUESTIONS_FILL_IN_THE_BLANK': return 'fill';
            default: return 'multiple';
          }
        };

        const formattedQuestions = response.data.questions.map((q: any, index: number) => {
          const { position, side } = determinePositionAndSide(index);
          return {
            id: q.id,
            status: 'completed' as 'completed',
            position: position,
            side: side,
            type: mapApiTypeToFrontendType(q.type),
          };
        });

        const newQuestionButton = createNewQuestionButton(formattedQuestions.length);
        setQuestions([...formattedQuestions, newQuestionButton]);
      } else {
        console.warn("API call for questions did not return expected data.", response.data);
        setQuestions([createNewQuestionButton(0)]);
      }
    } catch (error) {
      console.error("Failed to fetch questions. Check API endpoint and server status.", error);
      setQuestions([createNewQuestionButton(0)]);
    }
  }

  return (
    <div>
      <CurrentClass class_id={`${class_id}`} title={actuallyClass?.title} userType="teacher"/>
      <div className="min-h-screen flex items-center justify-center mt-24 pb-24"> 
        {isLoading ? (
          <QuestionsTrailSkeleton />
        ) : (
          <QuestionsTrail userType={"teacher"} questions={questions}/>
        )}
      </div>
      
      <TeachersNavigation activePage="home" />
    </div>
  )
}
