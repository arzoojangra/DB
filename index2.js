const express = require("express");
const connection = require("./config");
const cors = require("cors");
var moment = require("moment");

const api2 = express();

api2.use(cors());
api2.use(express.json());

api2.get("/", (req, res) => {
  connection.query(
    "SELECT ID, Name, Contact, Email, PAN, Aadhar FROM UserList WHERE IsDeleted = 'N'",
    (err, result) => {
      if (err) res.send("error");
      else res.send(result);
    }
  );
}); //read   working

api2.get("/:id", (req, res) => {
  connection.query(
    "SELECT ID, Name, Contact, Email, PAN, Aadhar FROM UserList WHERE ID =" +
      req.params.id,
    (err, result) => {
      if (err) res.send("error");
      else res.send(result);
    }
  );
}); //read particular

api2.post("/", (req, res) => {
  var currTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
  const data = req.body;
  connection.query(
    `INSERT INTO UserList (Name, Contact, Email, PAN, Aadhar, CreatedOn, UpdatedOn) VALUES ('${data.Name}','${data.Contact}', '${data.Email}', '${data.PAN}', '${data.Aadhar}', '${currTime}', '${currTime}')`,
    (err, result) => {
      if (err) {
        return res.status(403).json({ mesage: err.sqlMessage });
      }
      res.send(result);
    }
  );
}); //create

api2.put("/:id", (req, res) => {
  var currTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
  // const data = req.body;

  const data = [
    req.body.Name,
    req.body.Contact,
    req.body.Email,
    req.body.PAN,
    req.body.Aadhar,
    currTime,
  ];
  connection.query(
    "UPDATE UserList SET Name=?, Contact=?, Email=?, PAN=?, Aadhar=?, UpdatedOn=? WHERE ID = " +
      req.params.id,
    data,
    (err, result) => {
      if (err) {
        return res.status(403).json({ mesage: err.sqlMessage });
      }
      res.send(result);
    }
  );
}); //update

api2.delete("/:id", (req, res) => {
  connection.query(
    "UPDATE UserList SET IsDeleted = 'Y' WHERE ID =" + req.params.id,
    (err, result) => {
      if (err) err;
      res.send(result);
    }
  );
}); //delete  working

api2.listen(3002);
