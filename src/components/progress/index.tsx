import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { auth, db } from "../db/firebaseapp";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { ArrowLongLeftIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

interface Exercise {
  id: string;
  name: string;
}

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const Progress = () => {
  const [exerciseList, setExerciseList] = useState<Exercise[]>([]);
  const [mealList, setMealList] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [caloriesNeeded, setCaloriesNeeded] = useState("Calculating...");
  const [nutritionNeeds, setNutritionNeeds] = useState("Calculating...");
  const [bmiCategory, setBmiCategory] = useState<string | null>(null);
  const [healthRecommendation, setHealthRecommendation] =
    useState("Calculating...");
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (userDoc) => {
      if (userDoc.exists()) {
        const data = userDoc.data();
        setExerciseList(
          Array.isArray(data?.exercises)
            ? data.exercises.map((exercise, index) => ({
                id:
                  typeof exercise?.id === "string"
                    ? exercise.id
                    : `exercise-${index}`,
                name:
                  typeof exercise?.name === "string"
                    ? exercise.name
                    : "Unknown Exercise",
              }))
            : []
        );
        setMealList(Array.isArray(data?.meals) ? data.meals : []);
        setWeight(data.weight || null);
        setHeight(data.height || null);
        setAge(data.age || null);
        setGender(data.gender || null);
        setGoal(data.goal || null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (weight && height && age && gender && goal) {
      calculateCaloriesAndNutrition();
      calculateBMI();
    }
  }, [weight, height, age, gender, goal]);

  useEffect(() => {
    if (mealList.length > 0) {
      const totalCaloriesConsumed = mealList.reduce(
        (acc, meal) => acc + meal.calories,
        0
      );
      setTotalCalories(totalCaloriesConsumed);
    }
  }, [mealList]);

  const calculateCaloriesAndNutrition = () => {
    if (!weight || !height || !age || !gender || !goal) return;

    let BMR: number;
    if (gender === "Male") {
      BMR = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      BMR = 10 * weight + 6.25 * height - 5 * age - 161;
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
      nutritionRecommendation =
        "Consume high-calorie meals with protein and healthy fats.";
    } else {
      adjustedCalories = TDEE;
      nutritionRecommendation =
        "A balanced diet with lean protein, complex carbs, and veggies is ideal.";
    }

    setCaloriesNeeded(`${Math.round(adjustedCalories)} kcal/day`);
    setNutritionNeeds(nutritionRecommendation);
  };

  const calculateBMI = () => {
    if (!weight || !height) return;

    const heightMeters = height / 100;
    const bmi = weight / (heightMeters * heightMeters);
    let category = "";
    let recommendation = "";

    if (bmi < 18.5) {
      category = "Underweight";
      recommendation =
        "Increase calorie intake with nutritious foods. Strength training is recommended.";
    } else if (bmi >= 18.5 && bmi < 24.9) {
      category = "Normal Weight";
      recommendation = "Maintain a balanced diet and regular exercise.";
    } else if (bmi >= 25 && bmi < 29.9) {
      category = "Overweight";
      recommendation = "Reduce refined carbs and increase physical activity.";
    } else {
      category = "Obese";
      recommendation =
        "Consult a nutritionist for a structured diet plan. Engage in regular low-impact exercises.";
    }

    setBmiCategory(category);
    setHealthRecommendation(recommendation);
  };

  const markAsDone = useCallback(
    async (exerciseId: string) => {
      const user = auth.currentUser;
      if (!user) return;

      const updatedExercises = exerciseList.filter(
        (exercise) => exercise.id !== exerciseId
      );
      setExerciseList(updatedExercises);

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { exercises: updatedExercises });
    },
    [exerciseList]
  );

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
      <ArrowLongLeftIcon
        onClick={() => navigate("/meal")}
        className="h-8 w-8 text-gray-50 hover:text-gray-300 transition duration-200 fixed left-0 ml-5 mt-5"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#000059] to-[#D9D9D9]"
      >
        <div className="w-full max-w-4xl bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white shadow-lg rounded-2xl p-6 md:p-8 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2">
          <h1 className="text-3xl font-bold text-white text-center col-span-2">
            PROGRESS <span className="text-blue-400">TRACKER</span>
          </h1>

          <div className="text-center text-lg font-semibold">
            <div>Weight: {weight ? `${weight} kg` : "Not Available"}</div>
            <div>Height: {height ? `${height} cm` : "Not Available"}</div>
            <div>Age: {age || "Not Available"}</div>
            <div>Goal: {goal || "Not Available"}</div>
          </div>

          <div className="grid gap-4">
            <div>
              <h3 className="text-lg font-semibold text-center">BMI</h3>
              <p className="text-center">{bmiCategory || "Calculating..."}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-center">
                Calories Needed
              </h3>
              <p className="text-center">{caloriesNeeded}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-center">
                Health Advice
              </h3>
              <p className="text-center">{healthRecommendation}</p>
            </div>
          </div>

          <div className="col-span-2 bg-white rounded-xl">
            <Line data={chartData} />
          </div>

          <div className="col-span-2 bg-gradient-to-r from-blue-600/30 to-purple-600/30 shadow-md rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3">Pending Exercises</h3>
            <ul>
              {exerciseList.map((exercise) => (
                <li
                  key={exercise.id}
                  className="flex justify-between items-center p-2 sm:p-3 bg-white shadow rounded-lg mb-2 text-sm sm:text-base"
                >
                  <span>{exercise.name}</span>
                  <button
                    onClick={() => markAsDone(exercise.id)}
                    className="bg-green-500 text-white py-1 px-3 sm:py-2 sm:px-4 rounded-lg hover:bg-green-600"
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
