const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    url:String,
    filename: String //filename from cloudinary-use this to easily delete photo
})

imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200') //we use virtual becasue it will not save in our database. just computed after the fact.
    //this refers to the specific image
    //new property is img.thumnail, in addition to img.url and img.filename
})

const opts = { toJSON: { virtuals: true } }; //include virtuals if converting to JSON

const CampgroundSchema = new Schema({
    title: String,
    images: [ imageSchema ],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number], 
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]

}, opts); //need opts to include virtual properties when parsing to JSON. The default is to not include virtuals in the parsed JSON

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>` //we use virtual becasue it will not save in our database. just computed after the fact.
    //this refers to the camp
})

//middleware to delete all reviews if campground is deleted
CampgroundSchema.post('findOneAndDelete', async function (campground) {
    if(campground.reviews.length) {
        await Review.deleteMany({
             _id: { 
                $in:campground.reviews
            }
        }) //deletes all reviews in the array
    }
})

const Campground =  mongoose.model('Campground', CampgroundSchema)
module.exports = Campground;
