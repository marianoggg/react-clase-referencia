import { useState, useEffect } from "react";

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
}

export const usePaginatedUsers = ({
  baseUrl,
  defaultPageSize = 20,
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

  // debounce del buscador
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // fetch principal
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
  };

  // fetch al cambiar la búsqueda
  useEffect(() => {
    setPreviousCursors([]);
    setCursor(0);
    setCurrentPage(1);
    fetchUsers(0);
  }, [debouncedSearch]);

  // fetch al cambiar el tamaño de página
  useEffect(() => {
    setPreviousCursors([]);
    setCursor(0);
    setCurrentPage(1);
    fetchUsers(0);
  }, [pageSize]);

  // navegación
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
