import express from "express";
import cors from "cors";
import connection from "./database.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/list/sneakers", async (req, res) => {
  try {
    if (req.query.filter?.length === 0) {
      const sneakers = await connection.query(`SELECT * FROM sneakers;`);
    } else {
      let nums = "";
      if (typeof req.query.filter === "object") {
        req.query.filter.forEach(
          (item, i) => (nums = nums + ` OR ('%' || $${i + 2} || '%')`)
        );
      }
      const sneakers = await connection.query(
        `SELECT * FROM sneakers WHERE description ILIKE '(% || $1 || %)'${nums}`,
        req.query.filter
      );
      res.send(sneakers.rows);
    }
    res.sendStatus(400);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

export default app;
