-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  weight REAL,
  breed TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create walks table
CREATE TABLE IF NOT EXISTS walks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_sec INTEGER NOT NULL,
  distance_m REAL NOT NULL,
  steps INTEGER,
  path JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create calendar_stamp table
CREATE TABLE IF NOT EXISTS calendar_stamp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  walk_date DATE NOT NULL,
  stamp_count INTEGER DEFAULT 1,
  goal_achieved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pet_id, walk_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_walks_pet_id ON walks(pet_id);
CREATE INDEX IF NOT EXISTS idx_walks_start_time ON walks(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_stamp_pet_id ON calendar_stamp(pet_id);
CREATE INDEX IF NOT EXISTS idx_calendar_stamp_walk_date ON calendar_stamp(walk_date);

-- Enable Row Level Security (RLS)
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE walks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_stamp ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pets
CREATE POLICY "Users can view their own pets"
  ON pets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pets"
  ON pets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets"
  ON pets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets"
  ON pets FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for walks
CREATE POLICY "Users can view walks for their pets"
  ON walks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = walks.pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert walks for their pets"
  ON walks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = walks.pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update walks for their pets"
  ON walks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = walks.pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete walks for their pets"
  ON walks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = walks.pet_id
      AND pets.user_id = auth.uid()
    )
  );

-- RLS Policies for calendar_stamp
CREATE POLICY "Users can view stamps for their pets"
  ON calendar_stamp FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = calendar_stamp.pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert stamps for their pets"
  ON calendar_stamp FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = calendar_stamp.pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stamps for their pets"
  ON calendar_stamp FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = calendar_stamp.pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete stamps for their pets"
  ON calendar_stamp FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = calendar_stamp.pet_id
      AND pets.user_id = auth.uid()
    )
  );



