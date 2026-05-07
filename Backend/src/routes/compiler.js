import express from "express";
import axios from "axios";
import sqlite3 from "sqlite3";

const router = express.Router();

const languageMap = {
  python3: "4",
  nodejs: "4",
  java: "4",
  cpp17: "0",
  c: "5"
};

router.post("/run", async (req, res) => {
  try {
    const { source_code, language } = req.body;

    // =========================
    // SQL Execution (Local SQLite)
    // =========================
    if (language === "sql") {

      const db = new sqlite3.Database(":memory:");

      db.serialize(() => {

        db.exec(source_code, function (err) {

          if (err) {
            return res.status(500).json({
              error: err.message
            });
          }

          // Try getting rows if SELECT exists
          const match = source_code.match(/SELECT .*?;/is);

          if (match) {

            db.all(match[0], [], (err, rows) => {

              if (err) {
                return res.status(500).json({
                  error: err.message
                });
              }

              res.json({
                output: JSON.stringify(rows, null, 2)
              });

              db.close();
            });

          } else {

            res.json({
              output: "SQL executed successfully"
            });

            db.close();
          }

        });

      });

      return;
    }

    // =========================
    // JDoodle Languages
    // =========================

    const response = await axios.post(
      "https://api.jdoodle.com/v1/execute",
      {
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,

        script: source_code,

        language: language,

        versionIndex: languageMap[language]
      }
    );

    res.json(response.data);

  } catch (err) {

    console.log(err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || err.message
    });

  }
});

export default router;