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

// This is default route
app.get("/", (req, res) => {
    res.send("Welcome to Job Updater API");
})

// Get all jobs from this endpoint
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

    
    db.get(
        "SELECT * FROM jobs WHERE title = ? AND company = ? AND location = ?",
        [title, company, location],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (row) {
                return res.status(400).json({ error: "Job already exists!" });
            }

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
        }
    );
});
// API: Delete a job by id
app.delete("/jobs/:id", (req, res) => {
    const jobId = req.params.id;

    db.run("DELETE FROM jobs WHERE id = ?", [jobId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Job not found" });
        }

        res.json({ message: "Job deleted successfully", id: jobId });
    });
});



app.listen(4140, () => console.log("Server running on http://localhost:4140"));


