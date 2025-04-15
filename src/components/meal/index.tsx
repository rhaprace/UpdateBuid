import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { auth, db } from "../../db/firebaseapp";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ArrowLongLeftIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const Meal = () => {
  const [exercises, setExercises] = useState<{ id: number; name: string }[]>(
    []
  );
  const [exerciseInput, setExerciseInput] = useState("");
  const [mealInput, setMealInput] = useState({
    name: "",
    grams: "",
    protein: 0,
    carbs: 0,
    fats: 0,
    calories: 0,
  });
  const [caloriesNeeded, setCaloriesNeeded] = useState<number>(0);
  const [userData, setUserData] = useState<any>(null);
  const [totalCaloriesConsumed, setTotalCaloriesConsumed] = useState<number>(0);
  const [showMacros, setShowMacros] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setCaloriesNeeded(data.requiredCaloriesPerDay || 0);
          setExercises(data.exercises || []);
          setTotalCaloriesConsumed(data.totalCaloriesConsumed || 0);
        }
      }
    };
    fetchUserData();
  }, []);

  const updateExercisesInFirestore = async (
    updatedExercises: { id: number; name: string }[]
  ) => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { exercises: updatedExercises });
  };

  const addExercise = async () => {
    if (!exerciseInput.trim()) {
      alert("Exercise name cannot be empty.");
      return;
    }

    const newExercise = { id: Date.now(), name: exerciseInput };
    const updatedExercises = [...exercises, newExercise];
    setExercises(updatedExercises);

    await updateExercisesInFirestore(updatedExercises);
    setExerciseInput("");
    alert("Exercise added!");
  };

  const handleMealInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setMealInput({ ...mealInput, [name]: value });
  };

  const addMeal = async () => {
    const { name, grams } = mealInput;

    if (
      !name.trim() ||
      !grams ||
      isNaN(parseFloat(grams)) ||
      parseFloat(grams) <= 0
    ) {
      alert(
        "Meal name cannot be empty, and grams must be a valid number greater than 0."
      );
      return;
    }

    const numericGrams = parseFloat(grams);
    const newProtein = numericGrams * 0.2;
    const newCarbs = numericGrams * 0.3;
    const newFats = numericGrams * 0.1;
    const newCalories = newProtein * 4 + newCarbs * 4 + newFats * 9;

    setMealInput({
      ...mealInput,
      protein: newProtein,
      carbs: newCarbs,
      fats: newFats,
      calories: newCalories,
    });

    setShowMacros(true);

    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        const newMeal = {
          name,
          grams: numericGrams,
          protein: newProtein,
          carbs: newCarbs,
          fats: newFats,
          calories: newCalories,
          createdAt: new Date().toISOString(),
        };

        const updatedMeals = [...(userData.meals || []), newMeal];

        const newTotalCalories =
          (userData.totalCaloriesConsumed || 0) + newCalories;

        await updateDoc(userDocRef, {
          meals: updatedMeals,
          totalCaloriesConsumed: newTotalCalories,
        });

        setTotalCaloriesConsumed(newTotalCalories);
      }
    }

    setMealInput({
      name: "",
      grams: "",
      protein: 0,
      carbs: 0,
      fats: 0,
      calories: 0,
    });

    alert("Meal added!");
  };

  const handleResetCalories = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        requiredCaloriesPerDay: 0,
        totalCaloriesConsumed: 0,
        meals: [],
      });

      setCaloriesNeeded(0);
      setTotalCaloriesConsumed(0);
      setUserData((prev: any) => ({ ...prev, requiredCaloriesPerDay: 0 }));
      setMealInput({
        name: "",
        grams: "",
        protein: 0,
        carbs: 0,
        fats: 0,
        calories: 0,
      });

      alert("Required calories per day and meals have been reset!");
    }
  };

  return (
    <>
      <ArrowLongLeftIcon
        onClick={() => navigate("/")}
        className="h-8 w-8 text-gray-50 hover:text-gray-300 transition duration-200 fixed left-0 ml-5 mt-5 block md:hidden z-50"
      />
      <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a4d] to-[#f0f0f0] p-6">
        <h2 className="text-5xl md:text-6xl font-extrabold text-center text-gray-800 mb-4">
          Meal & Exercise Planner
        </h2>
        <p className="text-center text-lg md:text-xl text-gray-800 mb-8">
          Effortlessly track your meals and exercises while staying on top of
          your nutrition goals.
        </p>

        <div className="flex flex-col gap-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-10 lg:gap-14 w-full max-w-6xl">
          <div className="flex flex-col p-6 bg-white/40 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 hover:scale-105 transition-all duration-300">
            <h3 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
              Add a New Exercise
            </h3>
            <input
              type="text"
              value={exerciseInput}
              onChange={(e) => setExerciseInput(e.target.value)}
              className="w-full h-12 p-3 mb-4 border border-gray-300 bg-white rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter exercise name"
            />
            <button
              onClick={addExercise}
              className="w-full bg-[#1a1a4d] text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-600 transition-all"
            >
              Add Exercise
            </button>
          </div>
          <div className="flex flex-col p-6 bg-white/40 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 hover:scale-105 transition-all duration-300">
            <h3 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
              Add a New Meal
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={mealInput.name}
                onChange={handleMealInputChange}
                placeholder="Meal name"
                className="w-full h-12 p-3 mb-4 border border-gray-300 bg-white rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="grams"
                value={mealInput.grams}
                onChange={handleMealInputChange}
                placeholder="Grams"
                className="w-full h-12 p-3 mb-4 border border-gray-300 bg-white rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addMeal}
                className="w-full bg-[#D9D9D9] text-black px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-[#1a1a4d] hover:text-white transition-all"
              >
                Add Meal
              </button>
              {showMacros && (
                <div className="mt-4 grid grid-cols-2 gap-2 text-gray-800 text-sm">
                  <p>Protein: {mealInput.protein.toFixed(1)}g</p>
                  <p>Carbs: {mealInput.carbs.toFixed(1)}g</p>
                  <p>Fats: {mealInput.fats.toFixed(1)}g</p>
                  <p>Calories: {mealInput.calories.toFixed(1)} kcal</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col p-6 bg-white/40 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 hover:scale-105 transition-all duration-300 text-center">
            <h4 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
              Total Calories Consumed
            </h4>
            <p className="text-5xl font-extrabold text-green-500 mb-4">
              {totalCaloriesConsumed} kcal
            </p>
            <button
              className="bg-[#1a1a4d] text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-600 transition-all"
              onClick={handleResetCalories}
            >
              Reset Calories
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Meal;
