import React from "react";

import { useForm, type SubmitHandler } from "react-hook-form";

// Definimos los tipos de los datos del formulario
interface IFormInput {
  firstName: string;
  lastName: string;
  email: string;
}

const userDetailForm = () => {
  // Inicializamos useForm
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  // Función que se ejecuta al enviar el formulario
  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    console.log("Datos del formulario:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>First Name:</label>
        <input
          {...register("firstName", { required: "First Name is required" })}
        />
        {errors.firstName && <p>{errors.firstName.message}</p>}
      </div>

      <div>
        <label>Last Name:</label>
        <input
          {...register("lastName", { required: "Last Name is required" })}
        />
        {errors.lastName && <p>{errors.lastName.message}</p>}
      </div>

      <div>
        <label>Email:</label>
        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
              message: "Email is not valid",
            },
          })}
        />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};

export default userDetailForm;
