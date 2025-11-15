//import { useParams } from 'react-router-dom';
import StudentsNavigation from "@/components/students-navigation";
import CurrentClass from '@/components/current-class';
import QuestionsTrail from '@/components/questions-trail';
import { useNavigate, useParams } from "react-router";
import { Question } from "@/components/item-question-trail";
import { useEffect, useState } from "react";
import { verifyJWTToken } from "@/verifyJWTToken";
import api from "@/apiService";

export default function StudentsHome() {
  const { class_id } = useParams<{ class_id: string }>();
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [actuallyClass, setActuallyClass] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("student", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
      const token = localStorage.getItem("JWTToken");
      setJwtToken(token);
      fetchActuallyClasses(token);
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

  async function fetchActuallyClasses(token: string | null) {
    const enrolledResponse = await api.get<any>(`/classes/${class_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    if (enrolledResponse.data.success) {
      setActuallyClass(enrolledResponse.data.class);
    }
  }

  return (
    <div>
      <CurrentClass class_id={`${class_id}`} title={actuallyClass?.title} userType="student"/>
      <div className="min-h-screen flex items-center justify-center mt-24 pb-24"> 
        <QuestionsTrail userType="student" questions={questions}/>
      </div>

      <StudentsNavigation activePage="home" />
    </div>
  )
}
