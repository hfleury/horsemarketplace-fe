import { Button } from '../common/Button';
import { Smartphone } from 'lucide-react';

export const AppPromo = () => {
    return (
        <section className="section-spacing relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark-100/50 to-dark" />

            <div className="container-custom relative flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-8">
                    <span className="text-accent-purple font-bold tracking-wider uppercase text-sm">Mobile App</span>
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                        Manage your <span className="gradient-text">Horse Market</span> on the go.
                    </h2>
                    <p className="text-text-secondary text-lg max-w-lg">
                        Get exclusive access to drops, track your bids in real-time, and manage your collection from anywhere with our mobile app.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Button variant="outline" size="lg" className="h-16 px-8 rounded-xl border-dark-300 hover:border-white hover:bg-transparent">
                            <div className="flex items-center gap-3 text-left">
                                <Smartphone className="w-8 h-8" />
                                <div>
                                    <div className="text-xs text-text-secondary">Download on the</div>
                                    <div className="text-white font-bold text-lg leading-none">App Store</div>
                                </div>
                            </div>
                        </Button>
                        <Button variant="outline" size="lg" className="h-16 px-8 rounded-xl border-dark-300 hover:border-white hover:bg-transparent">
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                    {/* Play Store generic icon/shape */}
                                    <div className="w-4 h-4 border-l-[6px] border-t-[4px] border-b-[4px] border-l-black border-t-transparent border-b-transparent ml-1"></div>
                                </div>
                                <div>
                                    <div className="text-xs text-text-secondary">Get it on</div>
                                    <div className="text-white font-bold text-lg leading-none">Google Play</div>
                                </div>
                            </div>
                        </Button>
                    </div>
                </div>

                <div className="flex-1 relative">
                    {/* Abstract mockup */}
                    <div className="relative z-10 mx-auto w-64 h-[500px] bg-dark-200 rounded-[3rem] border-8 border-dark-300 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-6 bg-dark-300 rounded-b-xl z-20 mx-auto w-32" />
                        <div className="p-4 pt-12 text-center">
                            <h3 className="text-white font-bold text-xl mb-4">HorseMarket App</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-dark-100 p-3 rounded-xl flex gap-3">
                                        <div className="w-10 h-10 bg-dark-300 rounded-lg animate-pulse" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-2 bg-dark-300 rounded w-3/4 animate-pulse" />
                                            <div className="h-2 bg-dark-300 rounded w-1/2 animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-purple/10 rounded-full blur-[80px] -z-10" />
                </div>
            </div>
        </section>
    );
};
