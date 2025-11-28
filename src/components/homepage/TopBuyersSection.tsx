import React from 'react';
import Card from '../ui/Card';
import SectionTitle from '../ui/SectionTitle';

export default function TopBuyersSection() {
    return (
        <Card>
            <SectionTitle
                title="Top Buyers"
                viewAllLabel="View All Buyers"
                onViewAll={() => console.log('View all buyers')}
            />
        </Card>
    );
}