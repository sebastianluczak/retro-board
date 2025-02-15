export default function Header() {
    return (
        <header className="flex items-center justify-between w-full h-16 px-8 py-4 bg-primary text-white">
        <h1 className="text-2xl font-bold">Retro::board</h1>
        <nav>
            <ul className="flex gap-4">
            <li>
                <a href="/" className="hover:underline">Home</a>
            </li>
            <li>
                <a href="/about" className="hover:underline">About</a>
            </li>
            </ul>
        </nav>
        </header>
    );
}