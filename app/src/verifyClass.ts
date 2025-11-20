import { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import api from "./apiService";

interface DecodedToken {
  id: string;
  role: string;
  exp: number;
}

export async function verifyClass(
  navigate: NavigateFunction,
  class_id: string | undefined,
  decodedToken: DecodedToken | null
) {
  if (!class_id || !decodedToken) {
    return false;
  }

  const token = localStorage.getItem("JWTToken");

  try {
    // 1. Verificar se a classe existe
    await api.get<any>(`/classes/${class_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 2. Se for um aluno, verificar se ele está matriculado
    if (decodedToken.role === "student") {
      await api.get<any>(`/classes/${class_id}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    return true;

  } catch (error: any) {
    console.error("Falha na verificação da turma:", error);
    toast.error("Turma não encontrada ou não matriculada.");
    navigate(`/${decodedToken.role}s/classes`);
    return false;   // <<< IMPORTANTE!
  }
}
