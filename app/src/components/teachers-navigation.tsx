import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Files, Home, Trophy, User } from "lucide-react"
import { Link, useParams } from "react-router-dom";

export type TeacherPage = 'home'  | 'files' | 'profile' | 'ranking';

interface TeachersNavigationProps {
  activePage: TeacherPage;
}

export default function TeachersNavigation({ activePage }: TeachersNavigationProps) {
  const { class_id } = useParams<{ class_id: string }>();

  return (
    <div className="fixed bottom-0 left-0 w-full border-t-2 bg-background z-20">
      <div className="flex justify-center p-4">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem className="px-2 sm:px-4">
              <NavigationMenuLink asChild className={`flex h-12 w-12 items-center justify-center cursor-pointer sm:h-16 sm:w-16
                                                ${activePage === 'files' ? 'border-2 rounded-2xl border-violet-400' : ''}`}>
                <Link to={`/teachers/classes/${class_id}/files`}>
                  <Files className="h-6 w-6 sm:h-8 sm:w-8" />
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem className="px-2 sm:px-4">
              <NavigationMenuLink asChild className={`flex h-12 w-12 items-center justify-center cursor-pointer sm:h-16 sm:w-16
                                                ${activePage === 'home' ? 'border-2 rounded-2xl border-violet-400' : ''}`} >
                <Link to={`/teachers/classes/${class_id}`}>
                  <Home className="h-6 w-6 sm:h-8 sm:w-8" />
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem className="px-2 sm:px-4">
              <NavigationMenuLink asChild className={`flex h-12 w-12 items-center justify-center cursor-pointer sm:h-16 sm:w-16
                                                ${activePage === 'ranking' ? 'border-2 rounded-2xl border-violet-400' : ''}`}>
                <Link to={`/teachers/classes/${class_id}/ranking`}>
                  <Trophy className="h-6 w-6 sm:h-8 sm:w-8" />
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem className="px-2 sm:px-4">
              <NavigationMenuLink asChild className={`flex h-12 w-12 items-center justify-center cursor-pointer sm:h-16 sm:w-16
                                                ${activePage === 'profile' ? 'border-2 rounded-2xl border-violet-400' : ''}`}>
                <Link to={`/teachers/classes/${class_id}/profile`}>
                  <User className="h-6 w-6 sm:h-8 sm:w-8" />
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
