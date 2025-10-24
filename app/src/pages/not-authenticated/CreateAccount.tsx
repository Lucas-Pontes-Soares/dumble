import { useNavigate, Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eye, EyeOff, ChevronDownIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import api from "../../apiService";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function CreateAccount() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthday, setBirthday] = useState<Date>();
  const [accountType, setAccountType] = useState("option-student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigateTo = useNavigate();

  async function handleCreateUser() {
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    if (!name) {
      toast.error("Nome é obrigatório");
      setIsLoading(false);
      return;
    }
    if (!email) {
      toast.error("Email é obrigatório");
      setIsLoading(false);
      return;
    }
    if (!password) {
      toast.error("Senha é obrigatória");
      setIsLoading(false);
      return;
    }
    if (!birthday) {
      toast.error("Data de nascimento é obrigatória");
      setIsLoading(false);
      return;
    }
    if (!accountType) {
      toast.error("Tipo de conta é obrigatório");
      setIsLoading(false);
      return;
    }

    let accountTypeSelected = "";

    if (accountType === "option-student") {
      accountTypeSelected = "students";
    } else if (accountType === "option-teacher") {
      accountTypeSelected = "teachers";
    }

    try {
      const response = await api.post<any>(`/${accountTypeSelected}`, {
        name,
        email,
        password,
        birthday: birthday,
      });

      if (response.data.success === false) {
        return;
      }

      toast.success("Conta criada com sucesso! Redirecionando para o login...");
      navigateTo("/login");
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
          <h1 className="text-2xl font-bold mb-4 text-center">Crie seu perfil</h1>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-2">
              Nome
            </Label>
            <Input
              id="name"
              type="name"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#F7F7F7] border-[#E5E5E5]"
            />
          </div>

          <div>
            <Label htmlFor="email" className="mb-2">
              Email
            </Label>
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
            <Label htmlFor="birthday" className="mb-2">Data de Nascimento</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild className="bg-[#F7F7F7] border-[#E5E5E5]">
                <Button
                  variant="outline"
                  id="birthday"
                  className="w-full justify-between font-normal"
                >
                  {birthday ? birthday.toLocaleDateString() : <span>Selecione uma data</span>}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthday}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setBirthday(date);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="password" className="mb-2">
              Senha
            </Label>
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

          <div>
            <Label htmlFor="confirm-password" className="mb-2">
              Confirme a Senha
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme a Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10 bg-[#F7F7F7] border-[#E5E5E5]"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? (
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

          <Button className="w-full bg-purple-predominant rounded-xl border-b-4 border-b-dark-shadow p-6 font-nunito text-lg font-bold hover:bg-purple-600" onClick={handleCreateUser} disabled={isLoading}>
            {isLoading ? <Spinner/> : null}
            Criar Conta
          </Button>

          <small className="block text-center text-sm mt-2 text-[#AFAFAF]">
            Ao fazer login no Dumble, você concorda com nossos <strong>Termos e Política de Privacidade.</strong>
          </small>

          <div className="mt-4">
            <strong className="block text-center text-sm">
              Tem uma conta?{" "}
              <Link to="/login" className="text-purple-predominant hover:underline">
                CONECTAR
              </Link>
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
