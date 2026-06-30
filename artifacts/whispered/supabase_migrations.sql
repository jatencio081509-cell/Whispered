-- Add plant-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS plant_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS plant_days_old INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS plant_waterings_needed INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS plant_last_watered TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS plant_total_waterings INTEGER DEFAULT 0;

-- Add pet-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS pet_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS pet_type TEXT DEFAULT 'dog' CHECK (pet_type IN ('cat', 'dog', 'fish')),
ADD COLUMN IF NOT EXISTS pet_days_old INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pet_plays_needed INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS pet_last_played TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pet_total_plays INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pet_happiness INTEGER DEFAULT 50 CHECK (pet_happiness >= 0 AND pet_happiness <= 100);

-- Create index on plant_level for faster queries
CREATE INDEX IF NOT EXISTS idx_users_plant_level ON users(plant_level);

-- Create index on pet_level for faster queries
CREATE INDEX IF NOT EXISTS idx_users_pet_level ON users(pet_level);
