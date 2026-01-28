import { Heart } from 'lucide-react';
import { Button } from '../common/Button';

interface CardProps {
    title: string;
    image: string;
    price: string;
    highestBid?: string;
    likes: number; // Keeping interface as is for compatibility with potential parent data, but unused in component
    author: string;
    authorAvatar?: string;
    countdown?: string;
}

export const Card = ({ title, image, price, highestBid, author, countdown }: CardProps) => {
    return (
        <div className="bg-card rounded-2xl overflow-hidden border border-dark-200 card-hover group relative animate-fade-in">
            <div className="relative h-64 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <button className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-accent-pink/20 hover:text-accent-pink transition-colors text-white">
                    <Heart className="w-4 h-4" />
                </button>
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                    Horse Goods
                </div>

                {countdown && (
                    <div className="absolute bottom-3 left-3 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-2 border border-white/10">
                        🔥 {countdown}
                    </div>
                )}

                {/* Place Bid Button appears on hover */}
                <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 transition-all duration-300 ${countdown ? 'translate-y-16 group-hover:translate-y-[-10px]' : 'translate-y-10 group-hover:translate-y-0'} opacity-0 group-hover:opacity-100`}>
                    <Button variant="glass" className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-white/20">
                        Place Bid
                    </Button>
                </div>
            </div>

            <div className="p-5">
                <h3 className="text-text-primary font-bold text-lg mb-1 truncate">{title}</h3>
                <p className="text-text-secondary text-sm mb-4">by <span className="text-accent-purple">@{author}</span></p>

                <div className="flex items-center justify-between border-t border-dark-200 pt-4">
                    <div>
                        <p className="text-text-secondary text-xs">Current Bid</p>
                        <p className="text-text-primary font-bold">{price} ETH</p>
                    </div>
                    <div className="text-right">
                        <p className="text-text-secondary text-xs">Highest Bid</p>
                        <p className="text-text-primary text-sm font-semibold">{highestBid || price} ETH</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
