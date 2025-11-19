import TeachersNavigation from "@/components/teachers-navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyJWTToken } from "@/verifyJWTToken";
import { ChevronDownIcon, Eye, EyeOff, LogOut, Pen, Upload } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import api from "@/apiService";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, set } from "date-fns";
import { ModeToggle } from "@/components/mode-toggle";
import { TeacherPicture } from "@/components/teacher-picture";

export default function TeachersProfile() {
  const [teacherId, setTeacherId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState<Date | undefined>();
  const [birthdayString, setBirthdayString] = useState("");
  const [picture, setPicture] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

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
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const fetchTeacherData = useCallback(async () => {
    if (decodedToken && jwtToken) {
      try {
        const response = await api.get<any>(`/teachers/${decodedToken.id}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        if (response.data.success) {
          const { name, email, picture, birthday, created_at, updated_at } = response.data.teacher;
          setTeacherId(decodedToken.id);
          setName(name);
          setEmail(email);
          setPicture(picture);

          const dateObjectBirthday = new Date(birthday);
          const birthdayFormated = dateObjectBirthday.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });

          const dateObjectCreatedAt = new Date(created_at);
          const createdAtFormated = dateObjectCreatedAt.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });

          const dateObjectUpdatedAt = new Date(updated_at);
          const updatedAtFormated = dateObjectUpdatedAt.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });

          setCreatedAt(createdAtFormated);
          setUpdatedAt(updatedAtFormated);
          setBirthdayString(birthdayFormated);
          const bday = birthday ? new Date(birthday) : undefined;
          setBirthday(bday);
        } else {
          toast.error("Failed to fetch teacher data.");
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "An error occurred.");
      }
    }
  }, [decodedToken, jwtToken]);

  useEffect(() => {
    const decoded = verifyJWTToken("teacher", navigate);
    if (decoded) {
      setDecodedToken(decoded);
      const token = localStorage.getItem("JWTToken");
      setJwtToken(token);
    }
  }, [navigate]);

  useEffect(() => {
    if (decodedToken && jwtToken) {
      fetchTeacherData();
    }
  }, [decodedToken, jwtToken, fetchTeacherData]);

  const handleCancelEdit = () => {
    fetchTeacherData();
    setIsEditing(false);
    setIsVisibleChangePassword(false);
  };

  const handleUpdateProfile = async () => {
    if(newPassword != confirmPassword){
      toast.error("As senhas não coincidem");
      return;
    }
    try {
      const response = await api.put<any>(`/teachers/${decodedToken?.id}`, 
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
        toast.success("Profile updated successfully!");
        setNewPassword("");
        setCurrentPassword("");
        setConfirmPassword("");
        setIsVisibleChangePassword(false);
        setIsEditing(false);
        fetchTeacherData();
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred while updating.");
    }
  };

  const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('picture', file);

    try {
      const response = await api.put<any>(`/teachers/${decodedToken?.id}/picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (response.data.success) {
        toast.success("Profile picture updated successfully!");
        fetchTeacherData();
      } else {
        toast.error("Failed to update profile picture.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred while updating the picture.");
    }
  };

  async function handleLogout() {
    localStorage.removeItem("JWTToken");
    toast.success("Logged out successfully.");
    navigate("/login");
  }

  return (
      <div className="font-nunito min-h-screen pb-24">
        <div className="w-full bg-[#BF8FFF]">
          <div className="flex justify-end items-end px-6 pt-6 max-w-2xl mx-auto gap-2">
            {!isEditing ? (
              <Button variant="outline" size="icon" className="dark:text-white dark:bg-black" onClick={() => setIsEditing(true)}><Pen /></Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleUpdateProfile}>Confirmar</Button>
                <Button variant="outline" onClick={handleCancelEdit}>Cancelar</Button>
              </div>
            )}
            <div className="block">
              <ModeToggle />
              <Button variant="outline" size="icon" className="ml-2 dark:text-white dark:bg-black" onClick={() => handleLogout()}><LogOut /></Button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 w-full">
            <TeacherPicture picture={picture} teacher_id={teacherId} teacher_name={name} className="h-48 w-48 my-6 max-w-2xl mx-auto" />
            {isEditing && (
              <div className="relative -mt-12 mb-6">
                <Input
                  ref={fileInputRef}
                  id="picture-upload"
                  type="file"
                  className="hidden"
                  onChange={handlePictureUpload}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="w-full px-6 max-w-2xl mx-auto">
            {isEditing ? (
              <p className="text-muted-foreground">Ultima atualização em {updatedAt}</p>
            ): null}
            <div>
              {isEditing ? (
                <div>
                  <Label htmlFor="name" className="mt-4 mb-2">Nome</Label>
                  <Input
                    id="name"
                    type="name"
                    placeholder="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <p className="font-bold text-xl">{name}</p>
                  <p className="text-muted-foreground">{email} - Entrou em {createdAt}</p>
                </div>
              )}
            </div>

            <div>
              {isEditing ? (
                <div>
                <Label htmlFor="email" className="mt-4 mb-2">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                </div>
              ) : (
                null
              )}
            </div>

            <div>
              <Label htmlFor="birthday" className="mt-4 mb-2">Data de Nascimento</Label>
              {isEditing ? (
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
              ) : (
                <p>{birthdayString}</p>
              )}
            </div>

            <div>
              {isEditing ? (
                <div className="mt-4 mb-4">
                  <Button variant={"outline"} onClick={() => setIsVisibleChangePassword(!isVisibleChangePassword)}>Trocar Senha</Button>
                </div>
              ) : null}
              {isVisibleChangePassword ? (
                <div className="pb-10">
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

      <TeachersNavigation activePage="profile"/>
    </div>
  )
}