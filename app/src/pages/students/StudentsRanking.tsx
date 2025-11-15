import CurrentClass from "@/components/current-class";
import StudentsNavigation from "@/components/students-navigation";
import { useNavigate, useParams } from "react-router";
import { StudentsRankingDataTable } from "../../components/students-ranking-data-table";
import { columns, StudentsRank } from "../../components/students-ranking-columns"
import { useEffect, useState } from "react";
import { verifyJWTToken } from "@/verifyJWTToken";
import api from "@/apiService";

export default function StudentsRanking() {
  const { class_id } = useParams<{ class_id: string }>();

  const [data, setData] = useState<StudentsRank[]>([]);
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


  useEffect(() => {
    async function getData(): Promise<StudentsRank[]> {
      return [
        {
          id: "1",
          placing: 1,
          picture: '5.png',
          name: 'Lucas Pontes Soares',
          rank: "diamond",
          score: 360
        },
        // ...
      ]
    }

    getData().then((data) => {
      setData(data);
    })
  }, [])

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
      <div className="container mx-auto mt-24 pb-24 max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4 mt-4">
          <h2 className="text-xl font-bold">Melhores Alunos:</h2>
          <span className="text-gray-600">Total de alunos: {data.length}</span>
        </div>
        <StudentsRankingDataTable columns={columns} data={data} />
      </div>
      <StudentsNavigation activePage="ranking" />
    </div>
  )
}
