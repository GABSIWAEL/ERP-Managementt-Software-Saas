-- Add new columns to assets table
ALTER TABLE assets ADD COLUMN IF NOT EXISTS asset_code VARCHAR(100) UNIQUE;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS value DECIMAL(12, 2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS purchase_date DATE;

-- Make type column nullable (drop existing NOT NULL constraint if it exists)
ALTER TABLE assets ALTER COLUMN type DROP NOT NULL;

-- Make category NOT NULL with default
ALTER TABLE assets ALTER COLUMN category SET NOT NULL;
ALTER TABLE assets ALTER COLUMN category SET DEFAULT 'General';
