# Migrate Blogs from Ubuntu Server MySQL to Supabase

Simple shell script approach - no Node.js required on the server!

## Quick Start (3 Steps)

### Step 1: Upload Script to Ubuntu Server

From your **local machine**:

```bash
scp scripts/export-blogs-mysql.sh your_username@your_server_ip:~/
```

Or use FileZilla/SFTP to upload `export-blogs-mysql.sh`

### Step 2: Run Script on Server

SSH into your server:

```bash
ssh your_username@your_server_ip
```

Make it executable and run:

```bash
chmod +x export-blogs-mysql.sh
./export-blogs-mysql.sh
```

The script will ask for:
- MySQL Username (default: root)
- MySQL Password
- Database Name

**Expected output:**
```
==========================================
  MySQL Blog Export to JSON
==========================================

MySQL Username [root]: root
MySQL Password:
MySQL Database Name: portfolio_db

Testing MySQL connection... ✓ Connected
Exporting blogs to JSON... ✓ Done

==========================================
✓ Export completed successfully!
==========================================

Exported: 15 blogs
File: ./blog-export/blogs.json
Size: 245K

Preview (first blog):
---
My Latest Blog Post | published | 2024-01-15
---
```

### Step 3: Download JSON and Import

**Download to local machine:**

```bash
# On your local machine
scp your_username@your_server_ip:~/blog-export/blogs.json ./exports/
```

**Import to Supabase:**

```bash
# On your local machine
node scripts/import-blogs-only.js
```

Done! ✅

---

## Alternative: Run with Command Line Arguments

Skip the prompts by providing credentials directly:

```bash
./export-blogs-mysql.sh root your_password your_database
```

---

## What Does the Script Do?

1. ✅ Tests MySQL connection
2. ✅ Exports all blogs to JSON format
3. ✅ Shows preview of first blog
4. ✅ Displays file size and location
5. ✅ Provides next steps

---

## Troubleshooting

### "mysql: command not found"

MySQL client is not installed. Install it:

```bash
sudo apt-get update
sudo apt-get install mysql-client
```

### "Access denied for user"

Wrong username or password. Common MySQL users:
- `root` (most common)
- `mysql`
- Check with: `sudo cat /etc/mysql/debian.cnf`

### "Unknown database"

Wrong database name. List all databases:

```bash
mysql -u root -p -e "SHOW DATABASES;"
```

### Can't find the exported file

The file is in `~/blog-export/blogs.json` on the server.

List files:
```bash
ls -lh blog-export/
```

---

## File Structure

After running the script on the server:

```
~/
├── export-blogs-mysql.sh     # The script you uploaded
└── blog-export/
    └── blogs.json             # Your exported blogs (download this!)
```

---

## Complete Example Session

```bash
# 1. On local machine - upload script
$ scp scripts/export-blogs-mysql.sh user@123.45.67.89:~/
export-blogs-mysql.sh    100%  2048    2.0KB/s   00:01

# 2. SSH into server
$ ssh user@123.45.67.89

# 3. On server - run script
$ chmod +x export-blogs-mysql.sh
$ ./export-blogs-mysql.sh
MySQL Username [root]: root
MySQL Password: ****
MySQL Database Name: portfolio

Testing MySQL connection... ✓ Connected
Exporting blogs to JSON... ✓ Done

✓ Export completed successfully!
Exported: 15 blogs
File: ./blog-export/blogs.json

# 4. Exit server
$ exit

# 5. Back on local machine - download
$ scp user@123.45.67.89:~/blog-export/blogs.json ./exports/
blogs.json    100%  245KB   245.0KB/s   00:01

# 6. Import to Supabase
$ node scripts/import-blogs-only.js
✓ Connected to Supabase
✓ Found 15 blogs to import
[1/15] ✓ My First Blog Post
...
✓ Import completed!
```

---

## Advantages of Shell Script

✅ **No Node.js required** on server
✅ **Native MySQL export** - fast and reliable
✅ **Small file size** - just copy one script
✅ **Simple to use** - just run and enter credentials
✅ **Works on any Ubuntu/Debian server**

---

## Security Tips

- ⚠️ Don't commit the exported JSON with your data
- ⚠️ Delete the script from server after use: `rm export-blogs-mysql.sh`
- ⚠️ The JSON file contains all your blog content - keep it safe

---

Need help? The script shows helpful error messages if something goes wrong!
