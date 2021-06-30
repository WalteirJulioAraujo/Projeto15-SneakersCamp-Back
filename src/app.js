import express from "express";
import cors from "cors";
import connection from "./database.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/list/sneakers", async (req, res) => {
  try {
    if (!req.query.filter) {
      const sneakers = await connection.query(`SELECT * FROM sneakers;`);
      res.send(sneakers.rows);
    } else {
      let filterArray;
      let nums = "";
      if (typeof req.query.filter === "object") {
        for (let i = 0; i < req.query.filter.length - 1; i++) {
          nums = nums + ` OR name ILIKE ('%' || $${i + 2} || '%')`;
        }
        filterArray = req.query.filter;
      } else {
        filterArray = [req.query.filter];
      }
      const sneakers = await connection.query(
        `SELECT * FROM sneakers WHERE name ILIKE ('%' || $1 || '%')${nums}`,
        filterArray
      );
      res.send(sneakers.rows);
    }
  } catch {
    res.sendStatus(500);
  }
});

export default app;
