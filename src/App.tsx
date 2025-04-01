import Navbar from "../src/components/navbar";
import Home from "../src/components/home";
import { useEffect } from "react";
function App() {
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, "", window.location.href);
    };
  }, []);
  return (
    <div className="app bg-white">
      <Navbar />
      <Home />
    </div>
  );
}

export default App;
