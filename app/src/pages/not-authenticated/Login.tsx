import { useNavigate, Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner"; 
import api from "../../apiService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("option-student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 

  const navigateTo = useNavigate();

  async function handleLoginUser() {
    setIsLoading(true);

    if(!email){
      toast.error("Email é obrigatório");
      setIsLoading(false);
      return;
    }
    if(!password){
      toast.error("Senha é obrigatória");
      setIsLoading(false);
      return;
    }
    if(!accountType){
      toast.error("Tipo de conta é obrigatório");
      setIsLoading(false);
      return;
    }

    console.log(email, password, accountType);

    let accountTypeSelected = "";

    if (accountType === "option-student") {
      accountTypeSelected = "students";
    } else if (accountType === "option-teacher") {
      accountTypeSelected = "teachers";
    }

    try {
      const response = await api.post<any>(`/${accountTypeSelected}/login`, {
        email,
        password,
      });

      console.log(response.data);

      if (response.data.success === false) {
        return;
      }

      const JWTToken = response.data.JWTToken;

      localStorage.setItem("JWTToken", JWTToken);
      
      toast.success("Logado com sucesso!");
      if (accountType === "option-student") {
        navigateTo("/students/classes");
      } else if (accountType === "option-teacher") {
        navigateTo("/teachers/classes");
      }
    } catch (error: any) {
      console.error("Erro na requisição:", error);
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="font-nunito min-h-screen p-6 max-w-2xl mx-auto">
      <div className="w-full">
        <div className="flex justify-end mb-4">
          <ModeToggle />
        </div>
        <div className="mb-16">
          <h1 className="text-2xl font-bold mb-4 text-center">Entre no seu perfil</h1>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-2">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#F7F7F7] border-[#E5E5E5]"
            />
          </div>

          <div>
            <Label htmlFor="password" className="mb-2">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"} 
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 bg-[#F7F7F7] border-[#E5E5E5]"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword((prev) => !prev)} 
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-purple-predominant" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4 text-purple-predominant" aria-hidden="true" />
                )}
                <span className="sr-only">Toggle password visibility</span>
              </Button>
            </div>
          </div>

          <div className="mb-10">
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-600">COMO ?</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <RadioGroup
              value={accountType}
              onValueChange={setAccountType}
              className="mt-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-student" id="option-student" />
                <Label htmlFor="option-student">Aluno</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-teacher" id="option-teacher" />
                <Label htmlFor="option-teacher">Professor</Label>
              </div>
            </RadioGroup>
          </div>

          <Button className="w-full bg-purple-predominant rounded-xl border-b-4 border-b-dark-shadow p-6 font-nunito text-lg font-bold hover:bg-purple-600" onClick={handleLoginUser} disabled={isLoading}>
            {isLoading ? <Spinner/> : null}
            Entrar
          </Button>

          <small className="block text-center text-sm mt-2 text-[#AFAFAF]">
            Ao fazer login no Dumble, você concorda com nossos <strong>Termos e Política de Privacidade.</strong>
          </small>

          <div className="mt-4">
            <strong className="block text-center text-sm">
              Não tem uma conta?{" "}
              <Link to="/createUser" className="text-purple-predominant hover:underline">
                CRIAR
              </Link>
            </strong>
          </div>
          
        </div>
      </div>
    </div>
  );
}

