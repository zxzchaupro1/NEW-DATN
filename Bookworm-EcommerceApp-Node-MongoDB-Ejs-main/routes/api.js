const { response } = require("express");
const express = require("express");
const apiController = require("../controllers/apiController");
const midleware = require("../midlewares/middleware");
const upload = require("../midlewares/multer");
const router = express.Router();

// api login
router.post("/login", apiController.loginVarification);

// api sign up
router.post("/signup", apiController.userSignup);
// api sign up no otp
router.post("/signupNoOtp", apiController.userSignupNoOTP);
// api edituser
router.post("/editUser/:id", apiController.editUser);

// api verifyOTP
router.post("/verifyotp", apiController.verifyOTP);

// api books
router.post("/search", apiController.searchBook);
router.get("/getbooks/genre/:genre", apiController.bookofGenre);
router.get("/getbooks", apiController.renderBook);
router.get("/getbookdetails/:id", apiController.bookDetails);

// api banner
router.get("/getbanners", apiController.renderBanner);
// api user point
router.post("/addpoint", apiController.addPoint);

// api user point
router.post("/addpoint", apiController.addPoint);
router.post("/profile-user", apiController.getInfoUser);
router.get("/get-genres", apiController.getGenres);

// api ads
router.get("/get-new-ads", apiController.renderads);
router.get("/getadsdetails/:id", apiController.adsDetail);
router.post("/addads", apiController.addads);
router.post("/editdads/:id", apiController.editads);
router.get("/deleteads/:id", apiController.deleteads);
// api banner app mobile
router.get("/getbannerapp", apiController.renderbannerApp);
router.get("/getbannerappdetails/:id", apiController.bannerAppDetail);
router.post("/addbannerapp", apiController.addbannerApp);
router.post("/editdbannerapp/:id", apiController.editbannerApp);
router.get("/deletebannerapp/:id", apiController.deletebannerApp);
module.exports = router;
