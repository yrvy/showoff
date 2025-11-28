-- Update clips bucket to 25MB limit (26214400 bytes)
UPDATE storage.buckets
SET file_size_limit = 26214400
WHERE id = 'clips';

-- Update thumbnails bucket to 5MB limit (5242880 bytes)
UPDATE storage.buckets
SET file_size_limit = 5242880
WHERE id = 'thumbnails';
