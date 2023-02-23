const express = require("express");
const connection = require("./config");
const cors = require("cors");

const api = express();

api.use(cors());
api.use(express.json());

api.get("/", (req, res) => {
  connection.query("select * from user", (err, result) => {
    if (err) res.send("error");
    else res.send(result);
  });
}); //read

api.get("/:id", (req, res) => {
  connection.query(
    "select * from user WHERE ID =" + req.params.id,
    (err, result) => {
      if (err) res.send("error");
      else res.send(result);
    }
  );
}); //read particular

api.post("/", (req, res) => {
  const data = req.body;
  connection.query("Insert INTO user SET ?", data, (err, result) => {
    if (err) err;
    res.send(result);
  });
}); //create

api.put("/:id", (req, res) => {
  const data = [
    req.body.Name,
    req.body.Contact,
    req.body.Email,
    req.body.PAN,
    req.body.Aadhar,
    req.params.id,
  ];
  connection.query(
    "Update user SET Name =?, Contact =?, Email=?, PAN=?, Aadhar=? where ID = ?",
    data,
    (err, result) => {
      if (err) err;
      res.send(result);
    }
  );
}); //update

api.delete("/:id", (req, res) => {
  connection.query(
    "Delete FROM user WHERE ID =" + req.params.id,
    (err, result) => {
      if (err) err;
      res.send(result);
    }
  );
}); //delete

api.listen(3001);
