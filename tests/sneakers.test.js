import connection from "../src/database";
import app from "../src/app";
import supertest from "supertest";

afterAll(async () => {
  await connection.query("DELETE FROM sneakers WHERE name = 'somewordtotest'");
  connection.end();
});

describe("GET /list/sneakers", () => {
  it("return status 200 and all sneakers exists in database", async () => {
    const response = await connection.query("SELECT * FROM sneakers");
    const result = await supertest(app).get("/list/sneakers");
    const status = result.status;
    expect(status).toEqual(200);
    expect(result.body.length).toEqual(response.rows.length);
  });

  it("return status 200 and sneakers who contains filtered words", async () => {
    await connection.query(
      "INSERT INTO sneakers (name,description,price,image) VALUES ('somewordtotest','testeteste',101010,'teste')"
    );
    const filteredList = await connection.query(
      "SELECT * FROM sneakers WHERE name ILIKE '%somewordtotest%'"
    );
    const filteredTestList = await supertest(app).get(
      "/list/sneakers?filter=somewordtotest"
    );
    const status = filteredTestList.status;
    expect(status).toEqual(200);
    expect(filteredTestList.body.length).toEqual(filteredList.rows.length);
  });
});
