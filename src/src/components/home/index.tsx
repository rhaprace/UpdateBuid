import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from '@/components/db/firebaseapp';
import { doc, getDoc } from 'firebase/firestore';
import Vid from "@/assets/vid.mp4"
const Home: React.FC = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserName(userDoc.data().name);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <section id="home" className="h-screen bg-gradient-to-br from-[#000059] to-[#D9D9D9] flex flex-col justify-center">
            <motion.div 
                className="flex flex-col md:flex-row mx-auto w-5/6 items-center justify-between md:h-5/6"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="md:w-1/2 text-center md:text-left">
                    <h1 className="text-4xl font-bold text-white">
                        {loading ? <p>Loading...</p> : `Welcome, ${userName}!`}
                    </h1>
                    <p className="mt-4 text-lg text-gray-200">
                        Achieve your health and fitness goals with our personalized meal plans and workout routines.
                    </p>
                    <div className="mt-6 flex justify-center md:justify-start space-x-4">
                        <Button 
                            variant="contained" 
                            color="primary" 
                            size="large" 
                            onClick={() => navigate('/chatbot')}
                        >
                            Get Help with AI
                        </Button>
                        <Button 
                            variant="outlined" 
                            color="primary" 
                            size="large"
                        >
                            Learn More
                        </Button>
                    </div>
                </div>
                <motion.div 
                    className="md:w-1/2 flex justify-center mt-8 md:mt-0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                >
                    <video 
                        src={Vid} 
                        className="w-72 md:w-96 rounded-lg shadow-lg object-cover h-96" 
                        autoPlay 
                        loop 
                        muted 
                    />
                </motion.div>
            </motion.div>
        </section>
    );
};

export default Home;
