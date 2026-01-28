import { useEffect } from 'react';
import { Hero } from '../components/home/Hero';
import { HotBids } from '../components/home/HotBids';
import { NewItems } from '../components/home/NewItems';
import { Collections } from '../components/home/Collections';
import { SwedenHorseNews } from '../components/home/SwedenHorseNews';
import { Partners } from '../components/home/Partners';
import { AppPromo } from '../components/home/AppPromo';

export const Home = () => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Hero />
            <HotBids />
            <NewItems />
            <Collections />
            <SwedenHorseNews />
            <Partners />
            <AppPromo />
        </>
    );
};
