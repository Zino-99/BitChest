import Navbar from '../../components/admin/Navbar'
import BitchestLogo from '../../assets/bitchest_logo.png'
import { Link } from 'react-router-dom'
export default function Profile() {
    return (
        <div className="grid grid-cols-[250px_1fr] min-h-screen">
            {/* SIDEBAR */}
            <aside className="bg-white text-zinc-700 p-4 grid grid-rows-[150px_1fr_100px] border-r border-[#EAEAEA]">
                <img src={BitchestLogo} alt="bitchest_logo" />
                <Navbar />
                <Link to="/">
                    <button className="py-2.5 text-start cursor-pointer px-8 w-full hover:bg-red-200 hover:text-red-800  text-sm rounded-[10px]">
                        Logout
                    </button>
                </Link>
            </aside>

            {/* CONTENT */}
            <main className="p-6  bg-white">Admin Profile Overview</main>
        </div>
    )
}
