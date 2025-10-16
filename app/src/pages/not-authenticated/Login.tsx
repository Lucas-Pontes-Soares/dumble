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
      return;
    }
    if(!password){
      toast.error("Senha é obrigatória");
      return;
    }
    if(!accountType){
      toast.error("Tipo de conta é obrigatório");
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
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="w-full">
        <div className="flex justify-end mb-4">
          <ModeToggle />
        </div>
        <h1 className="text-4xl font-bold mb-4">Login</h1>
        <p className="mb-6">Por favor entre com seu email e senha.</p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-2">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword((prev) => !prev)} 
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="sr-only">Toggle password visibility</span>
              </Button>
            </div>
          </div>

          <div>
            <p className="text-md text-gray-600">Logar Como ?</p>
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

          <Button className="w-full" onClick={handleLoginUser} disabled={isLoading}>
            {isLoading ? <Spinner/> : null}
            Login
          </Button>

          <p className="text-center text-sm mt-4">
            Não possui uma conta?{" "}
            <Link to="/createUser" className="text-blue-500 hover:underline">
              Clique aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

