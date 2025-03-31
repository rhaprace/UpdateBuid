import Navbar from "@/components/navbar";
import  Home  from "@/components/home/index";
import { useEffect } from "react";
function App() {
  useEffect(() => {
  window.history.pushState(null, '', window.location.href);
  window.onpopstate = () => {
    window.history.pushState(null, '', window.location.href);
  };
}, []);
  return (
    <div className="app bg-white">
      <Navbar/>
      <Home/>
    </div>
  );
}

export default App;
