const cloudinary = require('cloudinary').v2; //v2 from docs
const { CloudinaryStorage } = require('multer-storage-cloudinary')

//Config Cloudinary:
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'YelpCamp',
        allowedFormats:['jpg', 'jpeg', 'png']
    }
});

module.exports = {
    cloudinary,
    storage
}