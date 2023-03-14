const express = require("express");
const connection = require("./config");
const cors = require("cors");
var moment = require("moment");
const { body, validationResult } = require("express-validator");
const address = require("address");
const puppeteer = require("puppeteer");

const fs = require("fs-extra");

const path = require("path");
const { resolve } = require("path");

const api2 = express();

api2.use(cors());
api2.use(express.json());
// api2.use(bodyParser.json());

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
      if (err) return res.status(403).json({ mesage: err.sqlMessage });
      else res.send(result);
    }
  );
}); //read particular

api2.get("/pdf/:id", (req, res) => {
  connection.query(
    "SELECT ID, Name, Contact, Email, PAN, Aadhar, Image, from_unixtime(ImageTime, '%D %M %Y %h:%i %p') as ImageTime, ImageIP, Address FROM UserList WHERE ID =" +
      req.params.id,
    (err, result) => {
      if (err) return res.status(403).json({ mesage: err.sqlMessage });
      else res.send(result);
    }
  );
}); //read particular for pdf

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
); //creating user

api2.put("/:id", (req, res) => {
  var currTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
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
}); //updating user

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
}); //deleting user

api2.put("/image/:id", (req, res) => {
  var currTime = moment().unix();
  let ipAddress;

  address((err, addrs) => {
    ipAddress = addrs.ip;
    console.log(ipAddress);
  });
  const data = [
    req.body.Image,
    req.body.Latitude,
    req.body.Longitude,
    currTime,
    ipAddress,
    req.body.Address,
  ];

  connection.query(
    "UPDATE UserList SET Image=?, Latitude=?, Longitude=?, ImageTime=?, ImageIP=?, Address=? WHERE ID = " +
      req.params.id,
    data,
    (err, result) => {
      if (err) {
        return res.status(403).json({ mesage: err.sqlMessage });
      }
      res.send(result);
    }
  );
}); //updating image

//pdf downloader----->>>>>
// api2.post("/create-pdf", async (req, res) => {
//   const { url } = req.body;
//   // console.log("-----------", id);
//   // const url = "http://localhost:3001/" + { id };
//   console.log("url--------", url);

//   const webpageTopdf = async () => {
//     console.log("inside webpagetopdf-----", url);
//     const browser = await puppeteer.launch();
//     const webpage = await browser.newPage();
//     await webpage.goto(url, {
//       waitUntil: "networkidle0",
//     });
//     await webpage
//       .pdf({
//         printBackground: true,
//         displayHeaderFooter: false,
//         path: "result.pdf",
//         format: "Tabloid",
//         landscape: false,
//         margin: {
//           top: "10px",
//           bottom: "10px",
//           left: "5px",
//           right: "5px",
//         },
//       })
//       .then(() => {
//         console.log("File downloaded    1");
//         return res.send(url), res.status(200);
//       })
//       .catch((e) => {
//         console.log(e);
//         res.send("Error in fetching url");
//       });
//     await browser.close();
//   };

//   if (url) {
//     console.log("hiiiiiiiiiiii", url);
//     webpageTopdf();
//   }
// });

//template for pdf--->>>>

const template = ({ user }) => {
  // console.log("template --->>> ", user.Name);
  return `<html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${user.Name}</title>
  
      <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    </head>
    <body>
      <div class="container">
        <div class="border border-dark-subtle rounded my-5 p-3">
          <div class="row">
            <div class="col-md-12 p-4">
              <div
                class="w-20 d-flex justify-content-between align-items-center"
              >
                <h3 class="menu-title fs-1  fw-bold float-start">${user.Name}</h3>
                <img src="${user.Image}" class="w-25 rounded" />
              </div>
              <ul class="list-group mt-5">
                <li class="list-group-item">
                  <span class="float-start text-secondary w-25">
                    Contact Number
                  </span>
                  <span class="text-secondary">+91</span>
                  ${user.Contact}
                </li>
                <li class="list-group-item">
                  <span class="float-start text-secondary w-25">Email</span>
                  ${user.Email}
                </li>
                <li class="list-group-item">
                  <span class="float-start text-secondary w-25">PAN</span>
                 ${user.PAN}
                </li>
                <li class="list-group-item">
                  <span class="float-start text-secondary w-25">Aadhar</span>
                  ${user.Aadhar}
                </li>
                <li class="list-group-item">
                  <span class="float-start text-secondary w-25">
                    IP address for Image
                  </span>
                  ${user.ImageIP}
                </li>
                <li class="list-group-item">
                  <span class="float-start text-secondary w-25">
                    Image Capture Time
                  </span>
                  ${user.ImageTime}               
                   </li>
                <li class="list-group-item">
                  <span class="float-start text-secondary w-25">
                    Address for Image
                  </span>
                  ${user.Address}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
};

api2.post("/post-pdf", async (req, res) => {
  const user = req.body;
  // console.log(user);
  // console.log(content);

  // const html = await fs.readFile(filePath, "utf8");
  // return hbs.compile(html)(data);

  (async function () {
    try {
      const browser = await puppeteer.launch();

      const page = await browser.newPage();

      const content = await template(user);

      // const content = await compile("index", user);

      await page.setContent(content, { waitUntil: "domcontentloaded" });

      await page.emulateMediaType("screen");

      await page.pdf({
        path: "output.pdf",
        format: "A4",
        printBackground: true,
      });

      console.log("done creating pdf");

      await browser.close();

      res.send();

      // process.exit();
    } catch (e) {
      console.log(e);
    }
  })();
});

api2.get("/download/fetch-pdf", (req, res) => {
  console.log("sending file to frontend!!");
  res.sendFile(`${__dirname}/output.pdf`);
});

api2.listen(3002);
