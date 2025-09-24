import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import PublicRoutes from "./components/router/PublicRoutes";
import ProtectedRoutes from "./components/router/ProtectedRoutes";
import MainLayout from "./components/layouts/MainLayout";

function App() {
  const Dashboard = lazy(() => import("./views/Native"));
  const Virtualizado = lazy(() => import("./views/Virtualizado"));
  const Select = lazy(() => import("./views/Select"));
  const ReactTable = lazy(() => import("./views/ReactTableLibrary"));
  const TanStackReactTable = lazy(() => import("./views/TanStackReactTable"));

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoutes />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoutes />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/virtualizado" element={<Virtualizado />} />
            <Route path="/select" element={<Select />} />
            <Route path="/reactTable" element={<ReactTable />} />
            <Route
              path="/tanStackReactTable"
              element={<TanStackReactTable />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
