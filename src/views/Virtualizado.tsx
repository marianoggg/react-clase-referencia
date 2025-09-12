/** Renderiza una lista virtualizada con altura fija y filas de 35px.

Cuando el scroll llega cerca del final, se dispara la carga de más datos.

Solo se renderizan las filas visibles, aunque tengamos miles de usuarios en data.

Los encabezados son fijos arriba (están fuera del List).

El usuario ve una experiencia fluida y la app escala sin problemas. */

import { useEffect, useState, useRef, useCallback } from "react";
import { FixedSizeList as List, type ListChildComponentProps } from "react-window";

type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  type: string;
  email: string;
  [key: string]: any;
};

function Notifications() {
  const userName =
    JSON.parse(localStorage.getItem("user") || "{}").first_name || "Usuario";

  const BACKEND_IP = "localhost";
  const BACKEND_PORT = "8000";
  const ENDPOINT = "user/paginated";
  const URL = `http://${BACKEND_IP}:${BACKEND_PORT}/${ENDPOINT}`;

  const [data, setData] = useState<User[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);

  // Evitar llamadas simultáneas por scroll
  const loadingRef = useRef(false);

  async function getUsersPag(limit: number, last_seen_id: number | null) {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    if (loadingRef.current) return; // ya está cargando

    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await fetch(URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ limit, last_seen_id }),
      });

      const json = await res.json();

      if (json.message) {
        console.error("Error:", json.message);
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      if (!last_seen_id) {
        setData(json.users);
      } else {
        setData((prev) => [...prev, ...json.users]);
      }

      setNextCursor(json.next_cursor);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }

  useEffect(() => {
    getUsersPag(20, 0);
  }, []);

    useEffect(() => {
    console.log("data", data);
  }, [data]);

  // Renderiza cada fila para react-window
  const Row = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const user = data[index];
      if (!user) return null;

      return (
        <div
          style={{
            ...style,
            display: "flex",
            borderBottom: "1px solid #ddd",
            padding: "0 10px",
            alignItems: "center",
            boxSizing: "border-box",
          }}
        >
          <div style={{ flex: 1 }}>{user.first_name}</div>
          <div style={{ flex: 1 }}>{user.last_name}</div>
          <div style={{ flex: 1 }}>{user.type}</div>
          <div style={{ flex: 2 }}>{user.email}</div>
        </div>
      );
    },
    [data]
  );

  // Controla scroll para cargar más datos
  const listRef = useRef<List>(null);

  function handleScroll({
    scrollOffset,
    scrollUpdateWasRequested,
  }: {
    scrollOffset: number;
    scrollUpdateWasRequested: boolean;
  }) {
    if (loadingRef.current || !nextCursor) return;

    const list = listRef.current;
    if (!list) return;

    // Si se está cerca del final (por ejemplo últimos 150px)
    const visibleHeight = Number(list.props.height);
    const totalHeight = list.props.itemSize * data.length;

    if (scrollOffset + visibleHeight + 150 >= totalHeight) {
      getUsersPag(20, nextCursor);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Infinite Virtualizado</h2>

      <div
        style={{
          marginTop: 10,
          border: "1px solid #ccc",
          height: 400,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            borderBottom: "2px solid #666",
            fontWeight: "bold",
            padding: "0 10px",
            boxSizing: "border-box",
            height: 35,
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1 }}>NOMBRE</div>
          <div style={{ flex: 1 }}>APELLIDO</div>
          <div style={{ flex: 1 }}>TIPO</div>
          <div style={{ flex: 2 }}>EMAIL</div>
        </div>

        <List
          height={365}
          itemCount={data.length}
          itemSize={35}
          width={"100%"}
          onScroll={handleScroll}
          ref={listRef}
        >
          {Row}
        </List>

        {loading && (
          <div style={{ textAlign: "center", padding: "10px" }}>
            Cargando...
          </div>
        )}
        {!nextCursor && !loading && (
          <div style={{ textAlign: "center", padding: "10px" }}>
            No hay más usuarios
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
