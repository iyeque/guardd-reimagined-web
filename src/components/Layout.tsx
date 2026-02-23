import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";

const Layout = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <Navigation />
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;