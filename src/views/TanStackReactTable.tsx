import { useState, useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type Row,
} from "@tanstack/react-table";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import type { ColumnDef } from "@tanstack/react-table";
import { useFetchUsers } from "../hooks/table.hooks";

type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  type: string;
  email: string;
};

// Componente para seleccionar registros por página
function PageSizeSelector({
  pageSize,
  onPageSizeChange,
}: {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ color: "#666" }}>Mostrar</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        style={{
          padding: "4px 8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          backgroundColor: "white",
        }}
      >
        <option value={20}>20</option>
        <option value={40}>40</option>
        <option value={60}>60</option>
        <option value={100}>100</option>
      </select>
      <span style={{ color: "#666" }}>registros por página</span>
    </div>
  );
}

function UsersTanStackTable() {
  const BACKEND_IP = "localhost";
  const BACKEND_PORT = "8000";
  const ENDPOINT = "user/paginated/filtered-sync";
  const URL = `http://${BACKEND_IP}:${BACKEND_PORT}/${ENDPOINT}`;

  //const [data, setData] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  //const [cursor, setCursor] = useState<number>(0);
  //const [nextCursor, setNextCursor] = useState<number | null>(null);
  //const [previousCursors, setPreviousCursors] = useState<number[]>([]);
  //const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  //const [debouncedSearch, setDebouncedSearch] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(20);

  // Referencias para virtualización
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    fetchNext,
    fetchPrevious,
    nextCursor,
    previousCursors,
  } = useFetchUsers({
    url: URL,
    pageSize,
    search,
  });

  // Definición de columnas
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "first_name",
        header: "Nombre",
        cell: (info: any) => info.getValue(),
        size: 150,
      },
      {
        accessorKey: "last_name",
        header: "Apellido",
        cell: (info: any) => info.getValue(),
        size: 150,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info: any) => info.getValue(),
        size: 250,
      },
      {
        accessorKey: "type",
        header: "Tipo",
        cell: (info: any) => info.getValue(),
        size: 100,
      },
    ],
    []
  );

  // Configuración de la tabla
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
  });

  // Virtualización - CORREGIDO: useVirtualizer en lugar de useVirtual
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)
      : 0;

  const handleNext = () => {
    if (nextCursor !== null) {
      setCurrentPage((prev) => prev + 1);
      fetchNext();
    }
  };

  const handlePrevious = () => {
    if (previousCursors.length > 0) {
      setCurrentPage((prev) => prev - 1);
      fetchPrevious();
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // reset to first page on explicit Enter search
      setCurrentPage(1);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
  };

  return (
    <div style={{ padding: 20, maxWidth: 1200 }}>
      <h2>Usuarios - TanStack Table con Virtualización--</h2>

      {/* Campo de búsqueda */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o email..."
          value={search}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            width: "300px",
            marginRight: "20px",
          }}
        />

        <span style={{ fontWeight: "bold" }}>Página: {currentPage}</span>

        {isLoading && (
          <span style={{ marginLeft: "20px", color: "#666" }}>Buscando...</span>
        )}
      </div>

      {/* Tabla con virtualización */}
      <div
        ref={tableContainerRef}
        style={{
          height: "600px",
          overflow: "auto",
          border: "1px solid #ddd",
          borderRadius: "4px",
          marginBottom: "20px",
          position: "relative",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead
            style={{
              position: "sticky",
              top: 0,
              backgroundColor: "white",
              zIndex: 1,
            }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                style={{ borderBottom: "2px solid #ddd" }}
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                      width: header.getSize(),
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}
            {virtualRows.map((virtualRow: VirtualItem) => {
              const row = rows[virtualRow.index] as Row<User>;
              return (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: "1px solid #eee",
                    backgroundColor: "white",
                    height: "60px",
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        padding: "12px",
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
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

        {/*  {isLoading && <span style={{ marginLeft: "10px" }}>Cargando...</span>} */}

        <span
          style={{ marginLeft: "auto", color: "#666", marginRight: "20px" }}
        >
          {pageSize} usuarios mostrados
        </span>

        <PageSizeSelector
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}

export default UsersTanStackTable;
