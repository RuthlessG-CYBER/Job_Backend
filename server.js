// server.js
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to SQLite
const db = new sqlite3.Database("./jobdb.sqlite", (err) => {
    if (err) {
        console.error("Error opening database", err.message);
    } else {
        console.log("Connected to SQLite database");
        db.run(
            `CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                company TEXT,
                location TEXT,
                salaryRange TEXT,
                jobType TEXT
            )`
        );
    }
});


app.get("/", (req, res) => {
    res.send("Welcome to Job Updater API");
})

// API: Get all jobs
app.get("/jobs", (req, res) => {
    db.all("SELECT * FROM jobs", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// API: Add a job
app.post("/jobs", (req, res) => {
    const { title, company, location, salaryRange, jobType } = req.body;
    db.run(
        "INSERT INTO jobs (title, company, location, salaryRange, jobType) VALUES (?, ?, ?, ?, ?)",
        [title, company, location, salaryRange, jobType],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({
                id: this.lastID,
                title,
                company,
                location,
                salaryRange,
                jobType,
            });
        }
    );
});

app.listen(4040, () => console.log("Server running on http://10.0.2.2:4040"));
