import LandingPage from "./pages/LandingPage";
import TryPage from "./pages/TryPage";

const normalizePath = (path) => path.replace(/\/+$/, "") || "/";

function App() {
  const path = normalizePath(window.location.pathname);

  if (path === "/try") {
    return <TryPage />;
  }

  return <LandingPage />;
}

export default App;
