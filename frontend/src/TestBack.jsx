import { useEffect, useState } from "react";

const TestBack = () => {

    const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/message") // ton endpoint Symfony
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Message depuis Symfony :</h1>
      <p>{message}</p>
    </div>
  );
};

export default TestBack;