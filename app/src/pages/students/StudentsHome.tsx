import StudentsNavigation from "@/components/students-navigation";
import CurrentClass from '@/components/current-class';
import QuestionsTrail from '@/components/questions-trail';
import { useNavigate, useParams } from "react-router";
import { Question } from "@/components/item-question-trail";
import { useEffect, useState } from "react";
import { verifyJWTToken } from "@/verifyJWTToken";
import api from "@/apiService";
import { Skeleton } from "@/components/ui/skeleton";
import { verifyClass } from "@/verifyClass";
import QuestionsTrailSkeleton from "@/components/questions-trail-skeleton";

export default function StudentsHome() {
  const { class_id } = useParams<{ class_id: string }>();
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [actuallyClass, setActuallyClass] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const decodedToken = verifyJWTToken("student", navigate);

      if (decodedToken) {
        setDecodedToken(decodedToken);
        const token = localStorage.getItem("JWTToken");
        setJwtToken(token);

        const isValid = await verifyClass(navigate, class_id, decodedToken);

        if (isValid) {
          fetchData(token, decodedToken.id);
        }
      }
    };

    run();
  }, [navigate, class_id]);

  async function fetchData(token: string | null, studentId: string) {
    setIsLoading(true);
    await Promise.all([
      fetchActuallyClasses(token),
      fetchQuestions(token, studentId)
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

  async function fetchQuestions(token: string | null, studentId: string) {
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

    try {
      const response = await api.get<any>(`/questions/class/${class_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data.questions)) {
        const answersResponse = await api.get<any>(`/student/${studentId}/class/${class_id}/answers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const completedQuestionIds = new Set(answersResponse.data.answers.map((a: any) => a.question_id));

        let unlockedQuestionFound = false;

        const formattedQuestions = response.data.questions.map((q: any, index: number) => {
          const { position, side } = determinePositionAndSide(index);
          const isCompleted = completedQuestionIds.has(q.id);
          let status: 'completed' | 'unlocked' | 'locked' = 'locked';

          if (isCompleted) {
            status = 'completed';
          } else if (!unlockedQuestionFound) {
            status = 'unlocked';
            unlockedQuestionFound = true;
          }
          
          const mapApiTypeToFrontendType = (apiType: string): 'multiple' | 'pairs' | 'fill' => {
            switch (apiType) {
              case 'QUESTIONS_MULTIPLE_CHOICE': return 'multiple';
              case 'QUESTIONS_MATCHING_PAIRS': return 'pairs';
              case 'QUESTIONS_FILL_IN_THE_BLANK': return 'fill';
              default: return 'multiple';
            }
          };

          return {
            id: q.id,
            status: status,
            position: position,
            side: side,
            type: mapApiTypeToFrontendType(q.type),
          };
        });

        setQuestions(formattedQuestions);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error("Failed to fetch questions. Check API endpoint and server status.", error);
      setQuestions([]);
    }
  }

  return (
    <div>
      <CurrentClass class_id={`${class_id}`} title={actuallyClass?.title} userType="student"/>
      <div className="min-h-screen flex items-center justify-center mt-24 pb-24"> 
        {isLoading ? (
          <QuestionsTrailSkeleton />
        ) : (
          questions.length > 0 ? (
            <QuestionsTrail userType={"student"} questions={questions} />
          ) : (
            <div className="text-center p-4">
              <h2 className="text-2xl font-semibold mb-4">Nenhuma questão disponível</h2>
              <p className="text-gray-600">
                Parece que ainda não há questões para esta turma. Por favor, verifique mais tarde.
              </p>
            </div>
          )
        )}
      </div>

      <StudentsNavigation activePage="home" />
    </div>
  )
}
