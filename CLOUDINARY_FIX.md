# Cloudinary 401 Error Fix

## Problem
Getting 401 Unauthorized when accessing PDF URLs from Cloudinary.

## Root Cause
Cloudinary restricts public access to "raw" files (PDFs, documents, etc.) by default for security reasons.

## Solutions

### Solution 1: Enable Public Access for Raw Files (Recommended)

1. **Go to Cloudinary Dashboard**: https://cloudinary.com/console
2. **Navigate to Settings** → **Security**
3. **Find "Delivery and access control"** section
4. **Enable "Resource access control"**
5. **Set resource type "raw" to "public"**

OR

1. Go to **Settings** → **Upload**
2. Under **Upload presets**, create/edit a preset
3. Set **Access mode** to "public"
4. Use this preset in your upload

### Solution 2: Use Signed URLs (More Secure)

Update `pdfGenerator.js` to generate signed URLs:

```javascript
// After upload, generate a signed URL
const signedUrl = cloudinary.url(uploadResult.public_id, {
  resource_type: "raw",
  type: "upload",
  sign_url: true,
  secure: true
});

return {
  success: true,
  url: signedUrl, // Use signed URL instead
  publicId: uploadResult.public_id,
  fileName: `${pdfFileName}.pdf`,
};
```

### Solution 3: Convert to Image Format (Not Recommended for PDFs)

This converts PDF to images, but loses PDF functionality.

### Solution 4: Use Cloudinary's Authenticated Delivery

For more security, use authenticated URLs that expire:

```javascript
const privateUrl = cloudinary.utils.private_download_url(
  uploadResult.public_id,
  "pdf",
  {
    resource_type: "raw",
    expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  }
);
```

---

## Quick Fix Steps

### For Development (Quick Test):

1. Go to Cloudinary Console
2. Settings → Security → Delivery and access control
3. Under "Raw files", select **"Public"** instead of "Authenticated"
4. Save changes
5. Try downloading the PDF again

### For Production (Recommended):

Use **Signed URLs** (Solution 2) for better security while maintaining public access.

---

## Alternative: Use Cloudinary's fl_attachment Flag

Add a download flag to force download:

```javascript
const downloadUrl = cloudinary.url(uploadResult.public_id, {
  resource_type: "raw",
  type: "upload",
  flags: "attachment",
  secure: true
});
```

This ensures the browser downloads the file instead of trying to display it.

---

## Verify Your Settings

After making changes, test with:
```bash
curl -I https://res.cloudinary.com/dhsk06r2s/raw/upload/v1764854366/urbanvac/invoices/INV-NO_3006.pdf
```

Should return `200 OK` instead of `401 Unauthorized`.
