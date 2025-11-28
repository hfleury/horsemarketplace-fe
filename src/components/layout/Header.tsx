import { useState } from 'react';
import { cn } from '../../lib/cn';
import Container from './Container';
import Button from '../ui/Button';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { label: 'Explore', href: '#explore' },
        { label: 'Auctions', href: '#auctions' },
        { label: 'Collections', href: '#collections' },
        { label: 'Activity', href: '#activity' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-dark-300 bg-dark/80 backdrop-blur-lg">
            <Container>
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <a href="/" className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-primary" />
                            <span className="text-xl font-bold text-white">HorseMarket</span>
                        </a>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-text-secondary hover:text-white transition-colors duration-200"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-4">
                        {/* Search icon (placeholder) */}
                        <button
                            className="hidden md:flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:bg-dark-300 hover:text-white transition-colors"
                            aria-label="Search"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </button>

                        {/* Connect Wallet Button */}
                        <Button variant="gradient" size="sm" className="hidden md:inline-flex">
                            Connect Wallet
                        </Button>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden h-10 w-10 flex items-center justify-center rounded-full text-text-secondary hover:bg-dark-300 hover:text-white transition-colors"
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
                        'md:hidden overflow-hidden transition-all duration-300',
                        mobileMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'
                    )}
                >
                    <nav className="flex flex-col space-y-4 pt-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-text-secondary hover:text-white transition-colors duration-200"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                        <Button variant="gradient" size="md" className="w-full">
                            Connect Wallet
                        </Button>
                    </nav>
                </div>
            </Container>
        </header>
    );
}
