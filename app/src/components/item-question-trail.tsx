import { Plus } from 'lucide-react';
import { useParams } from 'react-router';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useEffect, useState } from 'react';
import api from '@/apiService';
import { verifyJWTToken } from '@/verifyJWTToken';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export interface Question {
  id: number;
  status: 'completed' | 'unlocked' | 'locked' | 'new';
  position: 1 | 2 | 3;
  side: 'none' | 'left' | 'right';
  type: 'multiple' | 'pairs' | 'fill' | 'none';
}

interface ItemQuestionTrailProps {
  question: Question;
  userType: 'teacher' | 'student';
}

const DUMBLE_IMAGES = [
  '/DumbleBook.png',
  '/DumbleJump.png',
  '/DumbleLovesick.png',
  '/DumbleCruzado.png'
];

export default function ItemQuestionTrail({ question, userType }: ItemQuestionTrailProps) {
  const { class_id } = useParams<{ class_id: string }>();
  const [open, setOpen] = useState(false);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [randomImage, setRandomImage] = useState<string>('/DumblePosition1.png'); // Default image
  const [lastImageIndex, setLastImageIndex] = useState<number>(-1);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("JWTToken");
    if (token) {
      setJwtToken(token);
    }
  }, []);

  useEffect(() => {
    if (question.position === 3) {
      selectRandomImage();
    }
  }, [question.id, question.position]); // Re-select image if question changes

  function selectRandomImage() {
    let newIndex: number;
    do {
      newIndex = Math.floor(Math.random() * DUMBLE_IMAGES.length);
    } while (newIndex === lastImageIndex);

    setRandomImage(DUMBLE_IMAGES[newIndex]);
    setLastImageIndex(newIndex);
  }

  function getPositionClass() {
    if (question.position === 2 && question.side === 'right') return 'ml-22';
    if (question.position === 3 && question.side === 'right') return 'ml-32';
    if (question.position === 2 && question.side === 'left') return 'mr-22';
    if (question.position === 3 && question.side === 'left') return 'mr-32';
    return '';
  }

  function handleClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    if (question.status === 'completed' && userType === 'student') {
      e.preventDefault(); 
      setOpen(true);
    }
  }

  async function handleRemakeQuestion(){
    try {
      await api.delete(`/classes/${class_id}/question/${question.id}/answers`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      navigate(`/students/classes/${class_id}/questions/${question.id}`);
    } catch (error) {
      toast.error("Failed to delete answer.");
    }
  }

  async function handleRemakeAllQuestions(){
    try {
      await api.delete(`/classes/${class_id}/answers`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete all answers.");
    }
  }

  return (
    <div className={`font-nunito relative w-20 h-20 ${getPositionClass()}`}>
      <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Você deseja refazer?</AlertDialogTitle>
              <AlertDialogDescription>
                  Ao aceitar, você vai poder responder essas questões novamente
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleRemakeAllQuestions()}>Refazer Todas</AlertDialogAction>
               <AlertDialogAction onClick={() => handleRemakeQuestion()}>Refazer Essa</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      {question.status === 'locked' ? (
        <div className="absolute top-2 left-0 w-20 h-20 rounded-full bg-[#B7B7B7] dark:bg-[#111111] z-0"></div>
      ) : (
        <div className="absolute top-2 left-0 w-20 h-20 rounded-full bg-[#AF33FF] z-0"></div>
      )}

      {question.status === 'unlocked' || question.status === 'new' ? (
        <div className="absolute top-[-10px] left-[-16px] w-28 h-28 rounded-full border-6 border-[#E5E5E5] dark:border-[#1f1f1f] z-0"></div>
      ) : null}

      {question.status === 'new' ? (
        <a href={`/teachers/classes/${class_id}/addQuestion`}>
          <div className="bg-[#CE82FF] w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg cursor-pointer transition-transform hover:top-1 relative z-10">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white">
              <Plus />
            </div>
          </div>
        </a>
      ) : question.status === 'completed' ? (
        <a href={`/${userType}s/classes/${class_id}/questions/${question.id}`} onClick={handleClick}>
          <div
            className={`bg-[#CE82FF] w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl cursor-pointer transition-transform hover:top-1 relative z-10`}
          >
            <img src="/Shine.png" alt="Brilho" className="absolute w-16 h-16 rounded-full object-cover z-20" />
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white z-30">
              {question.id}
            </div>
          </div>
        </a>
      ) : question.status === 'unlocked' ? (
        <a href={`/students/classes/${class_id}/questions/${question.id}`} onClick={handleClick} className=''>
          <div
            className={`bg-[#CE82FF] w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl cursor-pointer transition-transform hover:top-1 relative z-10`}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white">
              {question.id}
            </div>
          </div>
        </a>
      ) : (
        <div
          className={`bg-gray-300 dark:bg-[#1f1f1f] w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl cursor-pointer transition-transform relative z-10`}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white">
            {question.id}
          </div>
        </div>
      )}

      {question.position === 3 ? (
        <img 
          src={randomImage} alt="Mascote Dumble" 
          className={`absolute ${question.side === 'right' ? 'right-34' : 'left-34'} -top-6 min-w-30 ${question.status === 'locked' ? 'grayscale brightness-[1.60]' : null}`} 
        /> 
      ) : (
        null
      )}
    </div>
  );
}
