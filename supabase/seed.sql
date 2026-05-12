-- Demo data. Apply after schema.sql.
--   psql "$DATABASE_URL" -f supabase/seed.sql

-- ----- Species -----

INSERT INTO species (species_name, recomm_water_interval) VALUES
  ('Monstera deliciosa', 7),
  ('Snake Plant',        14),
  ('Pothos',             7),
  ('Fiddle Leaf Fig',    10),
  ('ZZ Plant',           21),
  ('Spider Plant',       7),
  ('Peace Lily',         5),
  ('Boston Fern',        4),
  ('Aloe Vera',          21),
  ('Rubber Plant',       10),
  ('English Ivy',        7),
  ('Calathea Orbifolia', 5),
  ('Bird of Paradise',   7),
  ('Jade Plant',         14);

-- ----- Locations + rooms -----

INSERT INTO location (location_name) VALUES
  ('Home'),
  ('Office');

INSERT INTO room (location_id, room_name) VALUES
  ((SELECT location_id FROM location WHERE location_name = 'Home'),   'Living Room'),
  ((SELECT location_id FROM location WHERE location_name = 'Home'),   'Bedroom'),
  ((SELECT location_id FROM location WHERE location_name = 'Home'),   'Kitchen'),
  ((SELECT location_id FROM location WHERE location_name = 'Office'), 'Desk'),
  ((SELECT location_id FROM location WHERE location_name = 'Home'),   'Bathroom'),
  ((SELECT location_id FROM location WHERE location_name = 'Home'),   'Sunroom');

-- ----- Plants -----

INSERT INTO plants (room_id, species_id, plant_name, approx_age, pot_size, image_url) VALUES
  ((SELECT room_id FROM room WHERE room_name = 'Living Room'),
   (SELECT species_id FROM species WHERE species_name = 'Monstera deliciosa'),
   'Big Monty', 3.0, '10 inch',
   'https://images.pexels.com/photos/3097770/pexels-photo-3097770.jpeg?auto=compress&w=640'),
  ((SELECT room_id FROM room WHERE room_name = 'Bedroom'),
   (SELECT species_id FROM species WHERE species_name = 'Snake Plant'),
   'Sansi', 2.0, '6 inch',
   'https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&w=640'),
  ((SELECT room_id FROM room WHERE room_name = 'Kitchen'),
   (SELECT species_id FROM species WHERE species_name = 'Pothos'),
   'Trailing Tom', 1.5, '4 inch',
   'https://images.pexels.com/photos/3076899/pexels-photo-3076899.jpeg?auto=compress&w=640'),
  ((SELECT room_id FROM room WHERE room_name = 'Living Room'),
   (SELECT species_id FROM species WHERE species_name = 'Fiddle Leaf Fig'),
   'Fig Newton', 4.0, '12 inch',
   'https://images.pexels.com/photos/6207364/pexels-photo-6207364.jpeg?auto=compress&w=640'),
  ((SELECT room_id FROM room WHERE room_name = 'Desk'),
   (SELECT species_id FROM species WHERE species_name = 'ZZ Plant'),
   'Zeke', 1.0, '6 inch',
   'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg?auto=compress&w=640'),
  ((SELECT room_id FROM room WHERE room_name = 'Bathroom'),
   (SELECT species_id FROM species WHERE species_name = 'Boston Fern'),
   'Fernie Sanders', 1.0, '8 inch',
   'https://images.pexels.com/photos/931176/pexels-photo-931176.jpeg?auto=compress&w=640'),
  ((SELECT room_id FROM room WHERE room_name = 'Sunroom'),
   (SELECT species_id FROM species WHERE species_name = 'Aloe Vera'),
   'Aloe Estefan', 2.5, '6 inch',
   'https://images.pexels.com/photos/4751978/pexels-photo-4751978.jpeg?auto=compress&w=640'),
  ((SELECT room_id FROM room WHERE room_name = 'Living Room'),
   (SELECT species_id FROM species WHERE species_name = 'Rubber Plant'),
   'Buddy', 3.5, '12 inch',
   'https://images.pexels.com/photos/6913121/pexels-photo-6913121.jpeg?auto=compress&w=640'),
  ((SELECT room_id FROM room WHERE room_name = 'Kitchen'),
   (SELECT species_id FROM species WHERE species_name = 'English Ivy'),
   'Ivy League', 0.5, '4 inch',
   'https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&w=640'),
  ((SELECT room_id FROM room WHERE room_name = 'Sunroom'),
   (SELECT species_id FROM species WHERE species_name = 'Calathea Orbifolia'),
   'Cal', 1.0, '6 inch',
   'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg?auto=compress&w=640'),
  ((SELECT room_id FROM room WHERE room_name = 'Bedroom'),
   (SELECT species_id FROM species WHERE species_name = 'Jade Plant'),
   'Pendragon', 4.0, '5 inch',
   'https://images.pexels.com/photos/1407305/pexels-photo-1407305.jpeg?auto=compress&w=640'),
  ((SELECT room_id FROM room WHERE room_name = 'Desk'),
   (SELECT species_id FROM species WHERE species_name = 'Bird of Paradise'),
   'Bird', 2.0, '14 inch',
   'https://images.pexels.com/photos/6231803/pexels-photo-6231803.jpeg?auto=compress&w=640');

-- ----- Watering events -----

INSERT INTO watering_event (plant_id, watered_on, notes) VALUES
  ((SELECT plant_id FROM plants WHERE plant_name = 'Big Monty'),      CURRENT_DATE - 5,  'Soil was dry'),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Big Monty'),      CURRENT_DATE - 12, NULL),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Sansi'),          CURRENT_DATE - 20, 'Light watering'),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Trailing Tom'),   CURRENT_DATE - 2,  NULL),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Fig Newton'),     CURRENT_DATE - 15, 'Yellow leaves appearing'),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Zeke'),           CURRENT_DATE - 25, NULL),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Fernie Sanders'), CURRENT_DATE - 3,  NULL),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Fernie Sanders'), CURRENT_DATE - 7,  'Misted leaves too'),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Fernie Sanders'), CURRENT_DATE - 11, NULL),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Fernie Sanders'), CURRENT_DATE - 16, NULL),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Aloe Estefan'),   CURRENT_DATE - 18, 'Drained well'),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Aloe Estefan'),   CURRENT_DATE - 40, NULL),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Buddy'),          CURRENT_DATE - 4,  NULL),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Buddy'),          CURRENT_DATE - 14, NULL),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Buddy'),          CURRENT_DATE - 25, NULL),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Ivy League'),     CURRENT_DATE - 6,  NULL),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Ivy League'),     CURRENT_DATE - 14, NULL),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Cal'),            CURRENT_DATE - 8,  'Showing crispy edges'),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Cal'),            CURRENT_DATE - 14, NULL),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Pendragon'),      CURRENT_DATE - 6,  NULL),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Pendragon'),      CURRENT_DATE - 22, NULL),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Bird'),           CURRENT_DATE - 10, NULL),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Bird'),           CURRENT_DATE - 18, NULL);

-- ----- Watering schedule -----
-- A few past-missed dates so the calendar shows red badges on day one.
-- The DO block at the end of this file projects future dates out a year.

INSERT INTO watering_schedule (plant_id, scheduled_date) VALUES
  ((SELECT plant_id FROM plants WHERE plant_name = 'Aloe Estefan'),   CURRENT_DATE - 5),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Bird'),           CURRENT_DATE - 3),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Cal'),            CURRENT_DATE - 2)
ON CONFLICT (plant_id, scheduled_date) DO NOTHING;

-- ----- Fertilization events -----

INSERT INTO fertilization_event (plant_id, fert_type, date_applied) VALUES
  ((SELECT plant_id FROM plants WHERE plant_name = 'Big Monty'),    'Liquid 10-10-10',    CURRENT_DATE - 30),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Fig Newton'),   'Slow-release pellets', CURRENT_DATE - 45),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Buddy'),        'Fish emulsion',      CURRENT_DATE - 14),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Bird'),         'Liquid 20-20-20',    CURRENT_DATE - 28),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Aloe Estefan'), 'Cactus fertilizer',  CURRENT_DATE - 50);

-- ----- Repotting events -----

INSERT INTO repotting_event (plant_id, previous_pot_size, new_pot_size, repotted_on) VALUES
  ((SELECT plant_id FROM plants WHERE plant_name = 'Big Monty'),      '8 inch',  '10 inch', CURRENT_DATE - 60),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Trailing Tom'),   '3 inch',  '4 inch',  CURRENT_DATE - 90),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Buddy'),          '10 inch', '12 inch', CURRENT_DATE - 35),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Fernie Sanders'), '6 inch',  '8 inch',  CURRENT_DATE - 21),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Bird'),           '12 inch', '14 inch', CURRENT_DATE - 70);

-- ----- Health observations -----

INSERT INTO health_observation (plant_id, observation_date, notes) VALUES
  ((SELECT plant_id FROM plants WHERE plant_name = 'Big Monty'),      CURRENT_DATE - 7,  'New leaf unfurling, looking healthy'),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Fig Newton'),     CURRENT_DATE - 14, 'Yellowing leaves, may be overwatering'),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Trailing Tom'),   CURRENT_DATE - 3,  'Growing fast, may need to prune'),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Cal'),            CURRENT_DATE - 4,  'Crispy brown edges, boosting humidity'),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Fernie Sanders'), CURRENT_DATE - 10, 'New fronds emerging'),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Buddy'),          CURRENT_DATE - 6,  'Leaves looking glossy and full'),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Bird'),           CURRENT_DATE - 12, 'Spider mite spotted, wiped down'),
  ((SELECT plant_id FROM plants WHERE plant_name = 'Pendragon'),      CURRENT_DATE - 2,  'Plump and happy');

-- ----- Future watering schedule -----
-- For each plant, project a year of waterings forward from its last watering
-- (or today, if there are none) at the species' interval. The app does the
-- same regeneration on addPlant / logWatering.

DO $$
DECLARE
  p          plants%ROWTYPE;
  base_date  DATE;
  ival       INT;
BEGIN
  FOR p IN SELECT * FROM plants LOOP
    SELECT recomm_water_interval INTO ival
      FROM species
     WHERE species_id = p.species_id;

    IF ival IS NULL OR ival <= 0 THEN
      CONTINUE;
    END IF;

    SELECT COALESCE(MAX(watered_on), CURRENT_DATE) INTO base_date
      FROM watering_event
     WHERE plant_id = p.plant_id;

    INSERT INTO watering_schedule (plant_id, scheduled_date)
    SELECT p.plant_id,
           (base_date + (n * ival))::date
      FROM generate_series(1, CEIL(365.0 / ival)::int + 1) AS n
     WHERE (base_date + (n * ival))::date >  CURRENT_DATE
       AND (base_date + (n * ival))::date <= CURRENT_DATE + 365
    ON CONFLICT (plant_id, scheduled_date) DO NOTHING;
  END LOOP;
END $$;

-- ----- Retro-edition seed data -----

INSERT INTO guestbook_entry (visitor_name, location, mood, message) VALUES
  ('Aaron F.',    'St. Paul, MN', '🌿', 'Loving the retro vibe!! Greensleeves slaps.'),
  ('Nathan R.',   'St. Paul, MN', '✨', 'Whoever made the WordArt title is a genius'),
  ('GardenGal98', 'Phoenix, AZ',  '🌻',
   'just found this site searching for "houseplant tracker" and OMG so cute!! adding to my bookmarks');

INSERT INTO site_counter (id, hits) VALUES (1, 106);
