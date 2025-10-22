import { Routes, Route } from "react-router-dom";
import Login from "./pages/not-authenticated/Login.tsx";
import CreateAccount from "./pages/not-authenticated/CreateAccount.tsx";
import TeachersHome from "./pages/teachers/TeachersHome.tsx";
import StudentsClasses from "./pages/students/StudentsClasses.tsx";
import StudentsHome from "./pages/students/StudentsHome.tsx";
import StudentsChatBot from "./pages/students/StudentsChatBot.tsx";
import StudentsProfile from "./pages/students/StudentsProfile.tsx";
import StudentsRanking from "./pages/students/StudentsRanking.tsx";
import NotFound from "./pages/not-found/NotFound.tsx"; 
import TeachersFile from "./pages/teachers/TeachersFile.tsx";
import TeachersRanking from "./pages/teachers/TeachersRanking.tsx";
import TeachersProfile from "./pages/teachers/TeachersProfile.tsx";
import TeachersClasses from "./pages/teachers/TeachersClasses.tsx";
import StudentsQuestion from "./pages/students/StudentsQuestion.tsx";
import TeachersAddQuestion from "./pages/teachers/TeachersAddQuestion.tsx";
import StudentsClassInfo from "./pages/students/StudentsClassInfo.tsx";
import TeachersClassInfo from "./pages/teachers/TeachersClassInfo.tsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/createUser" element={<CreateAccount />} />

      {/* Students Routes */}
      <Route path="/students/classes" element={<StudentsClasses />} />
      <Route path="/students/" element={<StudentsClasses />} />
      <Route path="/students/classes/:class_id" element={<StudentsHome />} />
      <Route path="/students/classes/:class_id/info" element={<StudentsClassInfo />} />
      <Route path="/students/classes/:class_id/chatbot" element={<StudentsChatBot />} />
      <Route path="/students/classes/:class_id/ranking" element={<StudentsRanking />} />
      <Route path="/students/classes/:class_id/profile" element={<StudentsProfile />} />
      <Route path="/students/classes/:class_id/questions/:questionId" element={<StudentsQuestion />} />

      {/* Teachers Routes */}
      <Route path="/teachers/classes" element={<TeachersClasses />} />
      <Route path="/teachers/" element={<TeachersClasses />} />
      <Route path="/teachers/classes/:class_id" element={<TeachersHome />} />
       <Route path="/teachers/classes/:class_id/info" element={<TeachersClassInfo />} />
      <Route path="/teachers/classes/:class_id/files" element={<TeachersFile />} />
      <Route path="/teachers/classes/:class_id/ranking" element={<TeachersRanking />} />
      <Route path="/teachers/classes/:class_id/profile" element={<TeachersProfile />} />
      <Route path="/teachers/classes/:class_id/addQuestion" element={<TeachersAddQuestion />} />

      {/* Catch-all route for 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
