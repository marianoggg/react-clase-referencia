//con filtrado en el front
//muy ineficiente con busquedas grandes

import { useState } from "react";
import { AsyncPaginate } from "react-select-async-paginate";

type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  type: string;
  email: string;
  [key: string]: any;
};

function UsersReactSelect() {
  const BACKEND_IP = "localhost";
  const BACKEND_PORT = "8000";
  const ENDPOINT = "user/paginated"; // 👈 nuevo endpoint
  const URL = `http://${BACKEND_IP}:${BACKEND_PORT}/${ENDPOINT}`;

  const [value, setValue] = useState<any>(null);

  async function loadOptions(
    search: string,
    loadedOptions: readonly any[],
    additional?: { cursor: number }
  ) {
    const cursor = additional?.cursor ?? 0;
    const token = localStorage.getItem("token");
    if (!token) {
      return { options: [], hasMore: false, additional: { cursor: 0 } };
    }

    try {
      const res = await fetch(URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit: 50, // traer más usuarios para filtrar localmente
          last_seen_id: cursor,
        }),
      });

      const json = await res.json();

      if (json.message) {
        console.error("Error:", json.message);
        return { options: [], hasMore: false, additional: { cursor } };
      }

      // 🔹 Filtrado local sobre first_name, last_name, email
      const filtered = json.users.filter((u: User) =>
        `${u.first_name} ${u.last_name} ${u.email}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );

      return {
        options: filtered.map((u: User) => ({
          value: u.id,
          label: `${u.first_name} ${u.last_name} (${u.email})`,
        })),
        hasMore: Boolean(json.next_cursor),
        additional: { cursor: json.next_cursor ?? 0 },
      };
    } catch (error) {
      console.error("Fetch error:", error);
      return { options: [], hasMore: false, additional: { cursor } };
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h2>Usuarios</h2>

      <AsyncPaginate
        value={value}
        loadOptions={loadOptions}
        onChange={setValue}
        additional={{ cursor: 0 }}
        placeholder="Buscar usuario..."
        debounceTimeout={300} // evita llamadas en cada letra
        isClearable
      />
    </div>
  );
}

export default UsersReactSelect;
