import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface BoostResultCardProps {
    title: string;
    children: ReactNode;
    linkTo: string;
    linkLabel: string;
}

export const BoostResultCard = ({ title, children, linkTo, linkLabel }: BoostResultCardProps) => (
    <section className="py-24 px-6 md:px-12 bg-background">
        <div className="container-custom max-w-xl mx-auto text-center rounded-2xl border border-dark-200 bg-card p-10">
            <h1 className="text-3xl font-bold mb-4">{title}</h1>
            <div className="text-text-secondary space-y-2">{children}</div>
            <Link to={linkTo} className="mt-8 inline-block text-accent-purple font-bold hover:underline">
                {linkLabel}
            </Link>
        </div>
    </section>
);
