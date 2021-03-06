var express = require("express");
var router = express.Router();
const Request = require("../models/Request.model");
const { verifyRequest } = require("../helpers/verifyRequest");
const { verifyUser } = require("../helpers/verifyUser");

//get all requests
router.get("/", async (req, res) => {
  const io = req.app.locals.io;
  try{
    const requests = await Request.find();
    res.json(requests);
  } catch (e) {
      console.error(e);
    return res.status(500).send();
  }
});

//get single request
router.get("/request", async (req, res) => {
  try{
    const request = await Request.findOne({ _id: req.query.id });
    res.json(request);
  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }
});

//search requests according to user query
router.post("/searchRequest", async (req, res) => {
  const query = req.body.query;
  // return results where name OR content contains the search query
  try{
    const result = await Request.find({
      $or: [
        { name: { $regex: req.body.query, $options: 'i' } },
        { content: { $regex: req.body.query, $options: 'i' } },
        { [req.body.query]: { $gt: 0 } },
      ],
    });
    res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }
});

//delete request when it's accepted. Request data is turned into favour on favour route
router.post("/acceptRequest", async (req, res) => {
  const id = req.body._id;
  try{
    const request = await Request.deleteOne({ _id: id })
      .then(
        global.io.emit("deleteRequest", id)
      );
    return res.status(200).send();
  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }
});

//get all requests made by the user
router.post("/myRequests", async (req, res) => {
  const ownerID = req.body.userID;
  const token = req.body.token;
  try{
    const verifiedUser = verifyUser(token);
    if(verifiedUser.status == "200"){
      const requests = await Request.find({ ownerID: verifiedUser.user._id });
      res.json(requests);
    }
    else{
      res.status(verifiedUser.status).send();
    }
  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }

});

//delete request made by the user
router.post("/delete", async (req, res) => {
  const { requestID, authToken } = req.body;
  const verifiedUser = verifyUser(authToken);
  const usersRequest = await Request.findOne({ _id: requestID });
  if (verifiedUser.user._id == usersRequest.ownerID) {
    await Request.deleteOne({ _id: requestID })
      .then(
        global.io.emit("deleteRequest", requestID));
  }
  return res.status(200).send();
});

//make new request
router.post("/new", async (req, res) => {
  const { request, authToken } = req.body;

  let verifiedUser = verifyUser(authToken);
  if (verifiedUser.status != "200") {
    return res.status(verifiedUser.status).send(verifiedUser.status);
  }
  const newRequest = new Request({
    ownerID: request.ownerID,
    ownerName: request.ownerName,
    name: request.name,
    content: request.content,
    completed: request.completed,
    chocolates: request.chocolates,
    mints: request.mints,
    pizzas: request.pizzas,
    coffees: request.coffees,
    candies: request.candies,
  });
  try {
    const { error } = verifyRequest(newRequest);
    if (error) {
      console.log("Does not meet schema");
      return res.status(400).send(error.details[0].message);
    }
  } catch (err) {
    console.error(err.message);
  }
  const savedRequest = newRequest.save();
  global.io.emit("addRequest", newRequest);
  return res.status(200).send(savedRequest);
});

module.exports = router;
