import React, { useState, useEffect, createContext, useContext } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";

export interface IAuthRouteProps {
  children: React.ReactNode;
  guestAllowed?: boolean; // Indicates if guest access is allowed
}

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// A simple modal component to display the unauthorized message
const UnauthorizedModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "8px",
        maxWidth: "400px",
        width: "90%",
        textAlign: "center",
      }}>
        <h2>Unauthorized</h2>
        <p>You don't have permission to access this page.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const AuthRoute: React.FC<IAuthRouteProps> = ({ children, guestAllowed = false }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
        setIsGuest(false);
      } else {
        setUser(null);
        if (guestAllowed) {
          setIsGuest(true);
        } else {
          
          setShowModal(true); // Show modal instead of logging "unauthorized"
            setTimeout(() => {
            navigate("/landingpage");
            }, 1000);
        }1
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate, guestAllowed]);

  const handleModalClose = () => {
    setShowModal(false);
    navigate("/landingpage"); // Redirect after closing the modal
  };

  if (loading) return <p>Loading...</p>;

  return (
    <AuthContext.Provider value={{ user, isGuest }}>
      {children}
      {showModal && <UnauthorizedModal onClose={handleModalClose} />}
    </AuthContext.Provider>
  );
};

export default AuthRoute;
