-- Plant Care Tracker schema. Apply once, then run seed.sql.
--
--   psql "$DATABASE_URL" -f supabase/schema.sql
--   psql "$DATABASE_URL" -f supabase/seed.sql

-- ----- Lookup tables -----

CREATE TABLE species (
  species_id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  species_name          VARCHAR(100) NOT NULL UNIQUE,
  recomm_water_interval INT NOT NULL CHECK (recomm_water_interval > 0)
);

CREATE TABLE location (
  location_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  location_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE room (
  room_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  location_id INT NOT NULL REFERENCES location(location_id) ON DELETE RESTRICT,
  room_name   VARCHAR(100) NOT NULL,
  UNIQUE (location_id, room_name)
);

CREATE INDEX idx_room_location_id ON room(location_id);

-- ----- Plants -----
-- approx_age is a fractional-year fallback; birthday is preferred and the
-- displayed age is derived from CURRENT_DATE - birthday.

CREATE TABLE plants (
  plant_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id     INT NOT NULL REFERENCES room(room_id) ON DELETE RESTRICT,
  species_id  INT NOT NULL REFERENCES species(species_id) ON DELETE RESTRICT,
  plant_name  VARCHAR(100) NOT NULL,
  approx_age  NUMERIC(4,1),
  birthday    DATE,
  pot_size    VARCHAR(50),
  image_url   TEXT
);

CREATE INDEX idx_plants_room_id    ON plants(room_id);
CREATE INDEX idx_plants_species_id ON plants(species_id);

-- ----- Care events (cascade on plant delete) -----

CREATE TABLE watering_event (
  water_event_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plant_id       INT NOT NULL REFERENCES plants(plant_id) ON DELETE CASCADE,
  watered_on     DATE NOT NULL,
  notes          TEXT
);

CREATE INDEX idx_watering_event_plant_id   ON watering_event(plant_id);
CREATE INDEX idx_watering_event_watered_on ON watering_event(watered_on DESC);

CREATE TABLE watering_schedule (
  schedule_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plant_id       INT NOT NULL REFERENCES plants(plant_id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  UNIQUE (plant_id, scheduled_date)
);

CREATE INDEX idx_watering_schedule_plant_id ON watering_schedule(plant_id);
CREATE INDEX idx_watering_schedule_date     ON watering_schedule(scheduled_date);

CREATE TABLE fertilization_event (
  fert_id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plant_id     INT NOT NULL REFERENCES plants(plant_id) ON DELETE CASCADE,
  fert_type    VARCHAR(100) NOT NULL,
  date_applied DATE NOT NULL
);

CREATE INDEX idx_fertilization_event_plant_id ON fertilization_event(plant_id);

CREATE TABLE repotting_event (
  repotting_id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plant_id          INT NOT NULL REFERENCES plants(plant_id) ON DELETE CASCADE,
  previous_pot_size VARCHAR(50),
  new_pot_size      VARCHAR(50) NOT NULL,
  repotted_on       DATE NOT NULL
);

CREATE INDEX idx_repotting_event_plant_id ON repotting_event(plant_id);

CREATE TABLE health_observation (
  health_id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plant_id         INT NOT NULL REFERENCES plants(plant_id) ON DELETE CASCADE,
  observation_date DATE NOT NULL,
  notes            TEXT NOT NULL
);

CREATE INDEX idx_health_observation_plant_id ON health_observation(plant_id);

-- ----- Extras for the UI (not part of CISC 450 requirements) -----

CREATE TABLE guestbook_entry (
  guestbook_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  visitor_name  VARCHAR(60)  NOT NULL,
  location      VARCHAR(80),
  mood          VARCHAR(8),
  message       VARCHAR(500) NOT NULL,
  signed_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_guestbook_entry_signed_at ON guestbook_entry(signed_at DESC);

CREATE TABLE site_counter (
  id   INT    PRIMARY KEY,
  hits BIGINT NOT NULL DEFAULT 0
);

-- Supabase Storage bucket for plant photos. Skipped on plain Postgres.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'plant-photos',
      'plant-photos',
      true,
      5242880,
      ARRAY['image/jpeg', 'image/png', 'image/webp']
    )
    ON CONFLICT (id) DO UPDATE
      SET public             = EXCLUDED.public,
          file_size_limit    = EXCLUDED.file_size_limit,
          allowed_mime_types = EXCLUDED.allowed_mime_types;
  END IF;
END $$;
