-- Add slug column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add unique constraint on slug (for non-null values)
ALTER TABLE projects
ADD CONSTRAINT projects_slug_unique UNIQUE (slug);

-- Create an index on slug for faster lookups
CREATE INDEX IF NOT EXISTS projects_slug_idx ON projects(slug);

-- Add comment to document the column
COMMENT ON COLUMN projects.slug IS 'URL-friendly slug for the project detail page';
