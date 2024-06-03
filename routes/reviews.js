const express = require('express')
const router = express.Router({ mergeParams: true } ) 
const { reviewSchema } = require('../schemas.js');
const { validateReview, isLoggedIn, isAuthor, isReviewAuthor} =require('../middleware')
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const Campground = require('../models/campground');
const reviews = require('../controllers/reviews')

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;