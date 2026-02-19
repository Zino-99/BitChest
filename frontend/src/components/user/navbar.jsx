import { Link } from 'react-router-dom'

const NavLinks = [
    { name: 'Dashboard', path: '/Dashboard' },
    { name: 'Market', path: '/Dashboard/Market' },
    { name: 'Wallet', path: '/Dashboard/Wallet' },
]

export default function Navbar() {
    return (
        <nav>
            <ul className="flex flex-col gap-2.5">
                {NavLinks.map((navlink, index) => (
                    <Link to={navlink.path}>
                        <li
                            className="py-2.5 px-8 hover:bg-[#E6E6E6] hover:text-black text-[#666666] text-sm rounded-[10px]"
                            key={index}
                        >
                            {navlink.name}
                        </li>
                    </Link>
                ))}
            </ul>
        </nav>
    )
}
