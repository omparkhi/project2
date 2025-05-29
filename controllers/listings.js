const Listing = require("../models/listing.js");
const fetch = require("node-fetch");

// Index Route Controller
module.exports.index =  async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", {allListing});
};

//New Route Controller
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs")
};

//Show Route Controller
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    let coordinates = { lat: 0, lng: 0 };
    let city = "";
    let state = "";
    let country = "";
    let detailedLocation = "";

    try {
        const geoRes = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
                listing.location
            )}&key=${process.env.OPENCAGE_API_KEY}`
        );
        const geoData = await geoRes.json();

        if (geoData.results && geoData.results.length > 0) {
            const result = geoData.results[0];
            coordinates = result.geometry || coordinates;
            const components = result.components || {};
            city = components.city || "";
            state = components.state || "";
            country = components.country || "";
            detailedLocation = [city, state, country].filter(Boolean).join(", ");
        }
    } catch (err) {
        console.error("Error fetching geolocation:", err);
    }

    // console.log("Detailed Location:", detailedLocation, city, country);

    res.render("listings/show.ejs", {
        listing,
        currUser: req.user,
        coordinates,
        detailedLocation,
        city,
        country
    });
};



// Create Route Controller
module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(url, "..", filename);
    const newListing = new Listing(req.body.listing);
    // console.log(newListing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

//Edit Route Controller
module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300/w_250");
    // console.log(originalImageUrl);
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

// Update Route Controller
module.exports.updateListing = async (req, res) =>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// Delete Route Controller
module.exports.destroyListing = async (req, res) => {
   let {id} = req.params;
   await Listing.findByIdAndDelete(id);
   req.flash("success", "Listing Deleted!");
   res.redirect("/listings");
};