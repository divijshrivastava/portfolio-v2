-- Add featured column to projects table
-- This allows marking projects to appear in the Featured Projects section on the home page

-- Add featured column (default false)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add featured_description column for concise description shown on home page
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS featured_description TEXT;

-- Add index for faster filtering of featured projects
CREATE INDEX IF NOT EXISTS projects_featured_idx ON projects(featured) WHERE featured = true;

-- Add comments to document the columns
COMMENT ON COLUMN projects.featured IS 'Whether this project should appear in the Featured Projects section on the home page';
COMMENT ON COLUMN projects.featured_description IS 'Brief description (1-2 sentences) shown for featured projects on the home page';
