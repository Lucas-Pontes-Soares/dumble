import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { NavigateFunction } from "react-router-dom";

interface DecodedToken {
  id: string;
  role: string;
  exp: number;
}

export function verifyJWTToken(
  accountType: "student" | "teacher",
  navigate: NavigateFunction
) {
  const token = localStorage.getItem("JWTToken");

  if (!token) {
    toast.error("Você precisa estar logado para acessar esta página.");
    console.log("Token não encontrado, redirecionando para login.");
    navigate("/login");
    return null;
  }

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);

    if (decodedToken.exp * 1000 < Date.now()) {
      toast.error("Sua sessão expirou. Por favor, faça login novamente.");
      localStorage.removeItem("JWTToken");
      navigate("/login");
      return null;
    }

    if (decodedToken.role !== accountType) {
      toast.error("Você não tem permissão para acessar esta página.");
      navigate("/login");
      return null;
    }

    return decodedToken;
  } catch (error) {
    toast.error("Token inválido. Por favor, faça login novamente.");
    localStorage.removeItem("JWTToken");
    navigate("/login");
    return null;
  }
}
