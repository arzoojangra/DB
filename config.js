const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db1",
});

connection.connect((err) => {
  if (err) console.log("can't connect");
  else console.log("connected");
});

module.exports = connection;
