import { useState, useEffect } from "react";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";

type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  type: string;
  email: string;
  [key: string]: any;
};

function UsersTableLibrary() {
  const BACKEND_IP = "localhost";
  const BACKEND_PORT = "8000";
  const ENDPOINT = "user/paginated/filtered-sync";
  const URL = `http://${BACKEND_IP}:${BACKEND_PORT}/${ENDPOINT}`;

  const [data, setData] = useState<{ nodes: User[] }>({ nodes: [] });
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState<number>(0);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [previousCursors, setPreviousCursors] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --data-table-library_grid-template-columns: 1fr 1fr 1fr 1fr;
      `,
    },
  ]);

  const COLUMNS = [
    {
      label: "Nombre",
      renderCell: (item: User) => item.first_name,
    },
    {
      label: "Apellido",
      renderCell: (item: User) => item.last_name,
    },
    {
      label: "Email",
      renderCell: (item: User) => item.email,
    },
    {
      label: "Tipo",
      renderCell: (item: User) => item.type,
    },
  ];

  const VIRTUALIZED_OPTIONS = {
    rowHeight: (_item: User, _index: number) => 60,
  };

  // Debounce para la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms de debounce

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const fetchUsers = async (
    cursorId: number = 0,
    isGoingBack: boolean = false
  ) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit: 20,
          last_seen_id: cursorId,
          search: debouncedSearch,
        }),
      });

      const json = await res.json();

      if (json.message) {
        console.error("Error:", json.message);
        setIsLoading(false);
        return;
      }

      setData({ nodes: json.users });
      setNextCursor(json.next_cursor ?? null);

      // Actualizar historial de cursors para navegación
      if (!isGoingBack && cursorId !== 0) {
        setPreviousCursors((prev) => [...prev, cursor]);
      }

      setCursor(cursorId);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos cuando cambia la búsqueda o inicialmente
  useEffect(() => {
    // Resetear paginación cuando cambia la búsqueda
    setPreviousCursors([]);
    setCursor(0);
    setCurrentPage(1);
    fetchUsers(0);
  }, [debouncedSearch]);

  const handleNext = () => {
    if (nextCursor !== null) {
      setCurrentPage((prev) => prev + 1);
      fetchUsers(nextCursor);
    }
  };

  const handlePrevious = () => {
    if (previousCursors.length > 0) {
      const previousCursor = previousCursors[previousCursors.length - 1];
      const newPreviousCursors = previousCursors.slice(0, -1);

      setPreviousCursors(newPreviousCursors);
      setCurrentPage((prev) => prev - 1);
      fetchUsers(previousCursor, true);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setDebouncedSearch(search);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 1200 }}>
      <h2>Usuarios</h2>

      {/* Campo de búsqueda */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o email..."
          value={search}
          onChange={handleSearch}
          onKeyPress={handleKeyPress}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            width: "300px",
            marginRight: "20px",
          }}
        />

        {/* Contador de página */}
        <span style={{ fontWeight: "bold" }}>Página: {currentPage}</span>

        {isLoading && (
          <span style={{ marginLeft: "20px", color: "#666" }}>Buscando...</span>
        )}
      </div>

      {/* Tabla con virtualización */}
      <div
        style={{
          height: "600px",
          overflow: "auto",
          border: "1px solid #ddd",
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      >
        <CompactTable
          columns={COLUMNS}
          data={data}
          theme={theme}
          virtualizedOptions={VIRTUALIZED_OPTIONS}
          layout={{ isDiv: true, fixedHeader: true }}
        />
      </div>

      {/* Controles de paginación */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          onClick={handlePrevious}
          disabled={previousCursors.length === 0 || isLoading}
          style={{
            padding: "8px 16px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#f5f5f5",
            cursor: previousCursors.length === 0 ? "not-allowed" : "pointer",
            opacity: previousCursors.length === 0 ? 0.5 : 1,
          }}
        >
          Anterior
        </button>

        <button
          onClick={handleNext}
          disabled={nextCursor === null || isLoading}
          style={{
            padding: "8px 16px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#f5f5f5",
            cursor: nextCursor === null ? "not-allowed" : "pointer",
            opacity: nextCursor === null ? 0.5 : 1,
          }}
        >
          Siguiente
        </button>

        {isLoading && <span style={{ marginLeft: "10px" }}>Cargando...</span>}

        <span style={{ marginLeft: "auto", color: "#666" }}>
          {data.nodes.length} usuarios mostrados
        </span>
      </div>
    </div>
  );
}

export default UsersTableLibrary;
