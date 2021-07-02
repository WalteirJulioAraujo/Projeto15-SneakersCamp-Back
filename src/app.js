import express from "express";
import cors from "cors";
import connection from "./database.js";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { v4 as uuid } from "uuid";
import { LogInSchema } from "./schemas/AllSchemas.js";
import { SignUpSchema } from "./schemas/AllSchemas.js";

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
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.post("/signup", async (req, res) => {
  const { name, email, password, cep } = req.body;

  const validate = SignUpSchema.validate(req.body);
  if (validate.error) {
    console.log(validate.error);
    return res.sendStatus(500);
  }

  const hash = bcrypt.hashSync(password, 10);
  try {
    const thisEmailalreadyExists = await connection.query(
      `
        SELECT * FROM users
        WHERE email = $1
        `,
      [email]
    );

    if (thisEmailalreadyExists.rows.length) return res.sendStatus(409);
    await connection.query(
      `
        INSERT INTO users
        (name,email,password,cep)
        VALUES ($1,$2,$3,$4)
        `,
      [name, email, hash, cep]
    );

    res.send(201);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const validate = LogInSchema.validate(req.body);
  if (validate.error) {
    console.log(validate.error);
    return res.sendStatus(500);
  }
  try {
    const searchEmail = await connection.query(
      `
        SELECT * FROM users
        WHERE email = $1
        `,
      [email]
    );
    const user = searchEmail.rows[0];

    const searchIfAlreadyExistsSession = await connection.query(
      `
        SELECT * FROM sessions
        WHERE "userId" = $1
        `,
      [user?.id]
    );
    if (searchIfAlreadyExistsSession.rows[0]) {
      await connection.query(
        `
            DELETE FROM sessions
            WHERE "userId" = $1
            `,
        [user?.id]
      );
    }

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = uuid();
      await connection.query(
        `
            INSERT INTO sessions
            ("userId",token)
            VALUES ($1,$2)
            `,
        [user.id, token]
      );
      const response = await connection.query(
        `SELECT cep FROM users WHERE id = $1`,
        [user.id]
      );
      const cep = response.rows[0].cep.toString();
      res.send({ name: user.name, token, cep, id: user.id }).status(200);
    } else {
      return res.sendStatus(401);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.get("/stock/:id", async (req, res) => {
  const availabeSizes = await connection.query(
    `
  SELECT * FROM stock
  WHERE "sneakersId"=$1
  AND quantity > 0
  `,
    [req.params.id]
  );
  res.send(availabeSizes.rows);
});

app.post("/payment", async (req, res) => {
  try {
    const newBody = req.body;
    newBody.date = dayjs().format();
    await connection.query(
      `INSERT INTO sales (sneakers,"userId","shippingAddress",value,date) VALUES ($1,$2,$3,$4,$5)`,
      [
        newBody.sneakers,
        newBody.userId,
        newBody.shippingAddress,
        newBody.value,
        newBody.date,
      ]
    );
    res.send(201);
  } catch {
    res.sendStatus(500);
  }
});

for (let i = 1; i < 13; i++) {
  const unit = Math.floor(Math.random() * 5) + 1;
  connection.query(`
    INSERT INTO stock ("sneakersId",size,quantity) VALUES (${i},39,$1),(${i},40,$1),(${i},41,$1),(${i},42,$1),(${i},43,$1),(${i},44,$1)`,
    [unit]
  );
}

export default app;
