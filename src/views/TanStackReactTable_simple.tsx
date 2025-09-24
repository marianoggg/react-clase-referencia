import { useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

type Props = {};

type Person = {
  name: string;
  age: number;
};

const defaultData: Person[] = [
  { name: "Juan1", age: 32 },
  { name: "Juan2", age: 33 },
  { name: "Juan3", age: 34 },
  { name: "Juan4", age: 35 },
  { name: "Juan5", age: 36 },
  { name: "Juan6", age: 37 },
  { name: "Juan7", age: 38 },
  { name: "Juan8", age: 39 },
  { name: "Juan9", age: 30 },
  { name: "Juan10", age: 40 },
];

const defaultColumns = [
  {
    header: "Nombre",
    accessorKey: "name",
  },
  {
    header: "Edad",
    accessorKey: "age",
  },
];

function TanStackReactTable_simple({}: Props) {
  const table = useReactTable({
    data: defaultData,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    console.log("table", table);
  }, [table]);

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th>{header.column.columnDef.header as string}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => {
          //logica

          //ui
          return (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default TanStackReactTable_simple;
