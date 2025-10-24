import { useState, useEffect, useCallback } from "react";

type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  type: string;
  email: string;
};

interface UsePaginatedUsersProps {
  baseUrl: string;
  defaultPageSize?: number;
  onAuthError?: () => void; // callback si el refresh falla
  refreshUrl?: string; // endpoint para refrescar el token
}

export const usePaginatedUsersTkn = ({
  baseUrl,
  defaultPageSize = 20,
  onAuthError,
  refreshUrl = "http://localhost:8000/auth/refresh",
}: UsePaginatedUsersProps) => {
  const [data, setData] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cursor, setCursor] = useState<number>(0);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [previousCursors, setPreviousCursors] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // ---- 🔁 TOKEN MANAGEMENT ----

  const getAccessToken = () => localStorage.getItem("token");
  const getRefreshToken = () => localStorage.getItem("refresh_token");

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(refreshUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) throw new Error("Refresh failed");

      const json = await res.json();
      if (json.access_token) {
        localStorage.setItem("token", json.access_token);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error refrescando token:", err);
      return false;
    }
  }, [refreshUrl]);

  const handleAuthError = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    if (onAuthError) onAuthError();
    else window.location.href = "/login"; // fallback
  }, [onAuthError]);

  // ---- 🔍 DEBOUNCE DE BÚSQUEDA ----

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // ---- 📡 FETCH PRINCIPAL ----

  const fetchUsers = useCallback(
    async (cursorId: number = 0, isGoingBack: boolean = false) => {
      setIsLoading(true);
      let token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        handleAuthError();
        return;
      }

      try {
        const res = await fetch(baseUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            limit: pageSize,
            last_seen_id: cursorId,
            search: debouncedSearch,
          }),
        });

        // Si el token expiró, intentamos refrescar
        if (res.status === 401) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            token = getAccessToken();
            return await fetchUsers(cursorId, isGoingBack); // reintenta la petición
          } else {
            handleAuthError();
            return;
          }
        }

        const json = await res.json();

        if (json.message) {
          console.error("Error:", json.message);
          return;
        }

        setData(json.users);
        setNextCursor(json.next_cursor ?? null);

        if (!isGoingBack && cursorId !== 0) {
          setPreviousCursors((prev) => [...prev, cursor]);
        }

        setCursor(cursorId);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [baseUrl, cursor, debouncedSearch, pageSize, refreshAccessToken, handleAuthError]
  );

  // ---- 🔄 EFECTOS ----

  // al cambiar búsqueda
  useEffect(() => {
    setPreviousCursors([]);
    setCursor(0);
    setCurrentPage(1);
    fetchUsers(0);
  }, [debouncedSearch, fetchUsers]);

  // al cambiar tamaño de página
  useEffect(() => {
    setPreviousCursors([]);
    setCursor(0);
    setCurrentPage(1);
    fetchUsers(0);
  }, [pageSize, fetchUsers]);

  // ---- ⏭️ PAGINACIÓN ----

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

  return {
    data,
    search,
    setSearch,
    isLoading,
    currentPage,
    pageSize,
    setPageSize,
    handleNext,
    handlePrevious,
    fetchUsers,
  };
};
