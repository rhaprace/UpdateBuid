import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import LogIn from "./components/Login/index.tsx";
import Register from "./components/register/index.tsx";
import AuthRoute from "./AuthRoute.tsx";
import { auth, db } from "./components/db/firebaseapp";
import Chatbot from "./components/chatbot/index.tsx";
import Meal from "./components/meal/index.tsx";
import Workout from "./components/workout/index.tsx";
import LandingPage from "./components/landingpage/index.tsx";
import Progress from "./components/progress/index.tsx";
import EditProfile from "./components/editprofile/index.tsx";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Routes>
          <Route path="/" element={<AuthRoute><App/></AuthRoute>}/>
          <Route path="/landingpage" element={<LandingPage/>}/>
          <Route path="/login" element={<LogIn/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/meal' element={<Meal/>}/>
          <Route path="/workout" element={<Workout/>}/>
          <Route path="/progress" element={<Progress/>}/>
          <Route path="/profile" element={<EditProfile/>}/>
          <Route path="/chatbot" element={<Chatbot/>}/>
          <Route path="*" element={<Navigate to="/"/>}/>
      </Routes>
    </Router>
  </StrictMode>
);
