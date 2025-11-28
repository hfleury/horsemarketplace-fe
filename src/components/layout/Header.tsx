import { useState } from 'react';
import { cn } from '../../lib/cn';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const navLinks = [
        { label: 'Home', href: '/' },
        { label: 'Pages', href: '#' },
        { label: 'Explore', href: '#explore' },
        { label: 'Resources', href: '#' },
        { label: 'Create', href: '/create' },
    ];

    const handleLoginClick = () => {
        window.dispatchEvent(new Event('show-login'));
        setMobileMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-dark/80 backdrop-blur-lg transition-colors">
            <div className="flex items-center px-6 py-6 xl:px-24">
                {/* Logo */}
                <a href="/" className="shrink-0 flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-primary" />
                    <span className="text-xl font-bold text-white">HorseMarket</span>
                </a>

                {/* Search Bar */}
                <form className="relative ml-12 mr-8 hidden basis-3/12 lg:block xl:ml-[8%]">
                    <input
                        type="search"
                        className="w-full rounded-full border border-dark-300 bg-dark-200 py-2.5 pl-4 pr-10 text-sm text-white placeholder-text-secondary focus:border-accent-purple focus:outline-none focus:ring-1 focus:ring-accent-purple"
                        placeholder="Search..."
                    />
                    <span className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-text-secondary">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                </form>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center">
                    <nav className="flex items-center space-x-6 xl:space-x-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm font-medium text-text-secondary hover:text-white transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Right side actions */}
                <div className="ml-auto flex items-center space-x-4 lg:ml-8 xl:ml-12">
                    {/* Wallet Button (Visual Placeholder) */}
                    <button className="hidden lg:flex items-center justify-center h-10 w-10 rounded-full hover:bg-dark-300 text-text-secondary hover:text-white transition-colors">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </button>

                    {/* Auth/Profile */}
                    <div className="relative">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className="flex items-center space-x-2 rounded-full border border-dark-300 bg-dark-200 p-1 pr-4 hover:border-accent-purple transition-colors"
                                >
                                    <img
                                        src={user.avatar || 'https://i.pravatar.cc/150?img=68'}
                                        alt={user.username}
                                        className="h-8 w-8 rounded-full"
                                    />
                                    <span className="hidden lg:block text-sm font-medium text-white">{user.username}</span>
                                </button>

                                {profileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-dark-300 bg-dark-200 py-1 shadow-xl">
                                        <a href="#profile" className="block px-4 py-2 text-sm text-text-secondary hover:bg-dark-300 hover:text-white">
                                            Profile
                                        </a>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-dark-300 hover:text-white"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden lg:block">
                                <Button variant="gradient" size="sm" onClick={handleLoginClick}>
                                    Login
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full text-text-secondary hover:bg-dark-300 hover:text-white transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                className={cn(
                    'lg:hidden overflow-hidden transition-all duration-300 bg-dark-200 border-b border-dark-300',
                    mobileMenuOpen ? 'max-h-screen' : 'max-h-0'
                )}
            >
                <nav className="flex flex-col space-y-4 p-6">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-lg font-medium text-text-secondary hover:text-white transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className="pt-4 border-t border-dark-300">
                        {!user && (
                            <Button variant="gradient" size="md" className="w-full" onClick={handleLoginClick}>
                                Login
                            </Button>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}
