import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { auth, db } from "../db/firebaseapp";
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
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [userData, setUserData] = useState<any>(null);
  const [totalCaloriesConsumed, setTotalCaloriesConsumed] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
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

  const removeExercise = async (id: number) => {
    const updatedExercises = exercises.filter((exercise) => exercise.id !== id);
    setExercises(updatedExercises);

    await updateExercisesInFirestore(updatedExercises);
  };

  const addMeal = async () => {
    const { name, calories } = mealInput;

    if (!name.trim() || calories <= 0) {
      alert("Meal name cannot be empty and calories must be greater than 0.");
      return;
    }

    // Update the total calories consumed in Firestore
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);

      // Get the existing user data and update calories
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const newTotalCalories =
          (userData.totalCaloriesConsumed || 0) + calories;

        // Update the total calories consumed in Firestore
        await updateDoc(userDocRef, {
          totalCaloriesConsumed: newTotalCalories,
        });
        setTotalCaloriesConsumed(newTotalCalories);
      }
    }

    // Reset meal input fields
    setMealInput({ name: "", calories: 0, protein: 0, carbs: 0, fats: 0 });
    alert("Meal added!");
  };

  const generateMealPlan = () => {
    if (!userData) return "Loading meal plan...";

    const { weight, height, age, goal } = userData;
    const bmi = weight / ((height / 100) * (height / 100));

    if (goal === "Weight Loss") {
      return bmi > 25
        ? "Based on your data, a low-carb diet with high-protein meals is recommended. Suggested meal prep: Grilled chicken with steamed broccoli and quinoa."
        : "Based on your data, a balanced diet with portion control is recommended. Suggested meal prep: Baked salmon with roasted vegetables and brown rice.";
    } else if (goal === "Gain Weight") {
      return "Based on your data, high-calorie meals with protein shakes and healthy fats are recommended. Suggested meal prep: Beef stir-fry with whole grain pasta and avocado.";
    } else {
      return "Based on your data, balanced meals with lean proteins, complex carbs, and veggies are recommended. Suggested meal prep: Turkey and quinoa bowl with mixed greens and a yogurt dressing.";
    }
  };

  const navigateToWorkout = () => {
    navigate("/workout");
  };

  const deleteTotalCalories = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      // Reset total calories consumed in Firestore
      await updateDoc(userDocRef, { totalCaloriesConsumed: 0 });
      setTotalCaloriesConsumed(0);
      alert("Total calories consumed has been reset.");
    }
  };

  return (
    <>
      <ArrowLongLeftIcon
        onClick={() => navigate("/")}
        className="h-8 w-8 text-gray-50 hover:text-gray-300 transition duration-200 fixed left-0 ml-5 mt-5"
      />
      <section className="min-h-screen h-auto flex flex-col items-center justify-center bg-gradient-to-br from-[#000059] to-[#D9D9D9] p-6 md:min-h-screen lg:min-h-screen">
        <motion.div
          className="w-full max-w-4xl p-8 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/20 bg-gradient-to-r from-blue-600/30 to-purple-600/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-4xl font-extrabold text-center text-white drop-shadow-xl mb-8 tracking-wider"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Meal & Exercise Planner
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-white drop-shadow-lg mb-4">
                Recommended Meal Plan
              </h3>
              <p className="text-white/80">{generateMealPlan()}</p>
            </motion.div>

            <motion.div className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-white drop-shadow-lg mb-4">
                Add a New Exercise
              </h3>
              <input
                type="text"
                value={exerciseInput}
                onChange={(e) => setExerciseInput(e.target.value)}
                className="w-full p-3 border border-white/30 bg-white/5 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="Enter exercise name"
              />
              <button
                onClick={addExercise}
                className="w-full mt-4 bg-blue-500/80 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 hover:scale-105 transition-all duration-300"
              >
                Add Exercise
              </button>
            </motion.div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-white drop-shadow-lg mb-4">
              Add a New Meal
            </h3>
            <input
              type="text"
              value={mealInput.name}
              onChange={(e) =>
                setMealInput({ ...mealInput, name: e.target.value })
              }
              className="w-full p-3 border border-white/30 bg-white/5 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all mb-4"
              placeholder="Meal name"
            />
            <input
              type="number"
              value={mealInput.calories}
              onChange={(e) =>
                setMealInput({
                  ...mealInput,
                  calories: parseFloat(e.target.value),
                })
              }
              className="w-full p-3 border border-white/30 bg-white/5 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all mb-4"
              placeholder="Calories"
            />
            <input
              type="number"
              value={mealInput.protein}
              onChange={(e) =>
                setMealInput({
                  ...mealInput,
                  protein: parseFloat(e.target.value),
                })
              }
              className="w-full p-3 border border-white/30 bg-white/5 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all mb-4"
              placeholder="Protein (g)"
            />
            <input
              type="number"
              value={mealInput.carbs}
              onChange={(e) =>
                setMealInput({
                  ...mealInput,
                  carbs: parseFloat(e.target.value),
                })
              }
              className="w-full p-3 border border-white/30 bg-white/5 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all mb-4"
              placeholder="Carbs (g)"
            />
            <input
              type="number"
              value={mealInput.fats}
              onChange={(e) =>
                setMealInput({ ...mealInput, fats: parseFloat(e.target.value) })
              }
              className="w-full p-3 border border-white/30 bg-white/5 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all mb-4"
              placeholder="Fats (g)"
            />
            <button
              onClick={addMeal}
              className="w-full mt-4 bg-green-500/80 text-white py-3 rounded-lg font-semibold hover:bg-green-600 hover:scale-105 transition-all duration-300"
            >
              Add Meal
            </button>
          </div>

          <div className="mt-8 text-white text-center">
            <h3 className="text-xl font-semibold drop-shadow-lg mb-4">
              Total Calories Consumed: {totalCaloriesConsumed} kcal
            </h3>
            <button
              onClick={deleteTotalCalories}
              className="w-full mt-4 bg-red-500/80 text-white py-3 rounded-lg font-semibold hover:bg-red-600 hover:scale-105 transition-all duration-300"
            >
              Reset Total Calories
            </button>
          </div>

          <button
            onClick={navigateToWorkout}
            className="mt-6 bg-green-500/80 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 hover:scale-105 transition-all duration-300 shadow-xl"
          >
            Recommended Workout
          </button>
        </motion.div>
      </section>
    </>
  );
};

export default Meal;
