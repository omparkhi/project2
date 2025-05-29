const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

//Reviews
//Post Review Route Controller
module.exports.createReview = async (req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    // console.log(newReview);
    listing.reviews.push(newReview);
    await listing.save();
    await newReview.save();
    req.flash("success", "New Review Created!");
    // console.log("review save");
    res.redirect(`/listings/${req.params.id}`);
};

//Post Delete Route Controller
module.exports.destroyReview = async(req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};