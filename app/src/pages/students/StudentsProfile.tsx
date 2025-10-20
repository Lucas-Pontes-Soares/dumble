import StudentsNavigation from "@/components/students-navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyJWTToken } from "@/verifyJWTToken";
import { CalendarIcon, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "@/apiService";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function StudentsProfile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState<Date | undefined>();
  const [picture, setPicture] = useState("");

  const [initialData, setInitialData] = useState({ name: "", email: "", birthday: undefined as Date | undefined, picture: "" });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVisibleChangePassword, setIsVisibleChangePassword] = useState(false);
  
  const [decodedToken, setDecodedToken] = useState<{ id: string; role: string; exp: number } | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const decoded = verifyJWTToken("student", navigate);
    if (decoded) {
      setDecodedToken(decoded);
      const token = localStorage.getItem("JWTToken");
      setJwtToken(token);
    }
  }, [navigate]);

  useEffect(() => {
    if (decodedToken && jwtToken) {
      const fetchStudentData = async () => {
        try {
          const response = await api.get<any>(`/students/${decodedToken.id}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          });
          if (response.data.success) {
            const { name, email, picture, birthday } = response.data.student;
            setName(name);
            setEmail(email);
            setPicture(picture);
            const bday = birthday ? new Date(birthday) : undefined;
            setBirthday(bday);
            setInitialData({ name, email, picture, birthday: bday });
          } else {
            toast.error("Failed to fetch student data.");
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || "An error occurred.");
        }
      };
      fetchStudentData();
    }
  }, [decodedToken, jwtToken]);

  const handleCancelEdit = () => {
    setName(initialData.name);
    setEmail(initialData.email);
    setBirthday(initialData.birthday);
    setPicture(initialData.picture);
    setIsEditing(false);
    setIsVisibleChangePassword(false)
  };

  const handleUpdateProfile = async () => {
    if(newPassword != confirmPassword){
      toast.error("As senhas não coincidem");
      return;
    }
    try {
      const response = await api.put<any>(`/students/${decodedToken?.id}`, 
        {
          name: name,
          email: email,
          birthday: birthday ? format(birthday, 'yyyy-MM-dd') : undefined,
          currentPassword: currentPassword,
          newPassword: newPassword
        }, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (response.data.success) {
        const { name, email, picture, birthday } = response.data.student;
        const bday = birthday ? new Date(birthday) : undefined;
        setInitialData({ name, email, picture, birthday: bday });
        toast.success("Profile updated successfully!");
        setNewPassword("");
        setCurrentPassword("");
        setConfirmPassword("");
        setIsVisibleChangePassword(false)
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred while updating.");
    }
  };

  return (
      <div className="min-h-screen p-6 max-w-2xl mx-auto mb-24">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold">Perfil do Estudante</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Editar</Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleUpdateProfile}>Confirmar</Button>
              <Button variant="outline" onClick={handleCancelEdit}>Cancelar</Button>
            </div>
          )}
        </div>
         <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={picture} />
              <AvatarFallback>{name ? name.substring(0, 2).toUpperCase() : "LP"}</AvatarFallback>
            </Avatar>
            <div className="w-full space-y-2 p-4 bg-neutral-900 rounded-md border-1 border-neutral-700">
              <div>
                <Label htmlFor="name" className="mb-2">Nome</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    type="name"
                    placeholder="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                ) : (
                  <p>{name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="mt-8 mb-2">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                ) : (
                  <p>{email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="birthday" className="mt-8 mb-2">Data de Nascimento</Label>
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${!birthday && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthday ? format(birthday, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={birthday}
                        onSelect={setBirthday}
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <p>{birthday ? format(birthday, "PPP") : "Não informado"}</p>
                )}
              </div>

              <div>
                {isEditing ? (
                  <div>
                    <Label htmlFor="birthday" className="mt-8 mb-2">Senha: </Label>
                    <Button variant={"outline"} onClick={() => setIsVisibleChangePassword(!isVisibleChangePassword)}>Trocar Senha</Button>
                  </div>
                ) : null}
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
          </div>
      </div>

      <StudentsNavigation activePage="profile"/>
    </div>
  )
}
