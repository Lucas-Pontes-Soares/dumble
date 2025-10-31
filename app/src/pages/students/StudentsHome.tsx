//import { useParams } from 'react-router-dom';
import StudentsNavigation from "@/components/students-navigation";
import CurrentClass from '@/components/current-class';
import QuestionsTrail from '@/components/questions-trail';
import { useNavigate, useParams } from "react-router";
import { Question } from "@/components/item-question-trail";
import { useEffect, useState } from "react";
import { verifyJWTToken } from "@/verifyJWTToken";

export default function StudentsHome() {
  const { class_id } = useParams<{ class_id: string }>();
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("student", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
    }
  }, [navigate]);

  const questions: Question[] = [
    { id: 1, status: 'completed', position: 1, side: 'none', type: 'multiple' },
    { id: 2, status: 'completed', position: 2, side: 'left', type: 'pairs' },
    { id: 3, status: 'unlocked', position: 3, side: 'left', type: 'fill' },
    { id: 4, status: 'locked', position: 2, side: 'left', type: 'multiple' },
    { id: 5, status: 'locked', position: 1, side: 'none', type: 'multiple' },
    { id: 6, status: 'locked', position: 2, side: 'right', type: 'multiple' },
    { id: 7, status: 'locked', position: 3, side: 'right', type: 'multiple' },
    { id: 8, status: 'locked', position: 2, side: 'right', type: 'multiple' },
    { id: 9, status: 'locked', position: 1, side: 'none', type: 'multiple' },
  ];

  return (
    <div>
      <CurrentClass acronym={`ED`} class_id={`${class_id}`} title={`Estrutura de Dados`} userType="student"/>
      <div className="min-h-screen flex items-center justify-center mt-24 pb-24"> 
        <QuestionsTrail userType="student" questions={questions}/>
      </div>

      <StudentsNavigation activePage="home" />
    </div>
  )
}
