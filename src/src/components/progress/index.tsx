import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { auth, db } from "@/components/db/firebaseapp";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { ArrowLongLeftIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
interface Exercise {
  id: string;
  name: string;
}

const Progress = () => {
  const [exerciseList, setExerciseList] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [caloriesNeeded, setCaloriesNeeded] = useState<string>("Calculating...");
  const [nutritionNeeds, setNutritionNeeds] = useState<string>("Calculating...");
  const navigate = useNavigate();
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (userDoc) => {
      if (userDoc.exists()) {
        const data = userDoc.data();
        const exercises = Array.isArray(data?.exercises) ? data.exercises : [];
        setExerciseList(
          exercises.map((exercise, index) => ({
            id: typeof exercise?.id === "string" ? exercise.id : `exercise-${index}`,
            name: typeof exercise?.name === "string" ? exercise.name : "Unknown Exercise",
          }))
        );
        setWeight(data.weight || null);
        setHeight(data.height || null);
        setAge(data.age || null);
        setGender(data.gender || null);
        setGoal(data.goal || null);
      } else {
        setExerciseList([]);
        setWeight(null);
        setHeight(null);
        setAge(null);
        setGender(null);
        setGoal(null);
        setCaloriesNeeded("Not Available");
        setNutritionNeeds("Not Available");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (weight && height && age && gender && goal) {
      calculateCaloriesAndNutrition();
    }
  }, [weight, height, age, gender, goal]);

  const calculateCaloriesAndNutrition = () => {
  const validWeight = weight ?? 0;
  const validHeight = height ?? 0;
  const validAge = age ?? 0;

  let BMR: number;
  if (gender === "Male") {
    BMR = 10 * validWeight + 6.25 * validHeight - 5 * validAge + 5;
  } else {
    BMR = 10 * validWeight + 6.25 * validHeight - 5 * validAge - 161;
  }

  const activityFactor = 1.55;
  const TDEE = BMR * activityFactor;

  let adjustedCalories: number;
  let nutritionRecommendation: string;

  if (goal === "Weight Loss") {
    adjustedCalories = TDEE - 500;
    nutritionRecommendation = "A high-protein, low-carb diet is recommended.";
  } else if (goal === "Gain Weight") {
    adjustedCalories = TDEE + 500;
    nutritionRecommendation = "Consume high-calorie meals with protein and healthy fats.";
  } else {
    adjustedCalories = TDEE;
    nutritionRecommendation = "A balanced diet with lean protein, complex carbs, and veggies is ideal.";
  }

  setCaloriesNeeded(`${Math.round(adjustedCalories)} kcal/day`);
  setNutritionNeeds(nutritionRecommendation);
};


  const markAsDone = useCallback(async (exerciseId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const updatedExercises = exerciseList.filter((exercise) => exercise.id !== exerciseId);
    setExerciseList(updatedExercises);

    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      exercises: updatedExercises,
    });
  }, [exerciseList]);

  if (loading) {
    return <div className="text-center text-gray-800">Loading...</div>;
  }

  const chartData = {
    labels: exerciseList.map((exercise) => exercise.name),
    datasets: [
      {
        label: "Pending Exercises",
        data: exerciseList.map(() => 1),
        borderColor: "#ff5e62",
        backgroundColor: "rgba(255, 94, 98, 0.5)",
        fill: true,
      },
    ],
  };

  return (
    <>
    <ArrowLongLeftIcon onClick={() => navigate('/meal')} className="h-8 w-8 text-gray-50 hover:text-gray-300 transition duration-200 fixed left-0 ml-5 mt-5"/>
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#1A2980] to-[#26D0CE]"
    >
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">PROGRESS <span className="text-red-600">TRACKER</span></h1>
        
        <div className="text-center text-lg font-semibold">Weight: {weight ? `${weight} kg` : "Not Available"}</div>
        <div className="text-center text-lg font-semibold">Height: {height ? `${height} cm` : "Not Available"}</div>
        <div className="text-center text-lg font-semibold">Age: {age ? age : "Not Available"}</div>
        <div className="text-center text-lg font-semibold">Goal: {goal || "Not Available"}</div>
        <div className="text-center text-lg font-semibold">Calories Needed: {caloriesNeeded}</div>
        <div className="text-center text-lg font-semibold">Nutrition Needs: {nutritionNeeds}</div>

        <div className="my-6">
          <Line data={chartData} />
        </div>

        <div className="bg-gray-100 shadow-md rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3">Pending Exercises</h3>
          <ul>
            {exerciseList.map((exercise) => (
              <li key={exercise.id} className="flex justify-between items-center p-3 bg-white shadow rounded-lg mb-2">
                <span>{exercise.name}</span>
                <button 
                  onClick={() => markAsDone(exercise.id)} 
                  className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 hover:scale-105 transition-all duration-300"
                >
                  Done
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default Progress;
