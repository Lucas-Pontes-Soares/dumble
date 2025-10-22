import { Plus } from 'lucide-react';
import { useParams } from 'react-router';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useState } from 'react';
export interface Question {
  id: number;
  status: 'completed' | 'unlocked' | 'locked' | 'new';
  position: 1 | 2 | 3;
  side: 'none' | 'left' | 'right';
  type: 'multiple' | 'pairs' | 'fill' | 'none';
}

interface ItemQuestionTrailProps {
  question: Question;
}

export default function ItemQuestionTrail({ question }: ItemQuestionTrailProps) {
  const { class_id } = useParams<{ class_id: string }>();
  const [open, setOpen] = useState(false);

  function getPositionClass() {
    if (question.position === 2 && question.side === 'right') return 'ml-22';
    if (question.position === 3 && question.side === 'right') return 'ml-32';
    if (question.position === 2 && question.side === 'left') return 'mr-22';
    if (question.position === 3 && question.side === 'left') return 'mr-32';
    return '';
  }

  function getBackgroudColor() {
    if (question.status === 'completed') return 'bg-green-500';
    if (question.status === 'unlocked') return 'bg-gray-300 border-4 border-dashed dark:bg-gray-700';
    return 'bg-gray-300 dark:bg-gray-700';
  }

  function handleClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    if (question.status === 'completed') {
      e.preventDefault(); 
      setOpen(true);
    }
  }

  async function handleRemakeQuestion(){
    window.location.href = `/students/classes/${class_id}/questions/${question.id}`
  }

  async function handleRemakeAllQuestions(){
    window.location.href = `/students/classes/${class_id}/questions/1`
  }

  return (
    <div className={`relative w-20 h-20 ${getPositionClass()}`}>
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

      <div className="absolute top-2 left-0 w-20 h-20 rounded-full bg-gray-300 opacity-50 z-0"></div>

      {question.status === 'new' ? (
        <a href={`/teachers/classes/${class_id}/addQuestion`}>
          <div className="bg-gray-300 border-4 border-dashed dark:bg-gray-700 w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg cursor-pointer transition-transform hover:top-1 relative z-10">
            <div className="w-20 h-20 rounded-full flex items-center justify-center">
              <Plus />
            </div>
          </div>
        </a>
      ) : question.status !== 'locked' ? (
        <a href={`/students/classes/${class_id}/questions/${question.id}`} onClick={handleClick}>
          <div
            className={`${getBackgroudColor()} w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg cursor-pointer transition-transform hover:top-1 relative z-10`}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center">
              {question.id}
            </div>
          </div>
        </a>
      ) : (
        <div
          className={`${getBackgroudColor()} w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg cursor-pointer transition-transform relative z-10`}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center">
            {question.id}
          </div>
        </div>
      )}
    </div>
  );
}
