import { useNavigate, Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner"; 

export default function Introduction() {

  const navigateTo = useNavigate();


  return (
    <div className="font-nunito min-h-screen p-6 max-w-2xl mx-auto">
      <div className="w-full">
        <div className="flex justify-end mb-4">
          <ModeToggle />
        </div>
        <div className="mb-16 text-center">
          <img src="/DumbleLogo.png" alt="Logo do Dumble" className="block mx-auto" />
        </div>
        <div className="space-y-4">
        
          <div className="mb-10">
            <img src="/DumbleIntroduction.png" alt="Logo do Dumble" className="block mx-auto" />
          </div>

          <div className="text-center mb-20">
            <span className="font-bold text-2xl">A maneira divertida e eficaz de aprender tecnologia</span>
          </div>

          <div>
            <Button className="mb-4 w-full bg-purple-predominant rounded-xl border-b-4 border-b-dark-shadow p-6 font-nunito text-base font-bold hover:bg-purple-600" onClick={() => navigateTo("/createUser")}>
              COMEÇAR
            </Button>
            
            <Button className="w-full bg-transparent text-purple-predominant rounded-xl border-2 p-6 font-nunito text-base font-bold hover:border-purple-600 hover:bg-transparent" onClick={() => navigateTo("/login")}>
              EU JÁ TENHO UMA CONTA
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

