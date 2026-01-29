const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

/**
 * Uploads a file buffer to Supabase Storage
 * @param {Object} file - Multer file object
 * @param {String} folder - Folder inside the bucket
 * @returns {Promise<String>} - Public URL of the uploaded file
 */
const uploadToSupabase = async (file, folder = 'uploads') => {
    if (!file) return null;

    const fileName = `${folder}/${uuidv4()}${path.extname(file.originalname)}`;

    const { data, error } = await supabase.storage
        .from('images') // The bucket name we asked the user to create
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true
        });

    if (error) {
        console.error('Supabase Upload Error:', error);
        throw new Error('Failed to upload image to Supabase');
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

    return publicUrl;
};

module.exports = { uploadToSupabase };
