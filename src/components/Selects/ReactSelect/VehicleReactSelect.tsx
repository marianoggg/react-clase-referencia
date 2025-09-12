import React from "react";
import Select from "react-select";

export const VehicleReactSelect: React.FC = () => {
  const [formData, setFormData] = React.useState({
    car: null as string | null,
    color: null as string | null,
  });

  // Opciones para react-select
  const carOptions = [
    { value: "toyota", label: "Toyota" },
    { value: "ford", label: "Ford" },
    { value: "honda", label: "Honda" },
  ];

  const colorOptions = [
    { value: "rojo", label: "Rojo" },
    { value: "azul", label: "Azul" },
    { value: "negro", label: "Negro" },
  ];

  return (
    <div style={{ padding: "1rem", maxWidth: "300px" }}>
      <h6>Configurá tu auto</h6>

      {/* Select de autos con react-select */}
      <label>Auto:</label>
      <Select
        options={carOptions}
        value={carOptions.find((o) => o.value === formData.car)}
        onChange={(selectedOption) =>
          setFormData((prev) => ({
            ...prev,
            car: selectedOption?.value ?? null,
          }))
        }
        placeholder="Elegí un auto"
      />

      <br />

      {/* Select de colores con react-select */}
      <label>Color:</label>
      <Select
        options={colorOptions}
        value={colorOptions.find((o) => o.value === formData.color)}
        onChange={(selectedOption) =>
          setFormData((prev) => ({
            ...prev,
            color: selectedOption?.value ?? null,
          }))
        }
        placeholder="Elegí un color"
      />

      {/* Mostrar el objeto para ver los cambios */}
      <pre>{JSON.stringify(formData, null, 2)}</pre>

      {formData.car && formData.color && (
        <p>
          Elegiste un <strong>{formData.car}</strong> de color{" "}
          <strong>{formData.color}</strong>.
        </p>
      )}
    </div>
  );
};
