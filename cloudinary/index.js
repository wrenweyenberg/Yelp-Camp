const cloudinary = require('cloudinary').v2; //v2 from docs
const { CloudinaryStorage } = require('multer-storage-cloudinary')

//Config Cloudinary:
//associating our cloudinary account with this cloudinary instance
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});


//instantiate an instance of cloudinaryStorage, and pass in the object we just made with our account info
// also can pass in a folder name in cloudianry, and allowed formats
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