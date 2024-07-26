import { useState } from "react";
import { Button } from "./components/ui/button";
import { Login } from "./pages/login";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Login />
    </>
  );
}

export default App;
