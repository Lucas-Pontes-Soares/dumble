"use client"

import { ColumnDef } from "@tanstack/react-table"
import { StudentPicture } from "./student-picture"

export type Students = {
  id: string
  picture: string
  name: string
  email: string
  enrollmentDate: string
}

export const columns: ColumnDef<Students>[] = [
  {
    accessorKey: "name",
    header: "Estudante",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <StudentPicture picture={row.original.picture} student_id={row.original.id} student_name={row.original.name} />
        <span>{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span>{row.original.email}</span>,
  },
  {
    accessorKey: "enrollmentDate",
    header: "Data que Entrou",
    cell: ({ row }) => <span>{row.original.enrollmentDate}</span>,
  },
]