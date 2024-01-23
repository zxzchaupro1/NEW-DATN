const { response } = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { count } = require("console");
const Razorpay = require("razorpay");

const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const ads = require("../models/adsModel");
const bannerApp = require("../models/bannerAppModel");
const user = require("../models/userModel");
const cart = require("../models/cartModel");
const coupon = require("../models/couponModel");
const order = require("../models/orderModel");
const author = require("../models/authorModel");
const book = require("../models/bookModel");
const genre = require("../models/genreModel");
const banner = require("../models/bannerModel");
const point = require("../models/pointModel");
const UserOTPVerification = require("../models/userOTPVerification");

const loginVarification = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userdb = await user.findOne({ email: email });

    if (userdb) {
      if (userdb.block) {
        bcrypt.compare(password, userdb.password).then((result) => {
          if (result) {
            response._id = userdb._id;
            req.session.user = response._id;
            res
              .status(200)
              .send({ message: "Success", status: 200, data: userdb });
          } else {
            res
              .status(401)
              .send({ message: "Incorrect Password", status: 401 });
          }
        });
      } else {
        res.status(401).send({ message: "This Email Id Blocked", status: 401 });
      }
    } else {
      res.status(401).send({ message: "Incorrect Email", status: 401 });
    }
  } catch (err) {
    console.error(`Error Login Varification : ${err}`);
    //res.redirect('/');
  }
};
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  logger: true,
  debug: true,
  auth: {
    user: process.env.userNodemailer,
    pass: process.env.passNodemailer,
  },
  tls: {
    rejectUnauthorized: true,
  },
});
const userSignupNoOTP = async (req, res) => {
  try {
    const existingUser = await user.findOne({ email: req.body.email });

    if (existingUser) {
      req.session.errormsg = "Email already exists";
      //return res.redirect('/signup');
      res.status(401).send({ message: "Email already exists", status: 401 });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new user({
      username: req.body.userName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      age: req.body.age,
      password: hashedPassword,
      block: true,
    });
    await newUser.save();

    res.status(200).send({
      message: "Success",
      status: 200,
      data: {
        username: req.body.userName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        age: req.body.age,
        password: hashedPassword,
        block: true,
      },
    });
    //res.redirect('/otp')
  } catch (err) {
    console.error(`Error inserting user: ${err}`);
  }
};
const userSignup = async (req, res) => {
  try {
    const existingUser = await user.findOne({ email: req.body.email });

    if (existingUser) {
      req.session.errormsg = "Email already exists";
      //return res.redirect('/signup');
      res.status(401).send({ message: "Email already exists", status: 401 });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const User = {
      username: req.body.userName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      age: req.body.age,
      password: hashedPassword,
      block: true,
    };

    const OTP = Math.floor(1000 + Math.random() * 9000).toString();
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000).toLocaleString(
      undefined,
      options
    );

    await UserOTPVerification.deleteMany({ email: User.email });

    const newOTPVerification = new UserOTPVerification({
      email: User.email,
      otp: OTP,
      expiresAt: expirationTime,
    });

    await newOTPVerification.save();

    const mailOptions = {
      from: `${process.env.userNodemailer}`,
      to: User.email,
      subject: "OTP",
      text: `You otp :${OTP}`,
      html: `
          <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Bookworm</a>
          </div>
          <p style="font-size:1.1em">Hi ${User.username},</p>
          <p>Thank you for choosing Brandworm. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
          <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
          <p style="font-size:0.9em;">Regards,<br />Bookworm</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>Bookworm</p>
          </div>
          </div>
          </div>`,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(`Error sending email: ${error}`);
      }
      console.log(`OTP sent to ${User.email}: ${OTP}`);

      req.session.userInfo = {
        userName: User.username,
        email: User.email,
        phoneNumber: User.phoneNumber,
        age: User.age,
        password: User.password,
        block: User.block,
        expiresAt: expirationTime,
      };
      res.status(200).send({
        message: "Success",
        status: 200,
        data: {
          userName: User.username,
          email: User.email,
          phoneNumber: User.phoneNumber,
          age: User.age,
          password: User.password,
          block: User.block,
          expiresAt: expirationTime,
        },
      });
      //res.redirect('/otp')
    });
  } catch (err) {
    console.error(`Error inserting user: ${err}`);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const userOtp = await UserOTPVerification.findOne({
      email: req.body.email,
    });
    const userInfo = {
      userName: req.body.userName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      age: req.body.age,
      password: req.body.password,
      expiresAt: req.body.expirationTime,
      block: true,
    };
    if (req.body.otp == userOtp.otp) {
      const date = new Date(Date.now());
      if (date < userOtp.expiresAt) {
        const newUser = new user({
          username: req.body.userName,
          email: req.body.email,
          phoneNumber: req.body.phoneNumber,
          age: req.body.age,
          password: req.body.password,
          block: true,
        });

        await newUser.save();
        await UserOTPVerification.deleteOne({ email: req.body.email });

        const userdb = await user.findOne({ email: req.body.email });
        response.username = userdb;
        req.session.user = response.username;
        res.status(200).send({ message: "Success", status: 200 });
        //res.redirect("/");
      } else {
        req.session.errormsg = "OTP Expired";
        warning = req.session.errormsg;
        req.session.errormsg = false;
        //res.render('otp',{title: 'Otp',warning,userInfo});
      }
    } else {
      req.session.errormsg = "Invalid Otp";
      warning = req.session.errormsg;
      req.session.errormsg = false;
      //res.render('otp',{title: 'Otp',warning,userInfo});
    }
  } catch (err) {
    console.error(`Error Add Genre : ${err}`);
    //res.redirect('/');
  }
};

const editUser = async (req, res) => {
  try {
    await user.updateOne(
      { _id: req.params.id },
      {
        $set: {
          username: req.body.userName,
          email: req.body.email,
          phoneNumber: req.body.phoneNumber,
          age: req.body.age,
        },
      }
    );
    res.status(200).send({ message: "Success", status: 200 });
    //res.redirect(`/myProfile/${req.params.id}`);
  } catch (err) {
    console.error(`Error Edit User Info : ${err}`);
    //res.redirect(`/myProfile/${req.params.id}`);
  }
};
const changePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const userdb = await user.findOne({ _id: userId });

    bcrypt.compare(oldPassword, userdb.password).then(async (result) => {
      if (result) {
        bcrypt.compare(newPassword, userdb.password).then(async (equal) => {
          if (equal) {
            return res.status(401).send({
              message: "New Password And Old Password Same",
              status: 401,
            });
          } else {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            console.log("hashedPassword", hashedPassword);
            await user.updateOne(
              { _id: userId },
              {
                $set: {
                  password: hashedPassword,
                },
              }
            );
            req.session.user = false;
            return res.status(200).send({ message: "Success", status: 200 });
          }
        });
      } else {
        return res
          .status(401)
          .send({ message: "Old Password not correct", status: 401 });
      }
    });
  } catch (err) {
    console.error(`Error Edit User Info : ${err}`);
    res.redirect(`/myProfile/${req.params.id}`);
  }
};

const addPoint = async (req, res) => {
  try {
    const userId = req.body.userId;
    const bookId = req.body.bookId;

    const pointdb = await point.findOne({ user: userId, book: bookId });
    const userdb = await user.findOne({ _id: userId });
    if (pointdb) {
      //
      res.status(200).send({ message: "The book was read !", status: 200 });
    } else {
      const newPoint = new point({
        user: userId,
        book: bookId,
        isRead: 1,
      });

      await newPoint.save();
      // update user Point total

      await user.updateOne(
        { _id: userId },
        {
          $set: {
            pointTotal: userdb.pointTotal + 1,
          },
        }
      );
      res.status(200).send({ message: "Success", status: 200 });
    }
  } catch (err) {
    console.error(`Error Edit User Info : ${err}`);
    //res.redirect(`/myProfile/${req.params.id}`);
  }
};
const getInfoUser = async (req, res) => {
  try {
    const userId = req.body.userId;

    const userDetails = await user.findOne({ _id: userId });
    res.status(200).send({ data: userDetails, status: 200 });
  } catch (err) {
    console.error(`Error Edit User Info : ${err}`);
    //res.redirect(`/myProfile/${req.params.id}`);
  }
};

// books
const searchBook = async (req, res) => {
  const name = req.body.name;

  book
    .find({ bookName: new RegExp(name, "i") })
    .then((books) =>
      res.status(200).send({ message: "Success", status: 200, data: books })
    )
    .catch((err) => res.send(err));
};
const bookofGenre = async (req, res) => {
  const genre = req.params.genre;

  book
    .find({ genre })
    .then((books) =>
      res.status(200).send({ message: "Success", status: 200, data: books })
    )
    .catch((err) => res.send(err));
};
const renderBook = async (req, res) => {
  const books = await book
    .find({ delete: { $ne: false } })
    .populate("author")
    .populate("genre");
  req.session.userInfo = false;
  const userId = req.session.user;
  let userDetails = false;
  if (userId) {
    userDetails = await user.findOne({ _id: userId });
  }
  const warning = req.session.errormsg;
  req.session.errormsg = false;
  res.status(200).send({ message: "Success", status: 200, data: books });
  //res.render('book',{ title: "Books",books,userDetails,warning});
};
const bookDetails = async (req, res) => {
  const books = await book
    .findOne({ _id: req.params.id })
    .populate("author")
    .populate("genre");
  const relatedbooks = await book
    .find({ $or: [{ author: books.author }, { genre: books.genre }] })
    .populate("author")
    .populate("genre");
  const userId = req.session.user;
  let userDetails = false;
  if (userId) {
    userDetails = await user.findOne({ _id: userId });
  }
  const warning = req.session.errormsg;
  req.session.errormsg = false;
  res.status(200).send({
    message: "Success",
    status: 200,
    data: books,
    datarelated: relatedbooks,
  });
  //res.render('book-detail',{title: 'Bookdetails',books,relatedbooks,userDetails,warning});
};
//banner
const renderBanner = async (req, res) => {
  const banners = await banner
    .findOne({ banner: true })
    .populate("bigCard1ProductId")
    .populate("bigCard2ProductId");
  res.status(200).send({ message: "Success", status: 200, data: banners });
  //res.render('book',{ title: "Books",books,userDetails,warning});
};

// ads
const renderads = async (req, res) => {
  try {
    const warning = req.session.errormsg;
    req.session.errormsg = false;

    const adss = await ads.find();
    res.status(200).send({
      message: "Success",
      status: 200,
      data: adss && adss.length > 0 ? adss[0] : null,
    });
  } catch (err) {
    console.error(`Error Get ads Management : ${err}`);
  }
};
const adsDetail = async (req, res) => {
  const adsone = await ads.findOne({ _id: req.params.id });

  res.status(200).send({ message: "Success", status: 200, data: adsone });
  //res.render('book-detail',{title: 'Bookdetails',books,relatedbooks,userDetails,warning});
};
const addads = async (req, res) => {
  try {
    const existingads = await ads.findOne({ adsName: req.body.adsName });
    if (existingads) {
      req.session.errormsg = "ads Already Exit";
      return;
    }
    const newads = new ads({
      adsName: req.body.adsName,
      adsImage: req.file.adsImage,
      active: true,
      delete: true,
    });
    await newads.save();
    res.status(200).send({ message: "Success", status: 200, data: newads });
  } catch (err) {
    console.error(`Error Add ads : ${err}`);
    //res.redirect("/admin/adsManagement");
  }
};
const editads = async (req, res) => {
  try {
    await ads.updateOne(
      { _id: req.params.id },
      {
        $set: {
          adsName: req.body.adsName,
          adsImage: req.body.adsFile,
          active: req.body.active,
        },
      }
    );
    res.status(200).send({
      message: "Success",
      status: 200,
      data: {
        adsName: req.body.adsName,
        adsImage: req.body.adsFile,
      },
    });
  } catch (err) {
    console.error(`Error Edit ads : ${err}`);
    // res.redirect("/admin/adsManagement");
  }
};
const changeadsImage = async (req, res) => {
  try {
    await ads.updateOne(
      { _id: req.params.id },
      {
        $set: {
          adsName: req.body.adsName,
          adsImage: req.file.filename,
        },
      }
    );

    const directoryPath = "public/" + req.body.adsFile;
    fs.unlink(directoryPath, (err) => {
      try {
        if (err) {
          throw err;
        }
        console.log("Delete ads Image successfully.");
      } catch (err) {
        console.error(`Error Deleting Book : ${err}`);
      }
    });
    // res.redirect("/admin/adsManagement");
    res.status(200).send({ message: "Success", status: 200, data: null });
  } catch (err) {
    console.error(`Error Change ads Image : ${err}`);
    //res.redirect("/admin/adsManagement");
  }
};

const deleteads = async (req, res) => {
  try {
    await ads.updateOne({ _id: req.params.id }, { $set: { delete: false } });
    //res.redirect("/admin/adsManagement");
    res.status(200).send({ message: "Success", status: 200, data: null });
  } catch (err) {
    console.error(`Error Delete ads : ${err}`);
    //res.redirect("/admin/adsManagement");
  }
};

//banner app mobile
// ads
const renderbannerApp = async (req, res) => {
  try {
    const warning = req.session.errormsg;
    req.session.errormsg = false;
    const bannerApps = await bannerApp.find();
    res.status(200).send({ message: "Success", status: 200, data: bannerApps });
  } catch (err) {
    console.error(`Error Get bannerApp Management : ${err}`);
  }
};
const bannerAppDetail = async (req, res) => {
  const bannerAppone = await bannerApp.findOne({ _id: req.params.id });

  res.status(200).send({ message: "Success", status: 200, data: bannerAppone });
  //res.render('book-detail',{title: 'Bookdetails',books,relatedbooks,userDetails,warning});
};
const addbannerApp = async (req, res) => {
  try {
    const existingbannerApp = await bannerApp.findOne({
      bannerAppName: req.body.bannerAppName,
    });
    if (existingbannerApp) {
      req.session.errormsg = "bannerApp Already Exit";
      return;
    }
    const newbannerApp = new bannerApp({
      bannerAppName: req.body.bannerAppName,
      bannerAppImage: req.file.bannerAppImage,
      active: true,
      delete: true,
    });
    await newbannerApp.save();
    res
      .status(200)
      .send({ message: "Success", status: 200, data: newbannerApp });
  } catch (err) {
    console.error(`Error Add bannerApp : ${err}`);
    //res.redirect("/admin/bannerAppManagement");
  }
};
const editbannerApp = async (req, res) => {
  try {
    await bannerApp.updateOne(
      { _id: req.params.id },
      {
        $set: {
          bannerAppName: req.body.bannerAppName,
          bannerAppImage: req.body.bannerAppFile,
          active: req.body.active,
        },
      }
    );
    res.status(200).send({
      message: "Success",
      status: 200,
      data: {
        bannerAppName: req.body.bannerAppName,
        bannerAppImage: req.body.bannerAppFile,
      },
    });
  } catch (err) {
    console.error(`Error Edit bannerApp : ${err}`);
    // res.redirect("/admin/bannerAppManagement");
  }
};
const changebannerAppImage = async (req, res) => {
  try {
    await bannerApp.updateOne(
      { _id: req.params.id },
      {
        $set: {
          bannerAppName: req.body.bannerAppName,
          bannerAppImage: req.file.filename,
        },
      }
    );

    const directoryPath = "public/" + req.body.bannerAppFile;
    fs.unlink(directoryPath, (err) => {
      try {
        if (err) {
          throw err;
        }
        console.log("Delete bannerApp Image successfully.");
      } catch (err) {
        console.error(`Error Deleting Book : ${err}`);
      }
    });
    // res.redirect("/admin/bannerAppManagement");
    res.status(200).send({ message: "Success", status: 200, data: null });
  } catch (err) {
    console.error(`Error Change bannerApp Image : ${err}`);
    //res.redirect("/admin/bannerAppManagement");
  }
};

const deletebannerApp = async (req, res) => {
  try {
    await bannerApp.updateOne(
      { _id: req.params.id },
      { $set: { delete: false } }
    );
    //res.redirect("/admin/bannerAppManagement");
    res.status(200).send({ message: "Success", status: 200, data: null });
  } catch (err) {
    console.error(`Error Delete bannerApp : ${err}`);
    //res.redirect("/admin/bannerAppManagement");
  }
};

const getGenres = async (req, res) => {
  const genres = await genre.find({});
  const result = [];
  for (let idx = 0; idx < genres.length; idx++) {
    const genre = genres[idx];
    const books = await book.find({
      genre: genre,
    });

    if (books && books.length > 0) {
      result.push({
        genreId: genre._id,
        genreName: genre.genreName,
        books,
      });
    }
  }

  res.status(200).send({ message: "Success", status: 200, data: result });
};

module.exports = {
  loginVarification,
  userSignup,
  verifyOTP,
  editUser,
  searchBook,
  renderBook,
  bookDetails,
  addPoint,
  renderBanner,
  bookofGenre,
  userSignupNoOTP,
  renderads,
  adsDetail,
  addads,
  editads,
  changeadsImage,
  deleteads,
  renderbannerApp,
  addbannerApp,
  editbannerApp,
  deletebannerApp,
  bannerAppDetail,
  changePassword,
  getInfoUser,
  getGenres,
};
