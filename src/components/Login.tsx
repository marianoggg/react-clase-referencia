import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type LoginProcessResponse = {
  status: string;
  token?: string;
  user?: unknown;
  message?: string;
};

function Login() {
  const BACKEND_IP = "localhost";
  const BACKEND_PORT = "8000";
  const ENDPOINT = "users/login";
  const LOGIN_URL = `http://${BACKEND_IP}:${BACKEND_PORT}/${ENDPOINT}`;

  const userInputRef = useRef<HTMLInputElement>(null);
  const passInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const navigate = useNavigate();

  function loginProcess(dataObject: LoginProcessResponse) {
    if (dataObject.status === "success") {
      localStorage.setItem("token", dataObject.token ?? "");
      localStorage.setItem("user", JSON.stringify(dataObject.user));
      setMessage("Initiating session...");
      navigate("/dashboard");
    } else {
      setMessage(dataObject.message ?? "Unknown error");
    }
  }

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const username = userInputRef.current?.value ?? "";
    const password = passInputRef.current?.value ?? "";

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({ username, password });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    fetch(LOGIN_URL, requestOptions)
      .then((respond) => respond.json())
      .then((dataObject) => loginProcess(dataObject))
      .catch((error) => console.log("error", error));
  }

  function checkNewPassword(p: any) {
    //aca voy a checkear si la pass cyuample con lso requisitos minimos
    const tieneNumero = /\d/.test(p);
  }

  function handleChangeHola(e: any) {
    setNewPassword(e.target.value);
  }

  useEffect(() => {
    //se ejecuta 2°
    if (newPassword) checkNewPassword(newPassword);
    console.log("hola");

    //se ejecuta 1°
    return () => {
      console.log("pepito");
    };
  }, [newPassword]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h1 className="text-center mb-3">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="inputUser" className="form-label">
              User
            </label>
            <input
              type="text"
              className="form-control"
              id="inputUser"
              ref={userInputRef}
              aria-describedby="userHelp"
            />
            <div id="userHelp" className="form-text">
              Nunca compartas tu cuenta con nadie.
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="exampleInputPassword1" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="exampleInputPassword1"
              ref={passInputRef}
            />
          </div>

          <input type="text" onChange={handleChangeHola} />

          <button type="submit" className="btn btn-primary">
            Submit
          </button>
          <span className="ms-3">{message}</span>
        </form>
      </div>
    </div>
  );
}

export default Login;
