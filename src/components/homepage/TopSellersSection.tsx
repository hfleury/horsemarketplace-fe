import React from 'react';
import Card from '../ui/Card';
import SectionTitle from '../ui/SectionTitle';

export default function TopSellersSection() {
    return (
        <Card>
            <SectionTitle
                title="Top Sellers"
                viewAllLabel="View All Sellers"
                onViewAll={() => console.log('View all sellers')}
            />
            {/* You can later map real seller data here */}
        </Card>
    );
}