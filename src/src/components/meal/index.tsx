import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/components/db/firebaseapp";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ArrowLongLeftIcon } from "@heroicons/react/24/solid";

const Meal = () => {
  const [exercises, setExercises] = useState<{ id: number; name: string }[]>([]);
  const [exerciseInput, setExerciseInput] = useState("");
  const [editingExerciseId, setEditingExerciseId] = useState<number | null>(null);
  const [editInput, setEditInput] = useState("");
  const [userData, setUserData] = useState<any>(null);

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
        }
      }
    };
    fetchUserData();
  }, []);

  const updateExercisesInFirestore = async (updatedExercises: { id: number; name: string }[]) => {
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
    const updatedExercises = [...exercises, { id: Date.now(), name: exerciseInput }];
    setExercises(updatedExercises);
    await updateExercisesInFirestore(updatedExercises);
    setExerciseInput("");
    alert("Exercise successfully added!");
  };

  const removeExercise = async (id: number) => {
    const updatedExercises = exercises.filter((exercise) => exercise.id !== id);
    setExercises(updatedExercises);
    await updateExercisesInFirestore(updatedExercises);
  };

  const startEditing = (id: number, name: string) => {
    setEditingExerciseId(id);
    setEditInput(name);
  };

  const saveEdit = async (id: number) => {
    if (!editInput.trim()) {
      alert("Exercise name cannot be empty.");
      return;
    }
    const updatedExercises = exercises.map((exercise) =>
      exercise.id === id ? { ...exercise, name: editInput } : exercise
    );
    setExercises(updatedExercises);
    await updateExercisesInFirestore(updatedExercises);
    setEditingExerciseId(null);
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

  return (
    <>
      <ArrowLongLeftIcon onClick={() => navigate('/')} className="h-8 w-8 text-gray-50 hover:text-gray-300 transition duration-200 fixed left-0 ml-5 mt-5" />
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
              <h3 className="text-xl font-semibold text-white drop-shadow-lg mb-4">Recommended Meal Plan</h3>
              <p className="text-white/80">{generateMealPlan()}</p>
            </motion.div>
            <motion.div className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-white drop-shadow-lg mb-4">Add a New Exercise</h3>
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
        </motion.div>
        <button
          onClick={navigateToWorkout}
          className="mt-6 bg-green-500/80 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 hover:scale-105 transition-all duration-300 shadow-xl"
        >
          Recommended Workout
        </button>
      </section>
    </>
  );
};

export default Meal;