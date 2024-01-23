const mongoose = require("mongoose");
const Scheme = mongoose.Schema;
const adsScheme = new Scheme({
  adsName: String,
  adsImage: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  delete: Boolean,
});

const ads = mongoose.model("ads", adsScheme);

module.exports = ads;
