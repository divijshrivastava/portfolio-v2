# Migrate Blog Images to Supabase Storage

Your blogs are imported but images aren't showing because they reference old server paths like `/images/blog/199.jpg`.

## Images Location

**Server**: Hostinger Ubuntu server
**Server Path**: `/home/divij/divij_tech_volume/images_volume`
**Username**: `divij`
**Format**: Numbered files (e.g., `199.jpg`, `200.jpg`)
**Encryption**: NOT encrypted (standard JPEG/PNG files)

> **Note**: In all commands below, replace `your_server` with your actual Hostinger server IP address or hostname.

## Quick Steps

### Step 1: Download Images from Server

Download all blog images from your Ubuntu server to your local machine:

```bash
# Create local directory for images
mkdir -p ~/blog-images

# Download all images from server
scp -r divij@your_server:/home/divij/divij_tech_volume/images_volume/* ~/blog-images/

# Or if you have the server IP/hostname
# scp -r divij@HOSTINGER_IP:/home/divij/divij_tech_volume/images_volume/* ~/blog-images/
```

Replace `your_server` or `HOSTINGER_IP` with your actual server address.

**Expected output:**
```
199.jpg                100%  1.4MB   500KB/s   00:03
200.jpg                100%  856KB   450KB/s   00:02
201.jpg                100%  1.2MB   520KB/s   00:02
...
```

### Step 2: Create Supabase Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **Create new bucket**
3. Name: `blog-images`
4. ✅ Check **Public bucket**
5. Click **Create bucket**

### Step 3: Upload Images to Supabase

#### Option A: Using Supabase Dashboard (Easiest)

1. Open Finder and go to `~/blog-images/` (or wherever you downloaded the images)
2. In Supabase Dashboard, click on the `blog-images` bucket
3. Drag and drop all images (or use "Upload file" button)
4. Wait for upload to complete

#### Option B: Using Supabase CLI (Batch Upload)

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Navigate to downloaded images directory
cd ~/blog-images

# Upload all images at once
for file in *.{jpg,jpeg,png}; do
  [ -f "$file" ] && supabase storage upload blog-images "$file" --experimental
done
```

#### Option C: Automated Script

Update the `IMAGES_DIR` in `scripts/upload-blog-images.sh` to point to your download location, then:

```bash
# Edit the script to change IMAGES_DIR to ~/blog-images
# Then run:
chmod +x scripts/upload-blog-images.sh
./scripts/upload-blog-images.sh
```

### Step 4: Update Blog URLs in Database

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

### Step 5: Verify Images

Visit your blog posts to verify images are loading:

```
http://localhost:3000/blog
```

Or check individual blog URLs to see the images.

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

### Don't Know Your Server Address?

If you're unsure of your Hostinger server IP or hostname:

1. **Check Hostinger Control Panel**:
   - Log in to Hostinger
   - Go to "Hosting" or "VPS"
   - Your server IP should be displayed

2. **Check SSH Config**:
   ```bash
   cat ~/.ssh/config
   ```
   Look for entries related to your Hostinger server

3. **Try domain name**:
   ```bash
   # If your site is divij.tech, try:
   scp -r divij@divij.tech:/home/divij/divij_tech_volume/images_volume/* ~/blog-images/
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

1. ✅ Download images from Hostinger Ubuntu server (`/home/divij/divij_tech_volume/images_volume`)
2. ✅ Create Supabase Storage bucket (`blog-images`, public)
3. ✅ Upload images to Supabase Storage bucket
4. ✅ Run `node scripts/update-blog-images.js` to update database URLs
5. ✅ Verify on website

Your blog images should now be loading from Supabase Storage!

## Quick Command Summary

```bash
# 1. Download images from server
mkdir -p ~/blog-images
scp -r divij@your_server:/home/divij/divij_tech_volume/images_volume/* ~/blog-images/

# 2. Create bucket in Supabase Dashboard (blog-images, public)

# 3. Upload images via CLI
cd ~/blog-images
supabase login
for file in *.{jpg,jpeg,png}; do
  [ -f "$file" ] && supabase storage upload blog-images "$file" --experimental
done

# 4. Update database
node scripts/update-blog-images.js

# 5. Verify
# Visit http://localhost:3000/blog
```
