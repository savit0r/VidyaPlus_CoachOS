const CLOUDINARY_CLOUD_NAME = 'devc6hymf';
const CLOUDINARY_UPLOAD_PRESET = 'unsigned_upload'; // Most Cloudinary accounts have this or you can create one. 
// However, since we have the API key/secret, we could do signed uploads, but for a simple web app, unsigned is easier if configured.
// But the user gave us API_KEY and API_SECRET, so maybe they want a secure upload or just provided them for reference.
// Let's try to use the most straightforward way.

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default'); // Common default preset

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};
