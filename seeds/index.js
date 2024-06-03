const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array=> array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i=0;i<200;i++) {
        const random1000 = Math.floor(Math.random()*1000)+1;
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author: '664f994ea04b39bf834b5dcc',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/duwc0vb05/image/upload/v1716930241/YelpCamp/tboonfibmo439rhds84u.jpg',
                  filename: 'YelpCamp/tboonfibmo439rhds84u',
                }
              ],
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos id alias suscipit neque ducimus sapiente hic. Illum doloremque, totam dolorem saepe repellat hic incidunt unde nemo molestiae quod adipisci atque.',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            }
        })
        await camp.save();
    }
    }

seedDB().then(()=>{
    mongoose.connection.close();
})