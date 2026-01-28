import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ThemeProvider } from '../../context/ThemeContext';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
                <Header />
                <main className="flex-grow pt-20">
                    {children}
                </main>
                <Footer />
            </div>
        </ThemeProvider>
    );
};
