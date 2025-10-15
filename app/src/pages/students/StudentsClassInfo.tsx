import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StudentsDataTable } from "../../components/students-data-table";
import { columns, Students } from "../../components/students-columns";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { verifyJWTToken } from "@/verifyJWTToken";

export default function StudentsClassInfo() {
  const [data, setData] = useState<Students[]>([]);
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("student", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
    }
  }, [navigate]);

  useEffect(() => {
    async function getData(): Promise<Students[]> {
      return [
        {
          id: "728ed52f",
          avatar: 'https://github.com/Lucas-Pontes-Soares.png',
          name: 'Lucas Pontes Soares',
          email: "lucas.soares63@fatec.sp.gov.br",
          enrollmentDate: '23/07/2025'
        },
        // ...
      ]
    }

    getData().then((data) => {
      setData(data);
    })
  }, [])

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Informações da Sala</h1>
        <div className="py-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-32 w-32">
                    {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
                    <AvatarFallback className="bg-amber-500 text-white">ED</AvatarFallback>
                </Avatar>
                <div className="w-full space-y-2">
                    <p className="mb-2">Estrutura de Dados - <span className="text-gray-600">ED-1234</span></p>
                    <p className="">Esta aula fala sobre os fundamentos das estruturas de dados, abordando como organizar, acessar e manipular informações na memória de forma eficiente.</p>
                </div>
            </div>
        </div>
        <div className="py-4">
            <p className="py-4">Professor:</p>
            <div className="w-full max-w-2xl border-2 dark:border-gray-800 white:border-gray-400 rounded-xl p-2 flex items-center gap-4 mb-2">
                <Avatar className="w-12 h-12">
                    {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
                    <AvatarFallback className="bg-blue-500 text-white">AM</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <p>Alex Marino</p>
                    <p className="text-gray-600">alex.marino@fatec.sp.gov.br</p>
                </div>
               
                </div>
        </div>

        <div className="py-4">
            <p className="py-4">Alunos:</p>
            <StudentsDataTable columns={columns} data={data} />
        </div>
    </div>
  );
}
