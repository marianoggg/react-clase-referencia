import { NavLink } from "react-router-dom";

function handleLogout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

function Navbar() {
  return (
    <nav style={{ padding: "1rem", background: "#e6fafd" }}>
      <NavLink
        to="/dashboard"
        style={{ marginRight: "1rem" }}
        title="Dashboard"
      >
        Infinite simple
      </NavLink>
      <NavLink to="/virtualizado" style={{ marginRight: "1rem" }}>
        Inf.Sc. Virtualizado
      </NavLink>
      <NavLink to="/select" style={{ marginRight: "1rem" }}>
        Select
      </NavLink>
      <NavLink to="/reactTable" style={{ marginRight: "1rem" }}>
        ReactTableLibrary
      </NavLink>
      <NavLink to="/tanStackReactTable" style={{ marginRight: "1rem" }}>
        TanStackReactTable
      </NavLink>
      <NavLink to="/tanStackReactTable_hooks" style={{ marginRight: "1rem" }}>
        TanStackReactTable_limpio
      </NavLink>

      <NavLink to="/login" onClick={handleLogout}>
        Logout
      </NavLink>
    </nav>
  );
}

export default Navbar;
