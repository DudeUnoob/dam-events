import React from 'react';
import { createClient } from '@/lib/supabase/server';
import FoodPackageDetail from '@/components/planner/package/FoodPackageDetail';
import { Package } from '@/types';
import { notFound } from 'next/navigation';

interface PageProps {
    params: {
        id: string;
    };
}

export default async function PackageDetailPage({ params }: PageProps) {
    const supabase = createClient();

    const { data: pkg, error } = await supabase
        .from('packages')
        .select('*, vendor:vendors(*)')
        .eq('id', params.id)
        .single();

    if (error || !pkg) {
        console.error('Error fetching package:', error);
        // For demo purposes, if not found or error, we might want to show a mock or 404
        // But since we want to demonstrate the UI, let's try to return a mock if the ID is "demo"
        if (params.id === 'demo') {
            return <FoodPackageDetail pkg={MOCK_PACKAGE} />;
        }
        notFound();
    }

    // Cast to Package type, ensuring jsonb fields are handled
    const packageData = pkg as unknown as Package;

    return <FoodPackageDetail pkg={packageData} />;
}

const MOCK_PACKAGE: Package = {
    id: 'demo',
    vendor_id: 'v1',
    name: 'Premium Wedding Catering Package',
    description: 'A complete catering solution for your special day, featuring a wide array of appetizers, main courses, and desserts. Our experienced chefs use only the freshest ingredients to create a memorable dining experience for you and your guests.',
    price_min: 2500,
    price_max: 5000,
    capacity: 150,
    photos: [
        'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80'
    ],
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    catering_details: {
        menu_options: ['Buffet', 'Plated'],
        dietary_accommodations: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Nut-Free'],
        menu_categories: [
            {
                id: 'cat1',
                name: 'Appetizers',
                description: 'Start your meal with these delicious bites.',
                items: [
                    {
                        id: 'item1',
                        name: 'Mini Crab Cakes',
                        description: 'Lump crab meat with fresh herbs and remoulade sauce.',
                        price: 12.00,
                        image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
                        popular: true,
                        dietary_tags: ['seafood']
                    },
                    {
                        id: 'item2',
                        name: 'Caprese Skewers',
                        description: 'Fresh mozzarella, cherry tomatoes, and basil with balsamic glaze.',
                        price: 8.00,
                        image_url: 'https://images.unsplash.com/photo-1529312266912-b33cf6227e24?auto=format&fit=crop&w=800&q=80',
                        dietary_tags: ['vegetarian', 'gluten-free']
                    }
                ]
            },
            {
                id: 'cat2',
                name: 'Main Courses',
                description: 'Hearty and satisfying entrees.',
                items: [
                    {
                        id: 'item3',
                        name: 'Grilled Salmon',
                        description: 'Atlantic salmon with lemon herb butter and roasted asparagus.',
                        price: 28.00,
                        image_url: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=800&q=80',
                        popular: true,
                        dietary_tags: ['gluten-free']
                    },
                    {
                        id: 'item4',
                        name: 'Herb Roasted Chicken',
                        description: 'Free-range chicken breast with garlic mashed potatoes.',
                        price: 24.00,
                        image_url: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80'
                    }
                ]
            }
        ]
    },
    vendor: {
        id: 'v1',
        user_id: 'u1',
        business_name: 'Gourmet Delights Catering',
        description: 'Premier catering service in the metro area.',
        services: ['catering'],
        location_address: '123 Foodie Lane',
        location_lat: 0,
        location_lng: 0,
        event_types: ['Weddings', 'Corporate'],
        status: 'verified',
        created_at: '',
        updated_at: ''
    }
};
