import TeachersNavigation from "@/components/teachers-navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyJWTToken } from "@/verifyJWTToken";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function TeachersProfile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVisibleChangePassword, setIsVisibleChangePassword] = useState(false);

  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = verifyJWTToken("teacher", navigate);
    if (decodedToken) {
      setDecodedToken(decodedToken);
    }
  }, [navigate]);

  return (
      <div className="min-h-screen p-6 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Perfil do Professor</h1>
         <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src="https://github.com/Lucas-Pontes-Soares.png" />
              <AvatarFallback>LP</AvatarFallback>
            </Avatar>
            <div className="w-full space-y-2">
              <div>
                <Label htmlFor="name" className="mb-2">Nome</Label>
                <Input
                  id="name"
                  type="name"
                  placeholder="Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

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
            </div>
          </div>

          <div>
            <Button variant={"outline"} onClick={() => setIsVisibleChangePassword(!isVisibleChangePassword)}>Trocar Senha</Button>
            {isVisibleChangePassword ? (
              <div>
              <Label htmlFor="password" className="my-2">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Senha"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10" 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword((prev) => !prev)} 
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>

                <Label htmlFor="password" className="my-2">Senha Nova</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10" 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword((prev) => !prev)} 
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>

                <Label htmlFor="password" className="my-2">Confirme a Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10" 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword((prev) => !prev)} 
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
              </div>
            ) : null}
            </div>
      </div>

      <TeachersNavigation activePage="profile"/>
    </div>
  )
}
