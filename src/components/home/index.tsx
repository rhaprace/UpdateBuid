import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../db/firebaseapp";
import { doc, getDoc } from "firebase/firestore";
import Vid from "@/assets/vid.mp4";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Guest");
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
        }
      } else {
        setUserName("Guest");
      }
      setLoading(false);
    });

    const quotes = [
      "Push yourself, because no one else is going to do it for you.",
      "Success is the sum of small efforts, repeated day in and day out.",
      "Don't stop when you're tired, stop when you're done.",
      "The only bad workout is the one that didn't happen.",
      "Hard work beats talent when talent doesn't work hard.",
    ];

    const interval = setInterval(() => {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <section
      id="home"
      className="min-h-screen bg-gradient-to-br from-[#1a1a4d] to-[#f0f0f0] flex flex-col justify-center overflow-hidden"
    >
      <motion.div
        className="flex flex-col md:flex-row mx-auto w-5/6 items-center justify-between md:h-5/6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl font-bold text-white leading-tight">
            {loading ? "Loading..." : `Welcome, ${userName || "Athlete"}!`}
          </h1>

          <p className="mt-4 text-lg text-white max-w-md">
            Your fitness journey starts here. Build habits. Track progress. Stay
            consistent.
          </p>

          <div className="border-t border-white my-6 w-24 mx-auto md:mx-0" />

          <p className="text-sm text-white uppercase tracking-widest">
            Let’s get moving.
          </p>

          <div className="mt-6 flex justify-center md:justify-start space-x-4">
            <motion.button
              className="w-48 bg-[#000059] text-white font-semibold rounded-md p-3 hover:bg-white hover:text-black transition-all"
              onClick={() => navigate("/chatbot")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              AI Coach
            </motion.button>
            <motion.button
              className="w-48 bg-[#000059] text-white font-semibold rounded-md p-3 hover:bg-white hover:text-black transition-all"
              onClick={() => navigate("/contactus")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </div>
        </div>

        <motion.div
          className="md:w-1/2 flex justify-center mt-10 md:mt-0"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <video
            src={Vid}
            className="w-72 md:w-96 rounded-xl shadow-2xl object-cover h-72 md:h-96"
            autoPlay
            loop
            muted
          />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-16 w-full text-center text-lg text-gray-200 font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <p className="italic">"{quote}"</p>
      </motion.div>

      <div className="absolute bottom-0 w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
        <motion.div
          className="flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="w-1/3 h-2 bg-gray-400 rounded-full mr-2">
            <motion.div
              className="h-2 bg-blue-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "80%" }}
              transition={{ duration: 2 }}
            />
          </div>
          <span className="ml-2">80% of your daily goal achieved!</span>
        </motion.div>
      </div>
    </section>
  );
};

export default Home;
