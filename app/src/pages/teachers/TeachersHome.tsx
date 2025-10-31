import CurrentClass from "@/components/current-class";
import TeachersNavigation from "@/components/teachers-navigation";
import QuestionsTrail from '@/components/questions-trail';
import { useNavigate, useParams } from "react-router";
import { Question } from "@/components/item-question-trail";
import { useEffect, useState } from "react";
import { verifyJWTToken } from "@/verifyJWTToken";

export default function TeachersHome() {
  const { class_id } = useParams<{ class_id: string }>();
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("teacher", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
    }
  }, [navigate]);

  const questions: Question[] = [
    { id: 1, status: 'completed', position: 1, side: 'none', type: 'multiple' },
    { id: 2, status: 'completed', position: 2, side: 'left', type: 'pairs' },
    { id: 3, status: 'completed', position: 3, side: 'left', type: 'fill' },
    { id: 4, status: 'new', position: 2, side: 'left', type: 'none'}
  ];

  return (
    <div>
      <CurrentClass acronym={`ED`} class_id={`${class_id}`} title={`Estrutura de Dados`} userType="teacher"/>
      <div className="min-h-screen flex items-center justify-center mt-24 pb-24"> 
        <QuestionsTrail userType={"teacher"} questions={questions}/>
      </div>
      
      <TeachersNavigation activePage="home" />
    </div>
  )
}
