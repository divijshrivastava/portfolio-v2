-- Add professional project fields to projects table

-- Step 1: Drop existing constraint if it exists (from previous failed runs)
ALTER TABLE projects
DROP CONSTRAINT IF EXISTS projects_project_type_check;

-- Step 2: Add project_type column if not exists
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS project_type TEXT;

-- Step 3: Update existing projects to be 'side' projects (backfill existing data)
UPDATE projects
SET project_type = 'side'
WHERE project_type IS NULL;

-- Step 4: Set default for new rows
ALTER TABLE projects
ALTER COLUMN project_type SET DEFAULT 'side';

-- Step 5: Add check constraint after data is clean
ALTER TABLE projects
ADD CONSTRAINT projects_project_type_check CHECK (project_type IN ('professional', 'side'));

-- Add company name for professional projects
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS company TEXT;

-- Add start date for professional projects
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS start_date DATE;

-- Add end date for professional projects (null if ongoing)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add tech stack array
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS tech_stack TEXT[];

-- Add detailed content for project detail pages (especially for professional projects)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS detailed_content TEXT;

-- Add index on project_type for faster filtering
CREATE INDEX IF NOT EXISTS projects_project_type_idx ON projects(project_type);

-- Add comments to document the columns
COMMENT ON COLUMN projects.project_type IS 'Type of project: professional (work experience) or side (personal)';
COMMENT ON COLUMN projects.company IS 'Company name for professional projects (e.g., Morgan Stanley, TIAA, TCS)';
COMMENT ON COLUMN projects.start_date IS 'Start date for professional projects';
COMMENT ON COLUMN projects.end_date IS 'End date for professional projects (null if currently ongoing)';
COMMENT ON COLUMN projects.tech_stack IS 'Array of technologies used in the project';
COMMENT ON COLUMN projects.detailed_content IS 'Detailed description shown on project detail page. For professional projects, include achievements, challenges, and impact.';
