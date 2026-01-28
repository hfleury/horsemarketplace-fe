import { Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
    return (
        <footer className="bg-dark-100/30 border-t border-dark-200 pt-16 pb-8">
            <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-6">
                        <span className="text-2xl font-display font-bold bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent">
                            HorseMarket
                        </span>
                        <p className="text-text-secondary leading-relaxed">
                            The premier marketplace for horse enthusiasts. Buy, sell, and discover unique equine goods in a community-driven platform.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-dark-100 border border-dark-200 flex items-center justify-center text-text-secondary hover:bg-accent-purple hover:text-white hover:border-accent-purple transition-all duration-300"
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h4 className="text-text-primary font-bold text-lg mb-6">Marketplace</h4>
                        <ul className="space-y-4">
                            {['All NFTs', 'Art', 'Music', 'Domain Names', 'Virtual World', 'Collectibles'].map((item) => (
                                <li key={item}>
                                    <Link to="#" className="text-text-secondary hover:text-accent-purple transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h4 className="text-text-primary font-bold text-lg mb-6">Company</h4>
                        <ul className="space-y-4">
                            {['Explore', 'About', 'Contact Us', 'Our Blog', 'FAQ'].map((item) => (
                                <li key={item}>
                                    <Link to="#" className="text-text-secondary hover:text-accent-purple transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-text-primary font-bold text-lg mb-6">Subscribe Us</h4>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="info@yourgmail.com"
                                className="w-full bg-card border border-dark-200 rounded-xl py-3 pl-4 pr-12 text-text-primary focus:outline-none focus:border-accent-purple transition-all placeholder:text-text-muted"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent-purple text-white p-2 rounded-lg hover:bg-accent-purple/90 transition-colors">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-dark-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-text-muted text-sm">
                        © 2026 HorseMarket. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-text-muted">
                        <Link to="#" className="hover:text-text-primary transition-colors">Terms & Conditions</Link>
                        <Link to="#" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
