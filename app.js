if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
//when we deploy, we will be running our code in production. If we are in "development", we will require the dotenv package, which takes the variables from .env and adds them to process.env
//in production, this is different:
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); //lets us use templating in our ejs views (sometimes called engine)
const ExpressError = require('./utils/ExpressError');
const session = require('express-session')
const MongoDBStore = require("connect-mongo")(session);
const flash = require('connect-flash')
const Joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const methodOverride = require('method-override');
const passport = require('passport')
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize')

const User = require('./models/user');
const Review = require('./models/review');
const Campground = require('./models/campground'); //require mongoose model

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')
// const dbUrl = process.env.DB_URL
const dbUrl = 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl);

const db = mongoose.connection; //shortcut
db.on('error', console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("database connected");
});

const app = express();
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public'))) //allows us to serve files in the public directory
app.use(mongoSanitize())

const store = new MongoDBStore({
    url: dbUrl,
    secret: 'thisshouldbeabettersecret!',
    touchAfter: 24*60*60
})

store.on('error', function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store: store,
    name: 'session',
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000* 60 *60 *24 *7,
        maxAge: 1000* 60 *60 *24 *7
    }
}
app.use(session(sessionConfig))
app.use(flash());

//PASSPORT INITIALIZATION AND MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //tells passport to use the Local Strategy and that our authentication is located on User model(created for us automatically when using the plugin)
passport.serializeUser(User.serializeUser())  //how to store a user in a session
passport.deserializeUser(User.deserializeUser()) //how to get a user out of a session

app.engine('ejs', ejsMate) //tells express to use ejsMate instead of the default ejs view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname,'views'))

app.use((req,res,next)=> {
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes) //need to pass in MERGE PARAMS to express.router if we want access to :id
app.use('/', userRoutes)

app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next)=>{
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, ()=>{
    console.log("listening on port 3000")
})