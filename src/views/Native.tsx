import { useEffect, useRef, useState } from "react";
import DataView from "../components/Tables/DataView";

type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  type: string;
  email: string;
  [key: string]: any;
};

function Nativo() {
  //#region Constants
  const BACKEND_IP = "localhost";
  const BACKEND_PORT = "8000";
  const ENDPOINT = "user/paginated";
  const URL = `http://${BACKEND_IP}:${BACKEND_PORT}/${ENDPOINT}`;
  //#endregion

  //#region Hooks
  const [data, setData] = useState<User[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(0);

  const loadingRef = useRef<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  //#endregion

  //#region Functions
  async function getUsersPag(limit: number, last_seen_id: number | null) {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (loadingRef.current) return;

    loadingRef.current = true;

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
        return;
      }

      //funcion que devuelve los datos a setear en data segun el last_seen_id
      const pepe = (prev: any) => {
        if (!last_seen_id) return json.users;
        else return [...prev, ...json.users];
      };

      setData(pepe);

      setNextCursor(json.next_cursor);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      loadingRef.current = false;
    }
  }

  function handleScroll() {
    if (!scrollContainerRef.current || loadingRef.current || !nextCursor)
      return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;

    if (scrollHeight - scrollTop - clientHeight < 100) {
      getUsersPag(20, nextCursor);
    }
  }

  //#endregion

  //#region Effects

  useEffect(() => {
    getUsersPag(20, 0);
  }, []);

  //#endregion

  return (
    <div>
      <h2>Nativo</h2>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{
          height: 400,
          overflowY: "auto",
          border: "1px solid #ccc",
          marginTop: 10,
        }}
      >
        <DataView data={data} nextCursor={nextCursor} />

        {/* usamos directamente loadingRef.current para la UI */}
        {loadingRef.current && (
          <div style={{ textAlign: "center", padding: "10px" }}>
            Cargando...
          </div>
        )}
        {!nextCursor && !loadingRef.current && (
          <div style={{ textAlign: "center", padding: "10px" }}>
            No hay más usuarios
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => getUsersPag(20, nextCursor ?? 0)}
          disabled={loadingRef.current || !nextCursor}
        >
          {loadingRef.current
            ? "Cargando..."
            : nextCursor
            ? "Cargar más"
            : "No hay más usuarios"}
        </button>
        <button
          onClick={() => getUsersPag(20, 0)}
          disabled={loadingRef.current}
          style={{ marginLeft: 10 }}
        >
          Recargar datos
        </button>
      </div>
    </div>
  );
}

export default Nativo;
