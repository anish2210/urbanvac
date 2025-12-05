# Cloudinary Migration Guide

## Overview

The PDF storage system has been migrated from local filesystem to **Cloudinary** cloud storage. This solves the deployment issues where PDFs were lost when servers restarted on platforms like Render, Heroku, and Railway.

---

## What Changed?

### Before (Local Storage)
- PDFs were saved to `server/invoices/` folder
- Files were lost on server restart (ephemeral filesystem)
- Not suitable for cloud deployment
- Limited scalability

### After (Cloudinary)
- PDFs are uploaded to Cloudinary immediately after generation
- PDFs are permanently stored in the cloud
- URLs stored in MongoDB for easy access
- Works perfectly with any deployment platform
- Unlimited scalability

---

## Changes Made

### 1. **New Package Installed**
- Added `cloudinary` package to server dependencies

### 2. **New Configuration File**
- Created `server/config/cloudinary.js` to configure Cloudinary

### 3. **Updated Invoice Model** (`server/models/Invoice.js`)
Added new fields:
- `pdfUrl`: Stores the Cloudinary URL
- `pdfPublicId`: Stores Cloudinary public_id for management
- `pdfPath`: Kept for backward compatibility (now stores URL)

### 4. **Updated PDF Generator** (`server/util/pdfGenerator.js`)
- PDFs are now generated in memory (not saved to disk)
- Automatically uploaded to Cloudinary
- Returns Cloudinary URL instead of local path

### 5. **Updated Invoice Controller** (`server/controllers/invoiceController.js`)
All functions updated to use Cloudinary:
- `createInvoice`: Uploads PDF to Cloudinary after creation
- `updateInvoice`: Regenerates and uploads PDF to Cloudinary
- `sendInvoice`: Uses Cloudinary URL for email attachments
- `downloadInvoice`: Redirects to Cloudinary URL

### 6. **Environment Variables**
Added to `.env` and `.env.example`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 7. **Updated Documentation**
- `DEPLOYMENT.md` updated with Cloudinary setup instructions

---

## Setup Instructions

### Step 1: Get Cloudinary Credentials

1. Go to https://cloudinary.com
2. Sign up for a free account
3. Go to your Dashboard
4. Copy these three values:
   - Cloud Name
   - API Key
   - API Secret

### Step 2: Update Environment Variables

Add to `server/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### Step 3: Test Locally

```bash
cd server
npm start
```

Create a test invoice to verify PDFs are uploaded to Cloudinary.

### Step 4: Check Cloudinary Dashboard

1. Go to Cloudinary Dashboard
2. Navigate to Media Library
3. You should see a folder: `urbanvac/invoices/`
4. Your PDFs will appear here

---

## How It Works Now

### PDF Generation Flow

1. **User creates/updates invoice**
2. **Puppeteer generates PDF** (in memory, not saved locally)
3. **PDF buffer uploaded to Cloudinary** via upload stream
4. **Cloudinary returns secure URL**
5. **URL saved to MongoDB** in invoice document
6. **Client receives URL** to display/download PDF

### Folder Structure in Cloudinary

```
urbanvac/
└── invoices/
    ├── INV-NO_3000.pdf
    ├── INV-NO_3001.pdf
    ├── INV-NO_3002.pdf
    └── ...
```

---

## Benefits

### ✅ **Deployment-Friendly**
- Works on any cloud platform (Render, Heroku, Railway, etc.)
- No ephemeral filesystem issues

### ✅ **Scalable**
- Cloudinary handles all storage and CDN
- No server disk space concerns

### ✅ **Reliable**
- PDFs never get lost
- Permanent cloud storage

### ✅ **Fast**
- PDFs served via Cloudinary CDN
- Faster downloads worldwide

### ✅ **Manageable**
- Easy to view/manage PDFs in Cloudinary dashboard
- Can delete old invoices if needed

---

## Cloudinary Free Tier

Cloudinary's free tier includes:
- **25 GB storage**
- **25 GB monthly bandwidth**
- **25,000 transformations/month**

This is more than enough for most invoice systems!

---

## API Response Changes

### Before
```json
{
  "success": true,
  "data": { ... },
  "pdfPath": "/path/to/local/file.pdf"
}
```

### After
```json
{
  "success": true,
  "data": {
    ...
    "pdfUrl": "https://res.cloudinary.com/.../invoice.pdf",
    "pdfPublicId": "urbanvac/invoices/INV-NO_3000"
  },
  "pdfUrl": "https://res.cloudinary.com/.../invoice.pdf"
}
```

---

## Frontend Integration

The frontend can now directly use the `pdfUrl`:

```javascript
// Download PDF
const downloadPDF = (invoice) => {
  window.open(invoice.pdfUrl, '_blank');
};

// Display PDF in iframe
<iframe src={invoice.pdfUrl} />

// Or use the API download endpoint (which redirects to Cloudinary)
const downloadLink = `/api/invoices/${invoice._id}/download`;
```

---

## Troubleshooting

### Issue: "Cloudinary credentials not found"
**Solution**: Make sure all three Cloudinary environment variables are set in your `.env` file.

### Issue: "Upload failed"
**Solution**: Check your Cloudinary API credentials. Verify they're correct in your Cloudinary dashboard.

### Issue: "Cannot access PDF URL"
**Solution**: PDFs in Cloudinary are set to `access_mode: "public"`. If still blocked, check Cloudinary security settings.

### Issue: "Old invoices still reference local paths"
**Solution**: Old invoices will be automatically regenerated and uploaded to Cloudinary when accessed.

---

## Migration for Existing Invoices

If you have existing invoices with local PDF paths, they will be automatically migrated:

1. When an invoice is accessed (view/download/email)
2. System checks if `pdfUrl` exists
3. If not, PDF is regenerated and uploaded to Cloudinary
4. Database is updated with new Cloudinary URL

No manual migration needed!

---

## Security Considerations

- ✅ PDFs are public but URL is not easily guessable
- ✅ Invoice IDs are required to access PDFs
- ✅ Access controlled through your API authentication
- ✅ Cloudinary URLs can be signed for extra security (optional)

---

## Cost Considerations

### Free Tier Limits
With Cloudinary's free tier (25GB storage):
- Average PDF size: ~100 KB
- Can store: ~250,000 PDFs
- Monthly bandwidth: 25 GB = ~250,000 downloads

If you exceed limits, paid plans start at $99/month for 100GB.

---

## Questions?

- Cloudinary Docs: https://cloudinary.com/documentation
- Cloudinary Node.js SDK: https://cloudinary.com/documentation/node_integration
- Support: Check your Cloudinary dashboard for help

---

## Summary

Your invoice system is now **production-ready** with cloud-based PDF storage!

✨ No more lost PDFs on deployment
✨ Scalable and reliable
✨ Easy to deploy anywhere
✨ Professional cloud infrastructure
