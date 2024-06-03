const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");
const maptilerClient = require("@maptiler/client");

maptilerClient.config.apiKey = 'tkXg3MgpiSpbmozpsMXW';

module.exports.index = async (req , res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req,res)=>{
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res)=> {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    
    const campground = new Campground(req.body.campground);
    console.log("new campground", campground)
    const result = await maptilerClient.geocoding.forward(campground.location, { limit : 1 });
    campground.geometry = result.features[0].geometry; //adding geoJSON directly into our model
    console.log("after geometry added", campground)
    campground.images = req.files.map(f => ({url:f.path, filename: f.filename})) //map over the req.files object and put the filename in path in the campgrounds.images
    campground.author = req.user._id;
    await campground.save()
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res)=> {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
            populate: {path: 'author'} //this populates the author of the review --nested populate   
    }).populate('author'); //this populates the author of the campground
        if(!campground){
            req.flash('error', 'Cannot find that campground');
            return res.redirect('/campgrounds');
        }
    
    res.render('campgrounds/show', {campground})
}


module.exports.renderEditForm = async (req, res)=> {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res)=>{
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {new: true, runValidators: true})
    const imgs = req.files.map(f => ({url:f.path, filename: f.filename}))
    campground.images.push(...imgs)
    console.log(`before deleting one image: ${campground.images}`)
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in:req.body.deleteImages}}}})
    }
    await campground.save()
    console.log(`After deleting one image: ${campground.images}`)
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req,res)=> {
    const {id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds')
}