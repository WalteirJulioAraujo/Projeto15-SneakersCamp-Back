import pg from "pg";

const { Pool } = pg;

const databaseConfig = {
  user: "postgres",
  password: "123456",
  host: "localhost",
  port: 5432,
  database: "sneakers_camp_database",
};

const connection = new Pool(databaseConfig);

export default connection;
