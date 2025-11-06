"use client"

import { ColumnDef } from "@tanstack/react-table"
import { StudentPicture } from "./student-picture"

export type StudentsRank = {
  id: string
  placing: number
  picture: string
  name: string
  rank: "bronze" | "silver" | "gold" | "diamond"
  score: number
}

export const columns: ColumnDef<StudentsRank>[] = [
  {
    accessorKey: "placing",
    header: "Colocação",
  },
  {
    accessorKey: "student",
    header: "Estudante",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <StudentPicture picture={row.original.picture} studentName={row.original.name} />
        <span>{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "rank",
    header: "Rank",
  },
  {
    accessorKey: "score",
    header: "Pontuação",
  },
]