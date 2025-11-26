# Cloudinary Setup Guide

This guide explains how to set up Cloudinary for image and video storage in the Vriksh Valley application.

## Overview

Cloudinary is used for:

- Product images
- Category images
- User profile photos
- Video content
- Any other media assets

## Setup Steps

### 1. Create Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address
4. Log in to your Cloudinary console

### 2. Get API Credentials

1. Navigate to the [Cloudinary Console Dashboard](https://cloudinary.com/console)
2. Find your credentials:
   - **Cloud Name**: Located at the top of the dashboard
   - **API Key**: Located in the Account Details section
   - **API Secret**: Click "Show" to reveal it

### 3. Create Upload Preset

Upload presets define how images are processed during upload.

1. Go to **Settings** → **Upload** → **Upload presets**
2. Click **Add upload preset**
3. Configure the preset:
   - **Preset name**: `vriksh-valley-uploads` (or your choice)
   - **Signing Mode**: **Unsigned** (for client-side uploads)
   - **Folder**: Optional, e.g., `vriksh-valley/`
   - **Allowed formats**: jpg, png, webp, gif, mp4
   - **Transformation**: Add any default transformations (optional)
4. Save the preset

### 4. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=vriksh-valley-uploads
```

**Replace with your actual values:**

- `your_cloud_name` - From dashboard
- `your_api_key` - From Account Details
- `your_api_secret` - From Account Details (keep this secure!)
- `vriksh-valley-uploads` - The preset name you created

### 5. Security Best Practices

#### For Client-Side Uploads (Unsigned)

- Use unsigned presets for client-side uploads
- Limit allowed formats in the preset
- Enable moderation if needed
- Set upload limits (size, dimensions)

#### For Server-Side Uploads (Signed)

- Use signed uploads for sensitive operations
- Keep `CLOUDINARY_API_SECRET` private (server-side only)
- Never expose API Secret in client-side code

### 6. Usage Example

#### Basic Image Upload (Client-Side)

```javascript
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  return data.secure_url; // The uploaded image URL
};
```

#### Using Cloudinary Widget (Recommended)

```javascript
import { useEffect } from "react";

const UploadWidget = ({ onUpload }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openWidget = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        sources: ["local", "camera", "url"],
        multiple: false,
        maxFileSize: 5000000, // 5MB
        clientAllowedFormats: ["jpg", "png", "webp"],
      },
      (error, result) => {
        if (!error && result?.event === "success") {
          onUpload(result.info.secure_url);
        }
      }
    );
  };

  return <button onClick={openWidget}>Upload Image</button>;
};
```

#### Image Transformations

Cloudinary provides powerful image transformation capabilities:

```javascript
// Original URL:
// https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/sample.jpg

// Resize to 400x300
// https://res.cloudinary.com/your-cloud-name/image/upload/w_400,h_300,c_fill/v1234567890/sample.jpg

// Optimize quality and format
// https://res.cloudinary.com/your-cloud-name/image/upload/q_auto,f_auto/v1234567890/sample.jpg

// Rounded corners
// https://res.cloudinary.com/your-cloud-name/image/upload/r_20/v1234567890/sample.jpg
```

## Integration in Vriksh Valley

### Admin Product Upload

For the admin panel, integrate Cloudinary upload widget:

1. When adding/editing products, use the upload widget
2. Store the returned URL in Firestore
3. Display images using Next.js Image component with Cloudinary URLs

### User Profile Photos

1. Allow users to upload profile photos
2. Use transformation to create thumbnails
3. Store URL in user profile document

### Optimizations

1. Use `f_auto` for automatic format selection (WebP when supported)
2. Use `q_auto` for automatic quality optimization
3. Lazy load images with Next.js Image component
4. Use responsive breakpoints for different screen sizes

## Troubleshooting

### Upload Fails with "Unsigned uploads are not allowed"

- Ensure your upload preset has **Signing Mode** set to **Unsigned**
- Check that you're using the correct preset name

### CORS Errors

- Cloudinary allows CORS by default
- If issues persist, check allowed origins in Cloudinary settings

### Large File Uploads Failing

- Check preset's file size limits
- Increase `maxFileSize` in widget configuration
- Consider using chunked uploads for large files

### Images Not Displaying

- Verify the URL is correct and accessible
- Check that the image wasn't deleted from Cloudinary
- Ensure proper Next.js Image configuration

## Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload Widget Guide](https://cloudinary.com/documentation/upload_widget)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Next.js Integration](https://cloudinary.com/documentation/react_integration)
- [Video Upload Guide](https://cloudinary.com/documentation/video_upload_api_reference)

## Next Steps

1. Set up folders/prefixes for organizing uploads
2. Configure upload validation rules
3. Set up webhooks for upload notifications (optional)
4. Enable AI features (auto-tagging, moderation)
5. Configure backup and archive policies
