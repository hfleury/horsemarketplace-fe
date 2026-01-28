
interface SectionHeaderProps {
    title: string;
    subtitle?: string;
}

export const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => {
    return (
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            {subtitle && <p className="text-text-secondary max-w-2xl mx-auto">{subtitle}</p>}
            <div className="w-24 h-1 bg-gradient-brand mx-auto mt-6 rounded-full opacity-50"></div>
        </div>
    );
};
