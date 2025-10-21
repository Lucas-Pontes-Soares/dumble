"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import getInitials from "@/getInitials"

export type Students = {
  id: string
  avatar: string
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
        <Avatar>
          <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
        </Avatar>
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