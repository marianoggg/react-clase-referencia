import {
  NativeSelect,
  VehicleSelect,
} from "../components/Selects/NativeSelect/NativeSelect";
import { VehicleReactSelect } from "../components/Selects/ReactSelect/VehicleReactSelect";
import UsersReactSelect from "../components/Selects/ReactSelect/UsersReactSelect";
import UsersReactSelectBkSearch from "../components/Selects/ReactSelect/UsersReactSelectBkSearch";

type Props = {};

function Select({}: Props) {
  return (
    <>
      <div className="m-5 p-3 border rounded">
        <h5>User React Select </h5>
        <h6>Filtrado en frontend</h6>
        <UsersReactSelect />
      </div>
      <div className="m-5 p-3 border rounded">
        <h5>User React Select</h5>
        <h6>Filtrado en Backend</h6>
        <UsersReactSelectBkSearch />
      </div>

      <div className="m-5 p-3 border rounded">
        <h5>Native Select</h5>
        <h6>Ej. sin React</h6>
        <NativeSelect />
        <h6>Ej. con React</h6>
        <VehicleSelect />
      </div>
      <div className="m-5 p-3 border rounded">
        <h5>React Select</h5>
        <h6>Ej. simple</h6>
        <VehicleReactSelect />
      </div>
    </>
  );
}

export default Select;
