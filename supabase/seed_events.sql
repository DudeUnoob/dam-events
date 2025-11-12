-- Seed data for events table
-- DAM Event Platform - Testing/Development Data
-- Planner ID: 6eaadfb5-09af-4d02-839f-8f481609f875

-- ============================================
-- BUDGET EVENTS ($1,000 - $3,000)
-- ============================================

-- Event 1: Student Organization Mixer
INSERT INTO public.events (
  planner_id,
  event_date,
  budget,
  guest_count,
  location_address,
  location_lat,
  location_lng,
  event_type,
  description,
  status
) VALUES (
  '6eaadfb5-09af-4d02-839f-8f481609f875',
  '2025-02-14',
  1800.00,
  75,
  'University of Texas Student Union, Austin, TX 78712',
  30.2867,
  -97.7397,
  'student mixer',
  'Valentine''s Day themed mixer for campus organization. Looking for a fun, casual venue with music and light refreshments.',
  'active'
);

-- Event 2: Small Birthday Party
INSERT INTO public.events (
  planner_id,
  event_date,
  budget,
  guest_count,
  location_address,
  location_lat,
  location_lng,
  event_type,
  description,
  status
) VALUES (
  '6eaadfb5-09af-4d02-839f-8f481609f875',
  '2025-03-08',
  2200.00,
  60,
  'East Austin, Austin, TX 78702',
  30.2638,
  -97.7225,
  'birthday party',
  'Intimate 30th birthday celebration. Prefer outdoor garden setting with buffet-style catering.',
  'active'
);

-- Event 3: Community Fundraiser
INSERT INTO public.events (
  planner_id,
  event_date,
  budget,
  guest_count,
  location_address,
  location_lat,
  location_lng,
  event_type,
  description,
  status
) VALUES (
  '6eaadfb5-09af-4d02-839f-8f481609f875',
  '2025-04-12',
  2500.00,
  100,
  'South Austin, Austin, TX 78704',
  30.2433,
  -97.7739,
  'fundraiser',
  'Local nonprofit fundraiser event. Need community hall with basic catering and sound system for speeches.',
  'active'
);

-- ============================================
-- MID-RANGE EVENTS ($3,000 - $8,000)
-- ============================================

-- Event 4: Corporate Networking Event
INSERT INTO public.events (
  planner_id,
  event_date,
  budget,
  guest_count,
  location_address,
  location_lat,
  location_lng,
  event_type,
  description,
  status
) VALUES (
  '6eaadfb5-09af-4d02-839f-8f481609f875',
  '2025-02-28',
  5500.00,
  120,
  'Downtown Austin, 6th Street, Austin, TX 78701',
  30.2672,
  -97.7431,
  'corporate networking',
  'Tech industry networking mixer. Looking for modern rooftop or loft venue with cocktail-style service and city views.',
  'active'
);

-- Event 5: College Formal Dance
INSERT INTO public.events (
  planner_id,
  event_date,
  budget,
  guest_count,
  location_address,
  location_lat,
  location_lng,
  event_type,
  description,
  status
) VALUES (
  '6eaadfb5-09af-4d02-839f-8f481609f875',
  '2025-03-22',
  4500.00,
  150,
  'University of Texas Campus, Austin, TX 78712',
  30.2849,
  -97.7341,
  'formal dance',
  'Spring formal for student organization. Need elegant venue with dinner service, DJ, and dance floor.',
  'active'
);

-- Event 6: 50th Anniversary Celebration
INSERT INTO public.events (
  planner_id,
  event_date,
  budget,
  guest_count,
  location_address,
  location_lat,
  location_lng,
  event_type,
  description,
  status
) VALUES (
  '6eaadfb5-09af-4d02-839f-8f481609f875',
  '2025-05-17',
  6000.00,
  180,
  'Lake Travis Area, Austin, TX 78734',
  30.3894,
  -97.9203,
  'anniversary party',
  'Golden anniversary celebration. Prefer rustic or outdoor venue with family-style dining and live music.',
  'active'
);

-- Event 7: Startup Product Launch
INSERT INTO public.events (
  planner_id,
  event_date,
  budget,
  guest_count,
  location_address,
  location_lat,
  location_lng,
  event_type,
  description,
  status
) VALUES (
  '6eaadfb5-09af-4d02-839f-8f481609f875',
  '2025-04-03',
  7000.00,
  150,
  'Downtown Austin Tech District, Austin, TX 78701',
  30.2711,
  -97.7437,
  'product launch',
  'Tech startup product launch event. Looking for modern industrial space with AV equipment and upscale catering.',
  'active'
);

-- Event 8: Graduation Party
INSERT INTO public.events (
  planner_id,
  event_date,
  budget,
  guest_count,
  location_address,
  location_lat,
  location_lng,
  event_type,
  description,
  status
) VALUES (
  '6eaadfb5-09af-4d02-839f-8f481609f875',
  '2025-05-24',
  3800.00,
  100,
  'North Austin, Austin, TX 78758',
  30.3782,
  -97.7255,
  'graduation party',
  'College graduation celebration. Want unique venue like greenhouse or garden with brunch-style menu.',
  'active'
);

-- ============================================
-- PREMIUM EVENTS ($8,000 - $20,000)
-- ============================================

-- Event 9: Charity Gala
INSERT INTO public.events (
  planner_id,
  event_date,
  budget,
  guest_count,
  location_address,
  location_lat,
  location_lng,
  event_type,
  description,
  status
) VALUES (
  '6eaadfb5-09af-4d02-839f-8f481609f875',
  '2025-06-14',
  12000.00,
  250,
  'Downtown Austin Convention District, Austin, TX 78701',
  30.2635,
  -97.7412,
  'charity gala',
  'Annual charity gala fundraiser. Need luxury ballroom with 5-course dinner, premium bar, and live entertainment.',
  'active'
);

-- Event 10: Wedding Reception
INSERT INTO public.events (
  planner_id,
  event_date,
  budget,
  guest_count,
  location_address,
  location_lat,
  location_lng,
  event_type,
  description,
  status
) VALUES (
  '6eaadfb5-09af-4d02-839f-8f481609f875',
  '2025-07-19',
  15000.00,
  200,
  'Austin Hill Country, Austin, TX 78746',
  30.2915,
  -97.8341,
  'wedding reception',
  'Summer wedding reception. Looking for estate or waterfront venue with outdoor ceremony space and elegant reception.',
  'active'
);

-- Event 11: Corporate Annual Conference
INSERT INTO public.events (
  planner_id,
  event_date,
  budget,
  guest_count,
  location_address,
  location_lat,
  location_lng,
  event_type,
  description,
  status
) VALUES (
  '6eaadfb5-09af-4d02-839f-8f481609f875',
  '2025-09-15',
  10000.00,
  200,
  'Austin Business District, Austin, TX 78701',
  30.2698,
  -97.7456,
  'corporate conference',
  'Full-day corporate conference with breakout sessions. Need professional venue with AV equipment, catering for breakfast and lunch.',
  'active'
);

-- Event 12: Music Festival Party
INSERT INTO public.events (
  planner_id,
  event_date,
  budget,
  guest_count,
  location_address,
  location_lat,
  location_lng,
  event_type,
  description,
  status
) VALUES (
  '6eaadfb5-09af-4d02-839f-8f481609f875',
  '2025-10-11',
  14000.00,
  500,
  'Zilker Park Area, Austin, TX 78704',
  30.2672,
  -97.7731,
  'music festival',
  'Large outdoor music and food festival. Need open-air venue with stage, multiple food stations, and beverage service.',
  'active'
);

-- Event 13: Holiday Gala
INSERT INTO public.events (
  planner_id,
  event_date,
  budget,
  guest_count,
  location_address,
  location_lat,
  location_lng,
  event_type,
  description,
  status
) VALUES (
  '6eaadfb5-09af-4d02-839f-8f481609f875',
  '2025-12-13',
  11000.00,
  180,
  'West Lake Hills, Austin, TX 78746',
  30.2978,
  -97.8125,
  'holiday party',
  'Upscale holiday gala for corporate clients. Prefer historic or elegant venue with premium dining and classical entertainment.',
  'active'
);

-- ============================================
-- DRAFT/PLANNING EVENTS
-- ============================================

-- Event 14: Summer Pool Party (Draft)
INSERT INTO public.events (
  planner_id,
  event_date,
  budget,
  guest_count,
  location_address,
  location_lat,
  location_lng,
  event_type,
  description,
  status
) VALUES (
  '6eaadfb5-09af-4d02-839f-8f481609f875',
  '2025-08-02',
  8500.00,
  250,
  'Barton Springs Area, Austin, TX 78704',
  30.2639,
  -97.7717,
  'pool party',
  'Large summer pool party with DJ and tropical theme. Still finalizing details and budget.',
  'draft'
);

-- Event 15: Art Gallery Opening (Draft)
INSERT INTO public.events (
  planner_id,
  event_date,
  budget,
  guest_count,
  location_address,
  location_lat,
  location_lng,
  event_type,
  description,
  status
) VALUES (
  '6eaadfb5-09af-4d02-839f-8f481609f875',
  '2025-11-08',
  9000.00,
  150,
  'SoCo Arts District, Austin, TX 78704',
  30.2534,
  -97.7556,
  'art gallery opening',
  'Contemporary art gallery opening reception. Looking for museum or gallery space with passed appetizers and wine service.',
  'draft'
);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check that all events were inserted successfully
SELECT
  COUNT(*) as total_events,
  MIN(budget) as lowest_budget,
  MAX(budget) as highest_budget,
  AVG(budget) as avg_budget,
  MIN(guest_count) as min_guests,
  MAX(guest_count) as max_guests,
  AVG(guest_count) as avg_guests
FROM public.events
WHERE planner_id = '6eaadfb5-09af-4d02-839f-8f481609f875';

-- Display all inserted events by date
SELECT
  event_type,
  event_date,
  guest_count,
  budget,
  status,
  SUBSTRING(location_address, 1, 30) as location
FROM public.events
WHERE planner_id = '6eaadfb5-09af-4d02-839f-8f481609f875'
ORDER BY event_date;

-- Show events grouped by status
SELECT
  status,
  COUNT(*) as event_count,
  AVG(budget) as avg_budget,
  AVG(guest_count) as avg_guests
FROM public.events
WHERE planner_id = '6eaadfb5-09af-4d02-839f-8f481609f875'
GROUP BY status;

-- Events by budget range (matching package tiers)
SELECT
  CASE
    WHEN budget < 3000 THEN 'Budget ($1k-$3k)'
    WHEN budget >= 3000 AND budget < 8000 THEN 'Mid-Range ($3k-$8k)'
    ELSE 'Premium ($8k+)'
  END as budget_tier,
  COUNT(*) as event_count,
  STRING_AGG(event_type, ', ') as event_types
FROM public.events
WHERE planner_id = '6eaadfb5-09af-4d02-839f-8f481609f875'
GROUP BY budget_tier
ORDER BY MIN(budget);
