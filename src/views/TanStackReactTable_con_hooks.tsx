import { useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type Row,
  type ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { usePaginatedUsers } from "../hooks/usePaginatedUsers";

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
        {[20, 40, 60, 100].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <span style={{ color: "#666" }}>registros por página</span>
    </div>
  );
}

export default function UsersTanStackTable() {
  const URL = "http://localhost:8000/user/paginated/filtered-sync";

  const {
    data,
    search,
    setSearch,
    isLoading,
    currentPage,
    pageSize,
    setPageSize,
    handleNext,
    handlePrevious,
  } = usePaginatedUsers({ baseUrl: URL });

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "first_name",
        header: "Nombre",
        cell: (info) => info.getValue(),
        size: 150,
      },
      {
        accessorKey: "last_name",
        header: "Apellido",
        cell: (info) => info.getValue(),
        size: 150,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => info.getValue(),
        size: 250,
      },
      {
        accessorKey: "type",
        header: "Tipo",
        cell: (info) => info.getValue(),
        size: 100,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows[0]?.start ?? 0;
  const paddingBottom =
    totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0);

  return (
    <div style={{ padding: 20, maxWidth: 1200 }}>
      <h2>Usuarios - TanStack Table con Virtualización</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
          <span style={{ marginLeft: 20, color: "#666" }}>Buscando...</span>
        )}
      </div>

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
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} style={{ borderBottom: "2px solid #ddd" }}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                      width: h.getSize(),
                    }}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: paddingTop }} />
              </tr>
            )}
            {virtualRows.map((vr: VirtualItem) => {
              const row = rows[vr.index] as Row<any>;
              return (
                <tr
                  key={row.id}
                  style={{ borderBottom: "1px solid #eee", height: "60px" }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={{ padding: "12px" }}>
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
                <td style={{ height: paddingBottom }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button onClick={handlePrevious} disabled={isLoading}>
          Anterior
        </button>
        <button onClick={handleNext} disabled={isLoading}>
          Siguiente
        </button>
        <span style={{ marginLeft: "auto", color: "#666", marginRight: 20 }}>
          {pageSize} usuarios mostrados
        </span>
        <PageSizeSelector pageSize={pageSize} onPageSizeChange={setPageSize} />
      </div>
    </div>
  );
}
