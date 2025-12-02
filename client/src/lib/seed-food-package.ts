import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'client/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const MOCK_FOOD_PACKAGE = {
  name: 'Gourmet Italian Feast',
  description: 'Experience the authentic taste of Italy with our comprehensive catering package. Perfect for weddings, corporate events, and large gatherings. Includes a selection of antipasti, pasta courses, main dishes, and traditional desserts.',
  price_min: 1500,
  price_max: 3500,
  capacity: 100,
  photos: [
    'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80'
  ],
  status: 'published',
  service_type: 'catering',
  catering_details: {
    menu_options: ['Buffet', 'Plated'],
    dietary_accommodations: ['Vegetarian', 'Gluten-Free'],
    menu_categories: [
      {
        id: 'cat_antipasti',
        name: 'Antipasti',
        description: 'Traditional Italian starters',
        items: [
          {
            id: 'item_bruschetta',
            name: 'Classic Bruschetta',
            description: 'Toasted bread with fresh tomatoes, basil, garlic, and olive oil.',
            price: 8.00,
            image_url: 'https://images.unsplash.com/photo-1572695157363-bc31c5d5cc66?auto=format&fit=crop&w=800&q=80',
            popular: true,
            dietary_tags: ['vegetarian', 'vegan']
          },
          {
            id: 'item_calamari',
            name: 'Fried Calamari',
            description: 'Crispy fried squid rings served with marinara sauce.',
            price: 14.00,
            image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
            dietary_tags: ['seafood']
          }
        ]
      },
      {
        id: 'cat_pasta',
        name: 'Pasta Course',
        description: 'Handmade pasta dishes',
        items: [
          {
            id: 'item_lasagna',
            name: 'Beef Lasagna',
            description: 'Layers of pasta, meat sauce, béchamel, and cheese.',
            price: 18.00,
            image_url: 'https://images.unsplash.com/photo-1574868309219-5369482d1566?auto=format&fit=crop&w=800&q=80',
            popular: true
          },
          {
            id: 'item_ravioli',
            name: 'Spinach & Ricotta Ravioli',
            description: 'Served with a sage butter sauce.',
            price: 16.00,
            image_url: 'https://images.unsplash.com/photo-1587740986335-9917fe25c8eb?auto=format&fit=crop&w=800&q=80',
            dietary_tags: ['vegetarian']
          }
        ]
      },
      {
        id: 'cat_mains',
        name: 'Main Courses',
        items: [
          {
            id: 'item_chicken',
            name: 'Chicken Parmigiana',
            description: 'Breaded chicken breast topped with marinara and melted mozzarella.',
            price: 22.00,
            image_url: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=800&q=80'
          },
          {
            id: 'item_steak',
            name: 'Grilled Ribeye',
            description: 'Served with roasted potatoes and seasonal vegetables.',
            price: 32.00,
            image_url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80',
            popular: true,
            dietary_tags: ['gluten-free']
          }
        ]
      }
    ]
  }
};

async function seed() {
  // 1. Get a vendor (or create one)
  let { data: vendor } = await supabase.from('vendors').select('id').limit(1).single();

  if (!vendor) {
    console.log('No vendor found, creating one...');
    // Need a user first? Assuming there's at least one user or we can skip this for now if the DB is empty.
    // For simplicity, let's assume we can just insert a package if we have a vendor ID.
    // If no vendor, we might fail.
    // Let's try to find ANY vendor.
  }

  if (vendor) {
    console.log('Seeding package for vendor:', vendor.id);
    const { data, error } = await supabase.from('packages').insert({
      ...MOCK_FOOD_PACKAGE,
      vendor_id: vendor.id
    }).select();

    if (error) console.error('Error seeding package:', error);
    else console.log('Seeded package:', data);
  } else {
    console.error('No vendor found to attach package to. Please create a vendor first.');
  }
}

seed();
