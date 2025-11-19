import { ColumnDef } from "@tanstack/react-table"
import { StudentPicture } from "./student-picture"

export type StudentsRank = {
  id: string
  placing: number
  picture: string
  name: string
  answered_questions: number
  total_questions: number
  correct_answers: number
  first_answered_at: string
}

export const columns: ColumnDef<StudentsRank>[] = [
  {
    accessorKey: "placing",
    header: "Colocação",
    // --- CUSTOMIZAÇÃO INÍCIO ---
    cell: ({ row }) => {
      const placing = row.original.placing // Pega o número da colocação (1, 2, 3...)
      let bgColor = '';
      let Icon = null;
      let textColor = 'text-gray-900';

      if (placing === 1) {
        // Dourado
        bgColor = 'bg-yellow-300/80'; 
        Icon = () => <span className="text-xl">🥇</span>; 
        textColor = 'text-yellow-900';
      } else if (placing === 2) {
        // Prata
        bgColor = 'bg-gray-300/80'; 
        Icon = () => <span className="text-xl">🥈</span>; 
        textColor = 'text-gray-900';
      } else if (placing === 3) {
        // Bronze
        bgColor = 'bg-amber-800/20'; 
        Icon = () => <span className="text-xl">🥉</span>; 
        textColor = 'text-amber-800';
      } else {
        bgColor = ''; 
        textColor = 'text-gray-500'; 
      }

      return (
        <div 
          className={`flex items-center justify-center py-2 rounded-lg ${bgColor} ${textColor}`}
        >
          {Icon && <Icon />}
          <span className={Icon ? "ml-1 font-bold" : "font-semibold"}>
            {placing}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "student",
    header: "Estudante",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <StudentPicture 
          picture={row.original.picture} 
          student_name={row.original.name} 
          student_id={row.original.id} 
        />
        <span>{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "progress",
    header: "Progresso",
    cell: ({ row }) => (
      <span>
        {row.original.answered_questions} / {row.original.total_questions}
      </span>
    ),
  },
  {
    accessorKey: "correctness",
    header: "Acertos",
    cell: ({ row }) => (
      <span>
        {row.original.correct_answers} / {row.original.answered_questions}
      </span>
    ),
  },
]