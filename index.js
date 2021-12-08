const express = require("express");
const app = express();
const sqlite3 = require("sqlite3").verbose();

//Run engine
app.set("view engine", "ejs");
const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
//Middleware for the Requests.body to retrieve posted values
app.use(express.urlencoded({ extended: false })); // <--- middleware configuration 

app.listen(3000, () => {
  console.log("Server started (http://localhost:3000/)");
});

//Connection to the database
const db_name = path.join(__dirname, "data", "reagents.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'reagents.db'");
});

//Creating table
const sql_create_reagents = `CREATE TABLE IF NOT EXISTS Reagent (
    Reagent_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Department_Name VARCHAR(100) NOT NULL,
    Department_Bench VARCHAR(100) NOT NULL,
    Instrument VARCHAR(100) NOT NULL,
    Reagent_Name VARCHAR(100) NOT NULL,
    Receive_Date VARCHAR(100) NOT NULL,
    Lot_Number INTEGER(20) NOT NULL,
    Expiration_Date DATE NOT NULL,
    Quantity_Initial INTEGER(10) NOT NULL,
    Quantity_Current INTEGER(10) NOT NULL,
    QC_Status BINARY NOT NULL,
    Received_By VARCHAR(100) NOT NULL,
    Comments TEXT
  );`;
  
  db.run(sql_create_reagents, err => {
    if (err) {
      return console.error(err.message);
    }
  });

//GET for home route
app.get("/", (req, res) =>{
    let sql = "SELECT DISTINCT Department_Bench FROM Reagent";
    db.all(sql, [], (err, row) => {
        if (err) {
            console.log(err);
        }
        res.render('index', {model: row});
    })
  });

// GET /add
app.get("/add", (req, res) => {
    res.render("add", { model: {} });
  });
  
// POST /add
app.post("/add", (req, res) => {
    let sql = `INSERT INTO Reagent (Department_Name, Department_Bench, Instrument, Reagent_Name, Receive_Date, 
        Lot_Number, Expiration_Date, Quantity_Initial, Quantity_Current, QC_Status, Received_By, Comments) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    let reagent = [req.body.Department_Name, req.body.Department_Bench, req.body.Instrument, 
        req.body.Reagent_Name, req.body.Receive_Date, req.body.Lot_Number, req.body.Expiration_Date, 
        req.body.Quantity, req.body.Quantity, "Not Complete", req.body.Received_By, req.body.Comments];
    db.run(sql, reagent, err => {
        if (err) {
            console.log(err);
        }else{
            console.log("Successfully added reagent to 'Reagent' table.");
        };
        res.redirect("/add");
    });
  });

//GET for bench route
app.get("/bench/:bench", (req, res) =>{
    let bench = req.params.bench;
    let sql = "SELECT DISTINCT Instrument FROM Reagent WHERE Department_Bench = ?";
    db.all(sql, bench, (err, row) => {
        if (err) {
            console.log(err);
        }
        res.render('bench', {model: row});
    })
  });

  //GET for instrument route
app.get("/instrument/:instrument", (req, res) =>{
    let instrument = req.params.instrument;
    let sql = "SELECT DISTINCT Reagent_Name FROM Reagent WHERE Instrument = ?";
    db.all(sql, instrument, (err, row) => {
        if (err) {
            console.log(err);
        }
        res.render('instrument', {model: row});
    })
  });

    //GET for reagent route
app.get("/reagent/:reagent", (req, res) =>{
    let reagent = req.params.reagent;
    let sql = "SELECT * FROM Reagent WHERE Reagent_Name = ?";
    db.all(sql, reagent, (err, row) => {
        if (err) {
            console.log(err);
        }
        res.render('reagent', {model: row});
    })
  });

// GET for editing reagent information
app.get("/edit/:id", (req, res) => {
    let id = req.params.id;
    let sql = "SELECT * FROM Reagent WHERE Reagent_ID = ?";
    db.get(sql, id, (err, row) => {
      if (err){
          console.log(err);
      }
      res.render("editor", { model: row });
    });
  });
  
// POST for editing reagents information
app.post("/edit/:id", (req, res) => {
    let sql = `UPDATE Reagent SET Department_Name = ?, Department_Bench = ?, Instrument = ?, Reagent_Name = ?, 
        Receive_Date = ?, Lot_Number = ?, Expiration_Date = ?, Quantity_Initial = ?, Quantity_Current = ?, 
        QC_Status = ?, Received_By = ?, Comments = ? WHERE Reagent_ID = ?`;
    let reagentUpdate = [req.body.Department_Name, req.body.Department_Bench, req.body.Instrument, 
        req.body.Reagent_Name, req.body.Receive_Date, req.body.Lot_Number, req.body.Expiration_Date, 
        req.body.Quantity_Initial, req.body.Quantity_Current, req.body.QC_Status, req.body.Received_By, 
        req.body.Comments, req.params.id];
    db.run(sql, reagentUpdate, err => {
      if (err){
          console.log(err);
      }
    // res.redirect('/');
    res.redirect(`/reagent/${req.body.Reagent_Name}`);
    });
  });

// route for editing items get and post
// GET for removing reagent quantity 
app.get("/remove/:id", (req, res) => {
    let id = req.params.id;
    let sql = "SELECT * FROM Reagent WHERE Reagent_ID = ?";
    db.get(sql, id, (err, row) => {
      if (err){
          console.log(err);
      }
      res.render("editor", { model: row });
    });
  });
  
// POST for removing reagent quantity
app.post("/remove/:id", (req, res) => {
    let sqlUpdate = `UPDATE Reagent SET Quantity_Current = ? WHERE Reagent_ID = ?`;
    let quantity_id = [req.body.Quantity_Current, req.params.id];
    db.run(sqlUpdate, quantity_id, err => {
      if (err){
          console.log(err);
      }
    // res.redirect('/');
    res.redirect(`/reagent/${req.body.Reagent_Name}`);
    });
  });
  //Table needed for reagents, QC, and log of transactions

// Shorten table in reagent view by adding bread crumb