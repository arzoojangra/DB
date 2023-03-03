const express = require("express");
const connection = require("./config");
const cors = require("cors");
var moment = require("moment");
const { body, validationResult } = require("express-validator");

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
    "SELECT ID, Name, Contact, Email, PAN, Aadhar, Image FROM UserList WHERE ID =" +
      req.params.id,
    (err, result) => {
      if (err) res.send("error");
      else res.send(result);
    }
  );
}); //read particular

api2.post(
  "/",
  [
    body("Name").isString().isLength({ min: 3 }),
    body("Contact").isNumeric().isLength({ min: 10, max: 10 }),
    body("Email").isEmail(),
    body("PAN").isAlphanumeric().isLength({ min: 10, max: 10 }),
    body("Aadhar").isNumeric().isLength({ min: 12, max: 12 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    var currTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    const data = [
      req.body.Name,
      req.body.Contact,
      req.body.Email,
      req.body.PAN,
      req.body.Aadhar,
      currTime,
      currTime,
    ];
    console.log(data);
    connection.query(
      `Select * from UserList where Email= '${req.body.Email}'`,
      (error, result) => {
        if (error) {
          console.log(error);
        }
        if (result.length > 0) {
          res.send("Duplicate Entry");
        } else {
          connection.query(
            "Insert into UserList set ?",
            [data],
            (err, result) => {
              if (err) {
                console.log(err.message);
                console.log(err);
              }
              res.send(result);
            }
          );
        }
      }
    );
  }
); //create

api2.put("/:id", (req, res) => {
  var currTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
  // const data = req.body;

  const data = [
    req.body.Name,
    req.body.Contact,
    req.body.PAN,
    req.body.Aadhar,
    currTime,
  ];
  connection.query(
    "UPDATE UserList SET Name=?, Contact=?, PAN=?, Aadhar=?, UpdatedOn=? WHERE ID = " +
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
  var currTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");

  connection.query(
    "UPDATE UserList SET IsDeleted = 'Y', UpdatedOn =? WHERE ID =" +
      req.params.id,
    currTime,
    (err, result) => {
      if (err) err;
      res.send(result);
    }
  );
}); //delete

api2.put("/image/:id", (req, res) => {
  const img = req.body.Image;

  connection.query(
    "UPDATE UserList SET Image=? WHERE ID = " + req.params.id,
    img,
    (err, result) => {
      if (err) {
        return res.status(403).json({ mesage: err.sqlMessage });
      }
      res.send(result);
    }
  );
}); //update

// api2.post("/", (req, resp) => {
//   // req.body.Created_File_Time = moment().unix();
//   const data = req.body;
//   // const data = req.body.Email;
//   var flag = false;
//   console.log(data);
//   // console.log(moment().format("MMMM Do YYYY, h:mm:ss a"));
//   // const response = validateUser(data);
//   // if (response.error) {
//   //   console.log(response.error.details);
//   // } else {
//   connection.query(
//     `Select * from UserList where Email= '${data.Email}'`,
//     (error, result) => {
//       if (error) {
//         console.log(error);
//       }
//       // console.log(result);
//       // return;
//       if (result.length > 0) {
//         flag = true;
//       }
//       if (!flag) {
//         con.query("Insert into UserList set ?", [data], (err, result) => {
//           if (err) {
//             console.log(err.message);
//             // resp.send("error");
//             console.log(err);
//           }
//           resp.send(result);
//         });
//       } else {
//         console.log("Duplicate Entry");
//         resp.send("Already resgistered Email ID");
//       }
//     }
//   );
//   // }
// });

api2.listen(3002);
