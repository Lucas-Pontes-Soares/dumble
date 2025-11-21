import CurrentClass from "@/components/current-class";
import TeachersNavigation from "@/components/teachers-navigation";
import { StudentsRankingDataTable } from "../../components/students-ranking-data-table";
import { columns, StudentsRank } from "../../components/students-ranking-columns";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { verifyJWTToken } from "@/verifyJWTToken";
import api from "@/apiService";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { verifyClass } from "@/verifyClass";

export default function TeachersRanking() {
  const { class_id } = useParams<{ class_id: string }>();

  const [data, setData] = useState<StudentsRank[]>([]);
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [actuallyClass, setActuallyClass] = useState<any>(null);
  const [averageAnswered, setAverageAnswered] = useState(0);
  const [averageCorrectness, setAverageCorrectness] = useState(0);

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
          fetchClassAndRankingData(token);
        }
      }
    };

    run();
  }, [navigate, class_id]);

  async function fetchClassAndRankingData(token: string | null) {
    try {
      const classResponse = await api.get<any>(`/classes/${class_id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (classResponse.data.success) {
        setActuallyClass(classResponse.data.class);
      }

      const progressResponse = await api.get<any>(`/classes/${class_id}/answers/summary`, { headers: { Authorization: `Bearer ${token}` } });
      const correctnessResponse = await api.get<any>(`/classes/${class_id}/answers/summary/correct`, { headers: { Authorization: `Bearer ${token}` } });

      if (progressResponse.data.success) {
        setAverageAnswered(progressResponse.data.average_answered);
      }
      if (correctnessResponse.data.success) {
        setAverageCorrectness(correctnessResponse.data.average_correctness);
      }

      if (progressResponse.data.success) {
        const correctnessMap = correctnessResponse.data.success
          ? new Map(correctnessResponse.data.student_correctness.map((s: any) => [s.id, { correct_answers: s.correct_answers, first_answered_at: s.first_answered_at }]))
          : new Map();

        const processedData = progressResponse.data.student_progress.map((student: any) => {
          const correctnessData = correctnessMap.get(student.id) || { correct_answers: 0, first_answered_at: null };
          return {
            ...student,
            correct_answers: correctnessData.correct_answers,
            first_answered_at: correctnessData.first_answered_at || student.first_answered_at,
          };
        });

        processedData.sort((a: any, b: any) => {
          if (b.correct_answers !== a.correct_answers) {
            return b.correct_answers - a.correct_answers;
          }
          if (b.answered_questions !== a.answered_questions) {
            return b.answered_questions - a.answered_questions;
          }
          if (a.first_answered_at && b.first_answered_at) {
            return new Date(a.first_answered_at).getTime() - new Date(b.first_answered_at).getTime();
          }
          return 0;
        });

        const rankedData = processedData.map((student: any, index: number) => ({
          id: student.id,
          placing: index + 1,
          picture: student.picture,
          name: student.name,
          answered_questions: student.answered_questions,
          total_questions: student.total_questions,
          correct_answers: student.correct_answers,
          first_answered_at: student.first_answered_at,
        }));

        setData(rankedData);
      }
    } catch (error) {
      console.error("Error fetching ranking data:", error);
    }
  }

  const progressChartData = [
    { name: 'Respondido', value: averageAnswered },
    { name: 'Não Respondido', value: 1 - averageAnswered },
  ];

  const correctnessChartData = [
    { name: 'Correto', value: averageCorrectness },
    { name: 'Incorreto', value: 1 - averageCorrectness },
  ];

  const COLORS_PROGRESS = ['#00C49F', '#FFBB28'];
  const COLORS_CORRECTNESS = ['#0088FE', '#FF8042'];

  return (
    <div>
      <CurrentClass class_id={`${class_id}`} title={actuallyClass?.title} userType="teacher" />
      <div className="container mx-auto mt-24 pb-24 max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4 mt-4">
          <h2 className="text-xl font-bold">Melhores Alunos:</h2>
          <span className="text-gray-600">Total de alunos: {data.length}</span>
        </div>
        <StudentsRankingDataTable columns={columns} data={data} />

        <div className="py-8 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-center mb-4">Progresso da Turma</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={progressChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ percent }) => `${(percent ? (percent * 100).toFixed(0) : 0)}%`}>
                  {progressChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PROGRESS[index % COLORS_PROGRESS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-center mb-4">Média de Acertos</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={correctnessChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ percent }) => `${(percent ? (percent * 100).toFixed(0) : 0)}%`}>
                  {correctnessChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_CORRECTNESS[index % COLORS_CORRECTNESS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <TeachersNavigation activePage="ranking" />
    </div>
  );
}
