import { useState, useEffect } from 'react';
import { Search, Wallet, User, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from '../common/Button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const term = searchTerm.trim();
        navigate(term ? `/listings?q=${encodeURIComponent(term)}` : '/listings');
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Browse Listings', path: '/listings' },
        { name: 'Pages', path: '/pages' },
        { name: 'Explore', path: '/explore' },
        { name: 'Resources', path: '/resources' },
        { name: 'Create', path: '/create' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-background/80 backdrop-blur-md border-b border-dark-200/50 py-3'
                : 'bg-transparent py-5'
                }`}
        >
            <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-2xl font-display font-bold bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent">
                        HorseMarket
                    </span>
                </Link>

                {/* Desktop Search & Nav */}
                <div className="hidden lg:flex items-center gap-8">
                    {/* Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="relative group">
                        <input
                            type="text"
                            placeholder="Search items, collections..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 bg-dark-100 border border-dark-200 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all placeholder:text-text-muted text-text-primary"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent-purple" />
                    </form>

                    <nav className="flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-bold transition-colors hover:text-accent-purple ${location.pathname === link.path ? 'text-text-primary' : 'text-text-secondary'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Actions */}
                <div className="hidden lg:flex items-center gap-3">
                    <Button variant="glass" size="icon" className="rounded-full bg-dark-100 text-text-primary hover:bg-dark-200 border-dark-200">
                        <Wallet className="w-5 h-5" />
                    </Button>

                    {user ? (
                        <div className="relative group">
                            <Button variant="glass" size="icon" className="rounded-full bg-dark-100 text-text-primary hover:bg-dark-200 border-dark-200">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="Profile" className="w-5 h-5 rounded-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5" />
                                )}
                            </Button>
                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block animate-fade-in z-50">
                                <div className="bg-background border border-dark-200 rounded-xl shadow-xl overflow-hidden">
                                    <div className="px-4 py-3 border-b border-dark-200">
                                        <p className="text-sm font-semibold text-text-primary truncate">{user.username}</p>
                                        <p className="text-xs text-text-secondary truncate">{user.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <Link to="/profile" className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-dark-100 transition-colors">
                                            Profile
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link to="/admin" className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-dark-100 transition-colors">
                                                Admin
                                            </Link>
                                        )}
                                        <button
                                            onClick={logout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-dark-100 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login">
                            <Button variant="primary" size="sm" className="rounded-full">
                                Sign In
                            </Button>
                        </Link>
                    )}

                    <Button
                        variant="glass"
                        size="icon"
                        className="rounded-full bg-dark-100 text-text-primary hover:bg-dark-200 border-dark-200"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="lg:hidden flex items-center gap-4">
                    {!user && (
                        <Link to="/login">
                            <Button variant="primary" size="sm" className="rounded-full">
                                Sign In
                            </Button>
                        </Link>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="text-text-primary"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </Button>
                    <button
                        className="text-text-primary p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-background border-b border-dark-200 p-4 lg:hidden animate-slide-up shadow-xl">
                    <form className="mb-4" onSubmit={(e) => { handleSearchSubmit(e); setIsMobileMenuOpen(false); }}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-dark-100 border border-dark-200 rounded-xl py-3 px-4 text-text-primary"
                        />
                    </form>
                    <nav className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-lg font-bold text-text-secondary hover:text-text-primary"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        {user && (
                            <>
                                <div className="h-px bg-dark-200 my-2"></div>
                                <Link to="/profile" className="text-lg font-bold text-text-secondary hover:text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                                    Profile
                                </Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="text-lg font-bold text-text-secondary hover:text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                                        Admin
                                    </Link>
                                )}
                                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-lg font-bold text-left text-red-500 hover:text-red-400">
                                    Logout
                                </button>
                            </>
                        )}
                    </nav>
                    <div className="flex gap-4 mt-6 border-t border-dark-200 pt-6">
                        <Button variant="primary" className="flex-1 rounded-full">Connect Wallet</Button>
                    </div>
                </div>
            )}
        </header>
    );
};
