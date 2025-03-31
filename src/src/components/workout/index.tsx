import { useState, useEffect } from "react";
import { auth, db } from "@/components/db/firebaseapp";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLongLeftIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
interface Exercise {
  id: string;
  name: string;
  target: string;
  equipment: string;
  bodyPart: string;
  level: "Beginner" | "Pro";
  steps: string[];
}

const predefinedExercises: Exercise[] = [
  { id: "1", name: "Push-ups", target: "Chest", equipment: "None", bodyPart: "Upper Body", level: "Beginner", steps: ["Start in a plank position with hands under shoulders.", "Lower your body until your chest is near the floor.", "Push back up to the starting position."] },
  { id: "2", name: "Pull-ups", target: "Back", equipment: "Pull-up Bar", bodyPart: "Upper Body", level: "Pro", steps: ["Grip the bar with palms facing away.", "Pull yourself up until your chin is above the bar.", "Slowly lower yourself back down."] },
  { id: "3", name: "Squats", target: "Legs", equipment: "None", bodyPart: "Lower Body", level: "Beginner", steps: ["Stand with feet shoulder-width apart.", "Lower your hips back and down like sitting in a chair.", "Keep your chest up and knees over toes.", "Push back up to standing."] },
  { id: "4", name: "Deadlifts", target: "Full Body", equipment: "Barbell", bodyPart: "Lower Body", level: "Pro", steps: ["Stand with feet hip-width apart, barbell in front.", "Bend at the hips and knees to grip the bar.", "Lift by straightening your legs and hips.", "Lower the bar back down in control."] },
  { id: "5", name: "Plank", target: "Core", equipment: "None", bodyPart: "Core", level: "Beginner", steps: ["Lie face down, then lift onto forearms and toes.", "Keep your body in a straight line.", "Hold this position as long as possible."] },
  { id: "6", name: "Sit-ups", target: "Abs", equipment: "None", bodyPart: "Core", level: "Beginner", steps: ["Lie on your back with knees bent.", "Place hands behind your head or on your chest.", "Lift your upper body towards your knees.", "Lower back down with control."] },
  { id: "7", name: "Bicep Curls", target: "Arms", equipment: "Dumbbells", bodyPart: "Arms", level: "Pro", steps: ["Stand holding dumbbells with palms facing forward.", "Curl the weights up towards your shoulders.", "Lower them slowly back down."] },
];

const Workout = () => {
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>(predefinedExercises);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          recommendExercises(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!search) {
      setExercises(predefinedExercises);
    }
  }, [search]);

  const handleSearch = () => {
    const filteredExercises = predefinedExercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(search.toLowerCase())
    );
    setExercises(filteredExercises);
  };

  const recommendExercises = (user: any) => {
    const { weight, height, age, goal } = user;
    const bmi = weight / ((height / 100) * (height / 100));
    
    let filteredExercises = predefinedExercises;
    if (goal === "Weight Loss") {
      filteredExercises = predefinedExercises.filter((ex) => ex.level === "Beginner" || ex.bodyPart !== "Arms");
    } else if (goal === "Gain Weight") {
      filteredExercises = predefinedExercises.filter((ex) => ex.level === "Pro" || ex.bodyPart !== "Core");
    }
    setExercises(filteredExercises);
  };

     const navigateToProgress = () => {
        navigate("/progress");
  };
  return (
    <motion.div className="flex flex-col items-center min-h-screen p-5 h-auto bg-gradient-to-br from-[#000059] to-[#D9D9D9] text-white"
     initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1.2 }}
    >
      <ArrowLongLeftIcon onClick={() => navigate('/meal')} className="h-8 w-8 text-gray-50 hover:text-gray-300 transition duration-200 fixed left-0 ml-5 mt-5"/>
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-10 pt-8">
         Workout Recommendations
      </h1>
      <div className="relative w-full max-w-4xl mb-10">
        <input
          className="w-full h-16 text-lg font-bold px-6 rounded-full border border-gradient-to-br from-[#000059] to-[#D9D9D9] shadow-md focus:outline-none focus:ring-2  text-gray-900 bg-white/30 backdrop-blur-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Exercises"
          type="text"
        />
        <button
          className="absolute right-0 top-0 h-16 w-32 bg-[#FFD700] px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-yellow-500 transition-all text-white rounded-r-full  text-lg"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {exercises.length > 0 ? (
          exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="group relative p-5 bg-white/30 backdrop-blur-md rounded-xl shadow-lg flex flex-col items-center text-center hover:bg-white/40 transition duration-300"
            >
              <h2 className="text-xl font-bold">{exercise.name}</h2>
              <p className="text-gray-200">{exercise.target}</p>
              <p className="text-gray-200">{exercise.equipment}</p>
              <p className={`px-4 py-1 mt-2 rounded-full text-white ${exercise.level === "Pro" ? "bg-red-500" : "bg-green-500"}`}>{exercise.level}</p>
              <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300">
                <h3 className="text-lg font-bold mb-2">How to Do It:</h3>
                <ul className="text-sm space-y-1 text-gray-300">
                  {exercise.steps.map((step, index) => (
                    <li key={index} className="text-center">
                      {index + 1}. {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-300">No exercises found.</p>
        )}
      </div>
      <button onClick={navigateToProgress}
        className="mt-6 bg-green-500/80 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 hover:scale-105 transition-all duration-300 shadow-xl"
      >
            Track Progress
      </button>
    </motion.div>
  );
};

export default Workout;
