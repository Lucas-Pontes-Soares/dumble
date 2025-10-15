import CurrentClass from "@/components/current-class";
import TeachersNavigation from "@/components/teachers-navigation";
import { StudentsRankingDataTable } from "../../components/students-ranking-data-table";
import { columns, StudentsRank } from "../../components/students-ranking-columns"
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { verifyJWTToken } from "@/verifyJWTToken";

export default function TeachersRanking() {
  const { classCode } = useParams<{ classCode: string }>();

  const [data, setData] = useState<StudentsRank[]>([]);
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("teacher", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
    }
  }, [navigate]);

  useEffect(() => {
    async function getData(): Promise<StudentsRank[]> {
      return [
        {
          id: "728ed52f",
          placing: 1,
          avatar: 'https://github.com/Lucas-Pontes-Soares.png',
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

  return (
    <div>
      <CurrentClass acronym={`ED`} code={`${classCode}`} title={`Estrutura de Dados`} userType="teacher"/>
      <div className="container mx-auto mt-24 mb-28 max-w-2xl">
        <StudentsRankingDataTable columns={columns} data={data} />
      </div>

      <TeachersNavigation activePage="ranking" />
    </div>
  )
}
