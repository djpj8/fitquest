import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import LogWorkout from "./pages/LogWorkout";
import Routines from "./pages/Routines";
import Programs from "./pages/Programs";
import History from "./pages/History";
import Achievements from "./pages/Achievements";
import Sidebar from "./components/Sidebar";

type Page = "dashboard" | "log-workout" | "routines" | "programs" | "history" | "achievements";

export default function App() {
  const { user, isLoading } = useAuth();
  const [page, setPage] = useState<Page>("dashboard");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">⚔️</div>
          <p className="gold-shimmer text-xl" style={{ fontFamily: "var(--font-serif)" }}>
            Entering the Realm...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard onNavigate={p => setPage(p as Page)} />;
      case "log-workout": return <LogWorkout onNavigate={p => setPage(p as Page)} />;
      case "routines": return <Routines />;
      case "programs": return <Programs />;
      case "history": return <History />;
      case "achievements": return <Achievements />;
      default: return <Dashboard onNavigate={p => setPage(p as Page)} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar currentPage={page} onNavigate={p => setPage(p as Page)} />
      <main className="flex-1 overflow-y-auto min-h-screen">
        {renderPage()}
      </main>
    </div>
  );
}
