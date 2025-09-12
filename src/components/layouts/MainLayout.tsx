import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../layouts/Navbar";

function MainLayout() {
  return (
    <div>
      <Navbar />
      <main>
        <Suspense fallback={<div>Cargando...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

export default MainLayout;
