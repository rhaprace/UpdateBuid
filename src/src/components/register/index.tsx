import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/components/db/firebaseapp';
import { ArrowLongLeftIcon } from '@heroicons/react/24/solid';
import { motion } from "framer-motion";

const generateExercises = (goal: string) => {
  if (goal === "Weight Loss") {
    return [
      { id: 1, name: "Jump Rope" },
      { id: 2, name: "Burpees" },
      { id: 3, name: "Running" }
    ];
  } else if (goal === "Gain Weight") {
    return [
      { id: 1, name: "Deadlifts" },
      { id: 2, name: "Squats" },
      { id: 3, name: "Bench Press" }
    ];
  } else {
    return [
      { id: 1, name: "Push-Ups" },
      { id: 2, name: "Pull-Ups" },
      { id: 3, name: "Plank" }
    ];
  }
};

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [goal, setGoal] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authing, setAuthing] = useState(false);

  const registerUser = async () => {
    setAuthing(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const exercises = generateExercises(goal);

      await setDoc(doc(db, 'users', user.uid), {
        name,
        weight: Number(weight),
        height: Number(height),
        age: Number(age),
        gender,
        goal,
        email,
        exercises,
      });

      console.log('User registered:', user.uid);
      navigate('/login', { replace: true });
    } catch (error: any) {
      console.error('Registration Error:', error);
      setError(error.message);
    } finally {
      setAuthing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#000059] to-[#D9D9D9] flex justify-center items-center z-50">
      <motion.div 
        className="relative w-full max-w-md p-8 rounded-lg bg-white bg-opacity-10 backdrop-blur-lg shadow-2xl border border-white border-opacity-30"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <button onClick={() => navigate('/login')} className="absolute top-4 left-4 text-white">
          <ArrowLongLeftIcon className="h-6 w-6 text-gray-50 hover:text-gray-300 transition duration-200" />
        </button>
        <h3 className="text-4xl font-bold mb-2 text-white text-center">Create Account</h3>
        <p className="text-lg mb-6 text-gray-200 text-center">Start Your Fitness Journey!</p>
        <div className="mb-6">
          <input type="text" placeholder="Name" className="w-full text-white py-3 px-4 mb-4 bg-transparent border border-gray-400 rounded-md focus:outline-none focus:border-yellow-400 transition-all" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="email" placeholder="Email" className="w-full text-white py-3 px-4 mb-4 bg-transparent border border-gray-400 rounded-md focus:outline-none focus:border-yellow-400 transition-all" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full text-white py-3 px-4 mb-4 bg-transparent border border-gray-400 rounded-md focus:outline-none focus:border-yellow-400 transition-all" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="number" placeholder="Age" className="w-full text-white py-3 px-4 mb-4 bg-transparent border border-gray-400 rounded-md focus:outline-none focus:border-yellow-400 transition-all" value={age} onChange={(e) => setAge(e.target.value)} />
          <input type="number" placeholder="Weight (kg)" className="w-full text-white py-3 px-4 mb-4 bg-transparent border border-gray-400 rounded-md focus:outline-none focus:border-yellow-400 transition-all" value={weight} onChange={(e) => setWeight(e.target.value)} />
          <input type="number" placeholder="Height (cm)" className="w-full text-white py-3 px-4 mb-4 bg-transparent border border-gray-400 rounded-md focus:outline-none focus:border-yellow-400 transition-all" value={height} onChange={(e) => setHeight(e.target.value)} />

          <div className="mb-4 text-white">
            <label className="mr-4">Gender:</label>
            <label className="mr-2">
              <input type="radio" name="gender" value="Male" onChange={(e) => setGender(e.target.value)} /> Male
            </label>
            <label>
              <input type="radio" name="gender" value="Female" onChange={(e) => setGender(e.target.value)} /> Female
            </label>
          </div>

          <div className="mb-4 text-white">
            <label className="mr-4">Fitness Goal:</label>
            <select 
              className="w-full bg-transparent border border-gray-400 text-white rounded-md px-3 py-2 focus:outline-none focus:border-yellow-400 transition-all"
              value={goal} onChange={(e) => setGoal(e.target.value)}
            >
              <option value="" disabled>Select your goal</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Gain Weight">Gain Weight</option>
              <option value="Physically Fit">Physically Fit</option>
            </select>
          </div>

          <motion.button 
            className="w-full bg-yellow-500 text-black font-semibold rounded-md p-3 hover:bg-yellow-400 transition-all"
            onClick={registerUser}
            disabled={authing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Register
          </motion.button>
          {error && <div className="text-red-500 text-center mt-4">{error}</div>}
        </div>

        <div className="flex justify-center mt-6 items-center">
          <button onClick={() => navigate('/login')} className="text-white text-sm">
            Already Registered? <span className="text-yellow-400">Log in here</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
