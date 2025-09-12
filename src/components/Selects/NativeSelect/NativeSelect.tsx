import React, { useState } from "react";

type Props = {};

export function NativeSelect({}: Props) {
  return (
    <div className="d-flex gap-3">
      <span>
        <label htmlFor="frutas">Elige una fruta:</label>
        <select id="frutas" name="frutas">
          <option value="manzana">Manzana</option>
          <option value="banana">Banana</option>
          <option value="naranja">Naranja</option>
        </select>
      </span>

      <span>
        <select name="lenguajes" multiple size={4}>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="js">JavaScript</option>
          <option value="ts">TypeScript</option>
        </select>
      </span>
    </div>
  );
}

export const VehicleSelect: React.FC = () => {
  // Estado con un objeto que guarda varias selecciones
  const [formData, setFormData] = React.useState({
    car: "",
    color: "",
  });

  // Único manejador para todos los selects
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;

    // Usamos [name] para actualizar dinámicamente la propiedad
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h6>Configurá tu auto</h6>

      {/* Select de autos */}
      <label>
        Auto:
        <select name="car" value={formData.car} onChange={handleChange}>
          <option value="">-- Elegí un auto --</option>
          <option value="toyota">Toyota</option>
          <option value="ford">Ford</option>
          <option value="honda">Honda</option>
        </select>
      </label>

      <br />
      <br />

      {/* Select de colores */}
      <label>
        Color:
        <select name="color" value={formData.color} onChange={handleChange}>
          <option value="">-- Elegí un color --</option>
          <option value="rojo">Rojo</option>
          <option value="azul">Azul</option>
          <option value="negro">Negro</option>
        </select>
      </label>

      <br />
      <br />

      {/* Mostrar el objeto para que vean cómo cambia */}
      <pre>{JSON.stringify(formData, null, 2)}</pre>

      {/* Mostrar un mensaje de resumen si ambos están elegidos */}
      {formData.car && formData.color && (
        <p>
          Elegiste un <strong>{formData.car}</strong> de color{" "}
          <strong>{formData.color}</strong>.
        </p>
      )}
    </div>
  );
};
