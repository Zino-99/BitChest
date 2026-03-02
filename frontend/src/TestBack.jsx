// import { useEffect, useState } from "react";

// const TestBack = () => {

//     const [message, setMessage] = useState("");

//   useEffect(() => {
//     fetch("http://localhost:8000/api/message") // ton endpoint Symfony
//       .then((res) => res.json())
//       .then((data) => setMessage(data.message))
//       .catch((err) => console.error(err));
//   }, []);

//   return (
//     <div>
//       <h1>Message depuis Symfony :</h1>
//       <p>{message}</p>
//     </div>
//   );
// };

// export default TestBack;
import { useEffect, useState } from 'react'

const TestBack = () => {
    // State to store the message fetched from backend
    const [message, setMessage] = useState('')

    // useEffect runs once after the component mounts
    useEffect(() => {
        // Fetch data from the Symfony backend API
        fetch('http://localhost:8000/api/message') // your Symfony endpoint
            .then((res) => res.json()) // parse the response as JSON
            .then((data) => setMessage(data.message)) // update state with the message
            .catch((err) => console.error(err)) // log any errors
    }, []) // empty dependency array ensures this runs only once

    return (
        <div>
            {/* Display title */}
            <h1>Message depuis Symfony :</h1>
            {/* Display the fetched message */}
            <p>{message}</p>
        </div>
    )
}

export default TestBack
