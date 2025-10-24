import { useState, useEffect, useCallback } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  // agrega otros campos que tu API devuelva
}

interface FetchUsersResponse {
  users: User[];
  next_cursor?: number | null;
  message?: string;
}

interface UseFetchUsersProps {
  url: string;
  pageSize?: number;
  search?: string;
}

export const useFetchUsers = ({ url, pageSize = 10, search = "" }: UseFetchUsersProps) => {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cursor, setCursor] = useState<number>(0);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [previousCursors, setPreviousCursors] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (cursorId: number = 0, isGoingBack: boolean = false) => {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            limit: pageSize,
            last_seen_id: cursorId,
            search,
          }),
        });

        const json: FetchUsersResponse = await res.json();

        if (json.message) {
          throw new Error(json.message);
        }

        setData(json.users);
        setNextCursor(json.next_cursor ?? null);

        // solo agregamos al historial si vamos hacia adelante
        if (!isGoingBack && cursorId !== 0) {
          setPreviousCursors((prev) => [...prev, cursor]);
        }

        setCursor(cursorId);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Error fetching users");
      } finally {
        setIsLoading(false);
      }
    },
    [url, pageSize, search, cursor]
  );

  const fetchNext = useCallback(() => {
    if (nextCursor != null) {
      fetchUsers(nextCursor);
    }
  }, [nextCursor, fetchUsers]);

  const fetchPrevious = useCallback(() => {
    if (previousCursors.length > 0) {
      const prevCursor = previousCursors[previousCursors.length - 1];
      setPreviousCursors((prev) => prev.slice(0, -1));
      fetchUsers(prevCursor, true);
    }
  }, [previousCursors, fetchUsers]);

  // carga inicial
useEffect(() => {
  setPreviousCursors([]);
  setCursor(0);
  fetchUsers(0);
}, [url, pageSize, search]);

useEffect(() => {
  console.log({ cursor, nextCursor, previousCursors });
}, [cursor, nextCursor, previousCursors]);

  return {
    data,
    isLoading,
    error,
    cursor,
    nextCursor,
    previousCursors,
    fetchUsers,
    fetchNext,
    fetchPrevious,
  };
};
