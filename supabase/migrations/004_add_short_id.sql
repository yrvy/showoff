-- Add short_id column to clips table
ALTER TABLE public.clips
ADD COLUMN short_id TEXT UNIQUE;

-- Create function to generate random short ID
CREATE OR REPLACE FUNCTION generate_short_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to ensure unique short_id
CREATE OR REPLACE FUNCTION get_unique_short_id()
RETURNS TEXT AS $$
DECLARE
  new_short_id TEXT;
  done BOOLEAN := FALSE;
BEGIN
  WHILE NOT done LOOP
    new_short_id := generate_short_id();
    IF NOT EXISTS (SELECT 1 FROM public.clips WHERE short_id = new_short_id) THEN
      done := TRUE;
    END IF;
  END LOOP;
  RETURN new_short_id;
END;
$$ LANGUAGE plpgsql;

-- Set default value for short_id using the function
ALTER TABLE public.clips
ALTER COLUMN short_id SET DEFAULT get_unique_short_id();

-- Update existing clips with short IDs
UPDATE public.clips
SET short_id = get_unique_short_id()
WHERE short_id IS NULL;

-- Make short_id required
ALTER TABLE public.clips
ALTER COLUMN short_id SET NOT NULL;

-- Create index on short_id for faster lookups
CREATE INDEX idx_clips_short_id ON public.clips(short_id);
