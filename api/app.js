var createError = require("http-errors");
var express = require("express");
var app = express();
var path = require("path");
var http_module = require("http");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
var cors = require("cors");
const jwt = require("jsonwebtoken");
const { Base64 } = require("js-base64");
var io = require('./io');
var userSocketIDMap = new Map(); //Map of active user tokens/clients
const { verifyUser } = require("./helpers/verifyUser");

require("dotenv").config();

io.on('connection', function (socket) {
  let token = socket.handshake.query.token;
  let userID;
  if (token) {
    let verifiedUser = verifyUser(token);
    if(verifiedUser.status == "200"){
      userID = verifiedUser.user._id;
      addClientToMap(userID, socket.id);
    }
  } 
  

  socket.once('disconnect', () => {
    removeClientFromMap(userID, socket.id);
  })

});

/**
 * Parts of addClientToMap and removeClientFromMap functions courtesy of:
 * https://medium.com/@albanero/socket-io-track-online-users-d8ed1df2cb88
 */
function addClientToMap(userID, socketID) {
  //If first active client of this user
  if (!userSocketIDMap.has(userID)) {
    userSocketIDMap.set(userID, new Set([socketID]));
  }
  //Else if another client of user
  else {
    userSocketIDMap.get(userID).add(socketID);
  }
}

function removeClientFromMap(userID, socketID) {
  if (userSocketIDMap.has(userID)) {
    let userSocketIDSet = userSocketIDMap.get(userID);
    userSocketIDMap.get(userID).delete(socketID);
    //If we have no clients left, delete the userID
    if (userSocketIDMap.get(userID).size == 0) {
      userSocketIDMap.delete(userID);
    }
  }
}

global.userSocketIDMap = userSocketIDMap;
global.io = io;

const UserRoute = require("./routes/user.route");
const VerifyRoute = require("./routes/verify.route");
const ListRoute = require("./routes/Lists.route");
const RequestRoute = require("./routes/request.route");
/*const NewRequestRoute = require("./routes/newrequest.route");*/
const FavourRoute = require("./routes/favour.route");

require("./database/initDB")();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(logger("dev"));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

app.use("/user", UserRoute);
app.use("/verify", VerifyRoute);
app.use("/request", RequestRoute);
app.use("/favour", FavourRoute);
app.use("/lists", ListRoute);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});


module.exports = app;
