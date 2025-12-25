# Migrate Blog Images to Supabase Storage

Your blogs are imported but images aren't showing because they reference old server paths like `/images/blog/199.jpg`.

## Quick Steps

### Step 1: Find Images on Your Server

SSH into your Ubuntu server:

```bash
ssh divij@your_server
```

Find where images are stored:

```bash
# Common locations
ls -la /var/www/html/images/blog/
ls -la /var/www/*/images/blog/
ls -la ~/public_html/images/blog/

# Or search for them
find / -path "*/images/blog/*.jpg" -o -path "*/images/blog/*.png" 2>/dev/null | head -20
```

### Step 2: Download Images to Local Machine

Once you find the images folder, download them:

```bash
# From your LOCAL machine
scp -r divij@your_server:/path/to/images/blog ./blog-images/

# Example:
# scp -r divij@server:/var/www/html/images/blog ./blog-images/
```

You should now have a `blog-images/` folder with files like:
- `199.jpg`
- `200.jpg`
- etc.

### Step 3: Create Supabase Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **Create new bucket**
3. Name: `blog-images`
4. ✅ Check **Public bucket**
5. Click **Create bucket**

### Step 4: Upload Images to Supabase

#### Option A: Using Supabase Dashboard (Easy)

1. Click on the `blog-images` bucket
2. Click **Upload file**
3. Select all images from `blog-images/` folder
4. Click **Upload**

#### Option B: Using Supabase CLI (Batch upload)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Upload all images
supabase storage upload blog-images blog-images/*
```

### Step 5: Update Blog URLs in Database

Run the update script:

```bash
node scripts/update-blog-images.js
```

**What it does:**
- Finds all blogs with placeholder paths (`/images/blog/X.jpg`)
- Shows you which images will be updated
- Asks for confirmation
- Updates URLs to Supabase Storage URLs

**Expected output:**
```
========================================
  Update Blog Image URLs
========================================

✓ Connected to Supabase

Found 15 blogs with placeholder image paths

Unique image IDs: 199, 200, 201, 202, ...

Update these image URLs? (yes/no): yes

Updating image URLs...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Github, the best way to launch a website!
✓ Another blog post...
...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Updated 15 blogs
```

### Step 6: Verify Images

Visit your blog posts to verify images are loading:

```
http://localhost:3000/blog
```

---

## Troubleshooting

### Images Still Not Showing

**Check Supabase Storage:**
1. Go to Storage → blog-images
2. Verify files are uploaded
3. Click on an image → Copy URL
4. Test if the URL opens in browser

**Check Bucket is Public:**
1. Storage → blog-images → Settings
2. Ensure "Public bucket" is enabled
3. Add policy if needed:
   ```sql
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'blog-images');
   ```

### Image File Names Don't Match

Your blogs reference: `199.jpg`
Your files might be: `image_199.jpg` or `blog-199.png`

**Rename files to match:**
```bash
# In blog-images/ folder
for file in image_*.jpg; do
  mv "$file" "${file#image_}"
done
```

### Some Images Missing

List which images are referenced but missing:

```sql
-- In Supabase SQL Editor
SELECT id, title, cover_image_url, thumbnail_url
FROM blogs
WHERE cover_image_url LIKE '/images/blog/%'
   OR thumbnail_url LIKE '/images/blog/%'
ORDER BY created_at DESC;
```

Download those specific images from your server.

---

## Alternative: Manual SQL Update

If the script doesn't work, update manually in Supabase SQL Editor:

```sql
-- Replace YOUR_PROJECT with your actual Supabase project ID
UPDATE blogs
SET
  cover_image_url = REPLACE(
    cover_image_url,
    '/images/blog/',
    'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/blog-images/'
  ),
  thumbnail_url = REPLACE(
    thumbnail_url,
    '/images/blog/',
    'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/blog-images/'
  )
WHERE
  cover_image_url LIKE '/images/blog/%'
  OR thumbnail_url LIKE '/images/blog/%';
```

---

## Summary

1. ✅ Find images on server
2. ✅ Download to local machine
3. ✅ Create Supabase Storage bucket (`blog-images`, public)
4. ✅ Upload images to bucket
5. ✅ Run `node scripts/update-blog-images.js`
6. ✅ Verify on website

Your blog images should now be loading from Supabase Storage!
