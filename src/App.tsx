import { useEffect } from "react";
import Navbar from "./components/uiElements/Navbar";
import uiStore from "./stores/UIStore";
import { Outlet } from "react-router-dom";

function App() {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (uiStore.isModified) {
        event.preventDefault();
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <div className="flex  overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
