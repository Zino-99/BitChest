import { useState } from 'react'


import { Link } from 'react-router-dom'

function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            <h1 class="text-3xl font-bold underline bg-blue-500">
                Hello world!
            </h1>
            <Link to="/Dashboard ">
                <p>Accéder au Dashboard</p>
            </Link>
        </>
    )
}

export default App
