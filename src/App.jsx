import { useState, useEffect } from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import AppRoutes from "./routes/Routes";
import { Auth } from "./services/api";
import "./App.css";

function AppWrapper() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = Auth.getUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const hideLayoutRoutes = ["/login", "/unauthorized"];
  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <div className="app-container">
      {!shouldHideLayout && user && <Sidebar setUser={setUser} />}
      <div className="main-content">
        {!shouldHideLayout && user && <Header user={user} />}
        <AppRoutes user={user} setUser={setUser} />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
