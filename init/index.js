const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mongo_url = "mongodb://127.0.0.1:27017/wanderlist";
main()
   .then(res => console.log("Connecting to mongodb"))
   .catch(err => console.log(err));

async function main() {
  await mongoose.connect(mongo_url);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({...obj, owner: "683425b294bcc00ba9063ad8"}));
  await Listing.insertMany(initData.data);
  console.log("DB initialize");
}

initDB();
