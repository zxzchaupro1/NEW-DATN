const mongoose = require("mongoose");
const Scheme = mongoose.Schema;
const bannerappScheme = new Scheme({
  bannerAppName: String,
  bannerAppImage: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  delete: Boolean,
});

const bannerapp = mongoose.model("bannerapp", bannerappScheme);

module.exports = bannerapp;
