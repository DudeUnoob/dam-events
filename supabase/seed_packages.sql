-- Seed data for packages table
-- DAM Event Platform - Testing/Development Data
-- Vendor ID: 021a966e-3572-4bc9-9b0c-cefe6e1aa6a7

-- ============================================
-- BUDGET PACKAGES ($1,500 - $3,000)
-- ============================================

-- Package 1: Intimate Garden Party
INSERT INTO public.packages (
  vendor_id,
  name,
  description,
  venue_details,
  catering_details,
  entertainment_details,
  price_min,
  price_max,
  capacity,
  photos,
  status
) VALUES (
  '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7',
  'Intimate Garden Party Package',
  'Perfect for small gatherings up to 75 guests. Our charming garden venue features string lights, natural landscaping, and a covered pavilion. Includes buffet-style catering with seasonal menu and background music setup.',
  '{"name": "Secret Garden Pavilion", "capacity": 75, "amenities": ["String Lights", "Covered Pavilion", "Garden Seating", "Restrooms", "Parking for 30"]}'::jsonb,
  '{"menu_options": ["Buffet Style", "Seasonal Vegetables", "Choice of 2 Proteins", "Non-alcoholic Beverages"], "dietary_accommodations": ["Vegetarian", "Gluten-Free"]}'::jsonb,
  '{"type": "Background Music System", "equipment": ["Bluetooth Speaker System", "Wireless Microphone"]}'::jsonb,
  1500.00,
  2500.00,
  75,
  ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3'],
  'published'
);

-- Package 2: Community Hall Classic
INSERT INTO public.packages (
  vendor_id,
  name,
  description,
  venue_details,
  catering_details,
  entertainment_details,
  price_min,
  price_max,
  capacity,
  photos,
  status
) VALUES (
  '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7',
  'Community Hall Classic Package',
  'Budget-friendly option for student organizations and community events. Spacious indoor hall with basic catering and sound system. Great for meetings, mixers, and casual gatherings up to 100 guests.',
  '{"name": "Riverside Community Hall", "capacity": 100, "amenities": ["Dance Floor", "Tables & Chairs", "Kitchen Access", "WiFi", "Parking for 40"]}'::jsonb,
  '{"menu_options": ["Buffet Style", "Pizza & Appetizers", "Soft Drinks & Water"], "dietary_accommodations": ["Vegetarian"]}'::jsonb,
  '{"type": "Basic Sound System", "equipment": ["PA System", "2 Microphones", "Aux Input"]}'::jsonb,
  1200.00,
  2000.00,
  100,
  ARRAY['https://images.unsplash.com/photo-1511795409834-ef04bbd61622'],
  'published'
);

-- ============================================
-- MID-RANGE PACKAGES ($3,000 - $7,000)
-- ============================================

-- Package 3: Modern Loft Experience
INSERT INTO public.packages (
  vendor_id,
  name,
  description,
  venue_details,
  catering_details,
  entertainment_details,
  price_min,
  price_max,
  capacity,
  photos,
  status
) VALUES (
  '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7',
  'Modern Loft Experience Package',
  'Trendy industrial loft space in downtown with exposed brick, high ceilings, and floor-to-ceiling windows. Includes upscale plated dinner service and professional DJ. Perfect for formal events and celebrations up to 150 guests.',
  '{"name": "Downtown Loft Studio", "capacity": 150, "amenities": ["Exposed Brick Walls", "Floor-to-Ceiling Windows", "Modern Bar", "Lounge Area", "AV Equipment", "Valet Parking"]}'::jsonb,
  '{"menu_options": ["Plated Dinner", "3-Course Meal", "Premium Bar Package", "Coffee & Dessert Bar"], "dietary_accommodations": ["Vegetarian", "Vegan", "Gluten-Free", "Nut-Free"]}'::jsonb,
  '{"type": "Professional DJ", "equipment": ["Premium Sound System", "Dance Floor Lighting", "Wireless Mics", "Projection Screen"]}'::jsonb,
  3500.00,
  6000.00,
  150,
  ARRAY['https://images.unsplash.com/photo-1519167758481-83f29da8c2b0', 'https://images.unsplash.com/photo-1478147427282-58a87a120781'],
  'published'
);

-- Package 4: Rooftop Sunset Celebration
INSERT INTO public.packages (
  vendor_id,
  name,
  description,
  venue_details,
  catering_details,
  entertainment_details,
  price_min,
  price_max,
  capacity,
  photos,
  status
) VALUES (
  '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7',
  'Rooftop Sunset Celebration Package',
  'Stunning rooftop venue with panoramic city views. Features cocktail-style reception with passed hors d''oeuvres and premium bar. Includes live acoustic entertainment. Ideal for networking events and upscale receptions.',
  '{"name": "Skyline Rooftop Terrace", "capacity": 120, "amenities": ["360° City Views", "Outdoor Terrace", "Indoor Backup Space", "Premium Bar", "Ambient Lighting", "Climate Control"]}'::jsonb,
  '{"menu_options": ["Passed Hors d''oeuvres", "Artisan Cheese & Charcuterie", "Premium Open Bar", "Signature Cocktails"], "dietary_accommodations": ["Vegetarian", "Vegan", "Gluten-Free", "Kosher"]}'::jsonb,
  '{"type": "Live Acoustic Duo", "equipment": ["Small PA System", "Stage Area", "Mood Lighting"]}'::jsonb,
  4000.00,
  7000.00,
  120,
  ARRAY['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3', 'https://images.unsplash.com/photo-1556761175-4b46a572b786'],
  'published'
);

-- Package 5: Rustic Barn Gathering
INSERT INTO public.packages (
  vendor_id,
  name,
  description,
  venue_details,
  catering_details,
  entertainment_details,
  price_min,
  price_max,
  capacity,
  photos,
  status
) VALUES (
  '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7',
  'Rustic Barn Gathering Package',
  'Charming restored barn venue with countryside setting. Features family-style catering with farm-to-table menu and live country/folk music. Perfect for casual celebrations and themed events up to 180 guests.',
  '{"name": "Heritage Barn & Grounds", "capacity": 180, "amenities": ["Restored Barn Interior", "Outdoor Lawn Space", "Fire Pit Area", "String Lighting", "Picnic Tables", "Ample Parking"]}'::jsonb,
  '{"menu_options": ["Family Style Service", "Farm-to-Table Menu", "BBQ Options", "Local Beer & Wine"], "dietary_accommodations": ["Vegetarian", "Gluten-Free"]}'::jsonb,
  '{"type": "Live Country/Folk Band", "equipment": ["Sound System", "Stage", "Dance Floor Space"]}'::jsonb,
  3200.00,
  5500.00,
  180,
  ARRAY['https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3'],
  'published'
);

-- Package 6: Corporate Conference Package
INSERT INTO public.packages (
  vendor_id,
  name,
  description,
  venue_details,
  catering_details,
  entertainment_details,
  price_min,
  price_max,
  capacity,
  photos,
  status
) VALUES (
  '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7',
  'Corporate Conference Package',
  'Professional conference center with breakout rooms and main auditorium. Includes continental breakfast, lunch buffet, and all AV equipment. Perfect for corporate events, seminars, and professional gatherings.',
  '{"name": "Executive Conference Center", "capacity": 200, "amenities": ["Main Auditorium", "3 Breakout Rooms", "High-Speed WiFi", "Projectors & Screens", "Whiteboards", "Registration Area"]}'::jsonb,
  '{"menu_options": ["Continental Breakfast", "Lunch Buffet", "Coffee & Snack Stations", "Afternoon Refreshments"], "dietary_accommodations": ["Vegetarian", "Vegan", "Gluten-Free", "Nut-Free", "Halal"]}'::jsonb,
  '{"type": "Full AV Support", "equipment": ["Professional Projectors", "Sound System", "Lapel Mics", "Tech Support Staff"]}'::jsonb,
  3800.00,
  6500.00,
  200,
  ARRAY['https://images.unsplash.com/photo-1505373877841-8d25f7d46678', 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04'],
  'published'
);

-- ============================================
-- PREMIUM PACKAGES ($7,000 - $15,000)
-- ============================================

-- Package 7: Grand Ballroom Gala
INSERT INTO public.packages (
  vendor_id,
  name,
  description,
  venue_details,
  catering_details,
  entertainment_details,
  price_min,
  price_max,
  capacity,
  photos,
  status
) VALUES (
  '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7',
  'Grand Ballroom Gala Package',
  'Luxurious ballroom with crystal chandeliers, elegant decor, and white-glove service. Features gourmet 5-course plated dinner, premium bar, and live orchestra. The ultimate choice for formal galas and black-tie events.',
  '{"name": "Crystal Grand Ballroom", "capacity": 300, "amenities": ["Crystal Chandeliers", "Grand Entrance", "VIP Lounge", "Premium Bar", "Stage with Lighting", "Dance Floor", "Coat Check", "Valet Service"]}'::jsonb,
  '{"menu_options": ["5-Course Gourmet Dinner", "Premium Bar Service", "Champagne Toast", "Wedding Cake/Dessert Display", "Late Night Snacks"], "dietary_accommodations": ["Vegetarian", "Vegan", "Gluten-Free", "Kosher", "Halal", "Custom Requests"]}'::jsonb,
  '{"type": "Live Orchestra (12-piece)", "equipment": ["Professional Sound System", "Stage Lighting", "Wireless Microphones", "DJ for Dancing", "Photo Booth"]}'::jsonb,
  9000.00,
  15000.00,
  300,
  ARRAY['https://images.unsplash.com/photo-1519167758481-83f29da8c2b0', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3', 'https://images.unsplash.com/photo-1478147427282-58a87a120781'],
  'published'
);

-- Package 8: Waterfront Estate Experience
INSERT INTO public.packages (
  vendor_id,
  name,
  description,
  venue_details,
  catering_details,
  entertainment_details,
  price_min,
  price_max,
  capacity,
  photos,
  status
) VALUES (
  '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7',
  'Waterfront Estate Experience Package',
  'Exclusive lakefront estate with manicured gardens, private dock, and stunning water views. Features chef-prepared cuisine, premium beverage service, and live jazz ensemble. Perfect for sophisticated celebrations and high-end events.',
  '{"name": "Lakeside Manor Estate", "capacity": 250, "amenities": ["Lakefront Views", "Manicured Gardens", "Private Dock", "Outdoor Ceremony Site", "Climate-Controlled Pavilion", "Bridal Suite", "Groom''s Room", "Private Parking"]}'::jsonb,
  '{"menu_options": ["Chef''s Tasting Menu", "Plated Multi-Course Dinner", "Premium Wine Pairings", "Custom Cocktail Menu", "Champagne Bar"], "dietary_accommodations": ["Vegetarian", "Vegan", "Gluten-Free", "Pescatarian", "Kosher", "Any Special Request"]}'::jsonb,
  '{"type": "Live Jazz Ensemble", "equipment": ["Premium Audio System", "Elegant Lighting", "Multiple Microphones", "Dance Floor with LED", "String Quartet for Ceremony"]}'::jsonb,
  10000.00,
  18000.00,
  250,
  ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3'],
  'published'
);

-- Package 9: Museum Gallery Soiree
INSERT INTO public.packages (
  vendor_id,
  name,
  description,
  venue_details,
  catering_details,
  entertainment_details,
  price_min,
  price_max,
  capacity,
  photos,
  status
) VALUES (
  '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7',
  'Museum Gallery Soiree Package',
  'Unique event space within a contemporary art museum. Features passed canapes, premium bar, and ambient music among world-class artwork. Includes private gallery access and curator-led tours. Unforgettable setting for sophisticated gatherings.',
  '{"name": "Modern Art Museum Gallery", "capacity": 180, "amenities": ["Gallery Exhibition Space", "Sculpture Garden", "Private Viewing Areas", "Museum Shop Access", "Modern Facilities", "Security Staff"]}'::jsonb,
  '{"menu_options": ["Gourmet Passed Canapes", "Artisan Cheese Display", "Premium Open Bar", "Champagne Service", "Dessert Station"], "dietary_accommodations": ["Vegetarian", "Vegan", "Gluten-Free", "Kosher"]}'::jsonb,
  '{"type": "Ambient Jazz Trio", "equipment": ["Discrete Sound System", "Mood Lighting", "Wireless Mics for Speeches"]}'::jsonb,
  7500.00,
  12000.00,
  180,
  ARRAY['https://images.unsplash.com/photo-1556761175-4b46a572b786', 'https://images.unsplash.com/photo-1478147427282-58a87a120781'],
  'published'
);

-- ============================================
-- SPECIALTY PACKAGES
-- ============================================

-- Package 10: Outdoor Festival Package
INSERT INTO public.packages (
  vendor_id,
  name,
  description,
  venue_details,
  catering_details,
  entertainment_details,
  price_min,
  price_max,
  capacity,
  photos,
  status
) VALUES (
  '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7',
  'Outdoor Festival Package',
  'Large open-air venue perfect for festivals, outdoor concerts, and major celebrations. Features multiple food stations, beverage tents, and main stage for live entertainment. Accommodates up to 500 guests with weather contingency plan.',
  '{"name": "Greenfield Festival Grounds", "capacity": 500, "amenities": ["Main Stage", "Covered Food Area", "Multiple Beverage Stations", "Restroom Facilities", "Parking for 200+", "Weather Tent Backup", "Security"]}'::jsonb,
  '{"menu_options": ["Food Truck Style Stations", "BBQ & Grilled Options", "Vegetarian Station", "Dessert Tent", "Multiple Bar Areas"], "dietary_accommodations": ["Vegetarian", "Vegan", "Gluten-Free"]}'::jsonb,
  '{"type": "Live Band & DJ", "equipment": ["Main Stage with Full Sound", "Professional Lighting Rig", "Multiple Wireless Mics", "DJ Booth", "Generator Power"]}'::jsonb,
  8000.00,
  14000.00,
  500,
  ARRAY['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3', 'https://images.unsplash.com/photo-1506157786151-b8491531f063'],
  'published'
);

-- Package 11: Historic Mansion Package
INSERT INTO public.packages (
  vendor_id,
  name,
  description,
  venue_details,
  catering_details,
  entertainment_details,
  price_min,
  price_max,
  capacity,
  photos,
  status
) VALUES (
  '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7',
  'Historic Mansion Package',
  'Elegant Victorian-era mansion with period architecture and formal gardens. Features refined plated dinner service, premium beverage selection, and classical entertainment. Perfect for weddings and upscale celebrations.',
  '{"name": "Victorian Heritage Mansion", "capacity": 150, "amenities": ["Grand Staircase", "Library & Parlor Rooms", "Formal Dining Room", "Rose Garden", "Fountain Courtyard", "Historical Architecture"]}'::jsonb,
  '{"menu_options": ["Formal Plated Dinner", "4-Course Menu", "Wine Pairings", "Champagne Service", "Custom Cake Display"], "dietary_accommodations": ["Vegetarian", "Vegan", "Gluten-Free", "Kosher"]}'::jsonb,
  '{"type": "String Quartet & Piano", "equipment": ["Sound Enhancement", "Classical Lighting", "Microphones", "DJ for Reception Dancing"]}'::jsonb,
  7000.00,
  11000.00,
  150,
  ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3'],
  'published'
);

-- Package 12: Urban Warehouse Party
INSERT INTO public.packages (
  vendor_id,
  name,
  description,
  venue_details,
  catering_details,
  entertainment_details,
  price_min,
  price_max,
  capacity,
  photos,
  status
) VALUES (
  '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7',
  'Urban Warehouse Party Package',
  'Raw industrial warehouse space with exposed beams and concrete floors - a blank canvas for creative events. Includes food stations, full bar, and high-energy entertainment. Ideal for modern celebrations and themed parties.',
  '{"name": "Industrial Arts Warehouse", "capacity": 250, "amenities": ["Open Floor Plan", "Exposed Beams", "Loading Dock Access", "Customizable Lighting", "Bar Area", "Lounge Zones", "Street Parking"]}'::jsonb,
  '{"menu_options": ["Food Stations", "Taco Bar", "Slider Station", "Asian Fusion", "Full Bar Service"], "dietary_accommodations": ["Vegetarian", "Vegan", "Gluten-Free"]}'::jsonb,
  '{"type": "Professional DJ & Lighting", "equipment": ["Premium Sound System", "DJ Booth", "Dance Floor Lighting", "Fog Machine", "LED Uplighting", "Photo Booth"]}'::jsonb,
  4500.00,
  8000.00,
  250,
  ARRAY['https://images.unsplash.com/photo-1492684223066-81342ee5ff30', 'https://images.unsplash.com/photo-1519167758481-83f29da8c2b0'],
  'published'
);

-- Package 13: Intimate Wine Cellar Dinner
INSERT INTO public.packages (
  vendor_id,
  name,
  description,
  venue_details,
  catering_details,
  entertainment_details,
  price_min,
  price_max,
  capacity,
  photos,
  status
) VALUES (
  '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7',
  'Intimate Wine Cellar Dinner Package',
  'Exclusive underground wine cellar with vaulted ceilings and temperature-controlled environment. Features chef''s table experience with wine pairings. Perfect for intimate dinners and exclusive gatherings up to 50 guests.',
  '{"name": "Estate Wine Cellar", "capacity": 50, "amenities": ["Vaulted Stone Ceilings", "Wine Collection Backdrop", "Intimate Lighting", "Chef''s Table Setup", "Private Entrance"]}'::jsonb,
  '{"menu_options": ["Chef''s Tasting Menu", "7-Course Experience", "Premium Wine Pairings", "Sommelier Service", "Artisan Cheese Course"], "dietary_accommodations": ["Vegetarian", "Vegan", "Gluten-Free", "Any Custom Request"]}'::jsonb,
  '{"type": "Live Classical Guitar", "equipment": ["Ambient Sound System", "Microphone for Toasts"]}'::jsonb,
  5000.00,
  9000.00,
  50,
  ARRAY['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed'],
  'published'
);

-- Package 14: Beachside Celebration Package
INSERT INTO public.packages (
  vendor_id,
  name,
  description,
  venue_details,
  catering_details,
  entertainment_details,
  price_min,
  price_max,
  capacity,
  photos,
  status
) VALUES (
  '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7',
  'Beachside Celebration Package',
  'Stunning beachfront venue with white sand and ocean views. Features seafood-focused menu, tiki bar, and tropical entertainment. Includes ceremony setup on the beach and reception pavilion. Perfect for destination-style celebrations.',
  '{"name": "Sunset Beach Pavilion", "capacity": 200, "amenities": ["Private Beach Access", "Open-Air Pavilion", "Tiki Bar", "Ceremony Arch & Seating", "Fire Pits", "Boardwalk", "Restrooms", "Beach Parking"]}'::jsonb,
  '{"menu_options": ["Seafood Buffet", "Grilled Specialties", "Tropical Fruit Display", "Tiki Bar Service", "Signature Beach Cocktails"], "dietary_accommodations": ["Vegetarian", "Pescatarian", "Gluten-Free"]}'::jsonb,
  '{"type": "Steel Drum Band & DJ", "equipment": ["Weather-Resistant Sound System", "Wireless Mics", "String Lights", "DJ for Dancing"]}'::jsonb,
  6000.00,
  10000.00,
  200,
  ARRAY['https://images.unsplash.com/photo-1519046904884-53103b34b206', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3'],
  'published'
);

-- Package 15: Greenhouse Garden Party
INSERT INTO public.packages (
  vendor_id,
  name,
  description,
  venue_details,
  catering_details,
  entertainment_details,
  price_min,
  price_max,
  capacity,
  photos,
  status
) VALUES (
  '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7',
  'Greenhouse Garden Party Package',
  'Enchanting botanical greenhouse filled with exotic plants and natural light. Features garden-to-table cuisine and acoustic entertainment. A unique, Instagram-worthy venue for daytime events and brunch celebrations.',
  '{"name": "Botanical Conservatory", "capacity": 100, "amenities": ["Glass Greenhouse Structure", "Tropical & Native Plants", "Natural Lighting", "Garden Pathways", "Outdoor Terrace", "Climate Control"]}'::jsonb,
  '{"menu_options": ["Garden Brunch Menu", "Farm-to-Table Lunch", "Botanical Cocktails", "Fresh Juice Bar", "Artisan Pastries"], "dietary_accommodations": ["Vegetarian", "Vegan", "Gluten-Free", "Organic Options"]}'::jsonb,
  '{"type": "Acoustic Singer/Guitarist", "equipment": ["Small Sound System", "Wireless Mic", "Ambient Music Playlist"]}'::jsonb,
  3500.00,
  6000.00,
  100,
  ARRAY['https://images.unsplash.com/photo-1511795409834-ef04bbd61622', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed'],
  'published'
);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check that all packages were inserted successfully
SELECT
  COUNT(*) as total_packages,
  MIN(price_min) as lowest_price,
  MAX(price_max) as highest_price,
  AVG(capacity) as avg_capacity
FROM public.packages
WHERE vendor_id = '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7';

-- Display all inserted packages
SELECT
  name,
  capacity,
  price_min,
  price_max,
  status
FROM public.packages
WHERE vendor_id = '021a966e-3572-4bc9-9b0c-cefe6e1aa6a7'
ORDER BY price_min;
