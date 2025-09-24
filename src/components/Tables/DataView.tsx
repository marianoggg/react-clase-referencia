type Props = {
  data: any[];
  nextCursor: number | null;
};

export default function DataView({ data, nextCursor }: Props) {
  //logica del componente

  //UI del componente
  return (
    <>
      <table
        className="table-primary"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>{nextCursor}</th>
            <th>APELLIDO</th>
            <th>TIPO</th>
            <th>EMAIL</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr key={user.id}>
              <td>{user.first_name}</td>
              <td>{user.last_name}</td>
              <td>{user.type}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
