/*
 * APUS
 * Author: Pedro Tavares - D12123176
 */

const express = require("express");
const jwt = require("jsonwebtoken");
var app = express();
const fs = require("fs");
var bodyParser = require("body-parser");

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname + "/includes"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/views/default.html");
});

//User must be logged in order to access this part
app.get("/dashboard", verifyToken, (req, res) => {
  jwt.verify(req.token, "mysecretkey", (err, authData) => {
    if (err) {
      res.sendFile(__dirname + "/views/default.html");
      //res.status(403);
    } else {
      res.sendFile(__dirname + "/views/dashboard.html");
    }
  });
});

app.post("/login", function(req, res) {
  //Mock  user
  const user = {
    id: 1,
    username: "admin",
    password: "admin123"
  };
  if (
    user.username == req.body.username &&
    req.body.password == user.password
  ) {
    jwt.sign({ user }, "mysecretkey", { expiresIn: "600s" }, (err, token) => {
      res.cookie("authorization", token);
      res.header("authorization", "bearer " + token);
      res.send("done");
      res.sendFile(__dirname + "/views/dashboard.html");
    });
  } else {
    res.send("error");
  }
});

// Handle 404
app.get("*", function(req, res) {
  res.status(404).sendFile(__dirname + "/views/Error404.html", {
    title: "Sorry, page not found"
  });
});

//Function to verify the token
function verifyToken(req, res, next) {
  //get Auth header
  const bearerHeader = req.headers["cookie"];
  //check is bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    //split at space
    const bearer = bearerHeader.split("=");
    //Get token from array
    const bearerToken = bearer[1];
    //set token
    req.token = bearerToken;
    //Next Middleware
    next();
  } else {
    res.sendFile(__dirname + "/views/default.html");
  }
}

//Server
var port = process.env.PORT || 3000;

var server = app.listen(port, function() {
  var host = "localhost";
  console.log("APUS is listening at http://%s:%s", host, port);
});
