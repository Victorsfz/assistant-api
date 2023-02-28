require("dotenv").config();

const express = require("express");
const cors = require("cors");
const port = process.env.PORT;
const ibmdb = require("ibm_db");

const connStr = `DATABASE=${process.env.DATABASE};HOSTNAME=${process.env.HOSTNAME};PORT=${process.env.DB2_PORT};PROTOCOL=TCPIP;UID=${process.env.UID};PWD=${process.env.PWD};Security=SSL;`;

const app = express();

app.use(express.json());
app.use(cors());

const findUser = async (payload) => {
  console.log(payload.body.ID);
  try {
    const db2String = `SELECT * FROM RESERVATIONS WHERE ID LIKE '${payload.body.ID}';`;
    const data = await connection.query(db2String);
    console.log(data);
    return data;
  } catch (err) {
    console.log(err);
  }
};

const updateDate = async (payload) => {
  console.log(payload.body.ID);
  try {
    console.log(payload.body);
    const result = await findUser(payload);
    let newCheckOut = new Date(payload.body.checkIn);
    newCheckOut.setDate(newCheckOut.getDate() + result[0].STAY);
    newCheckOut = newCheckOut.toJSON().substring(0, 10);
    console.log(newCheckOut);
    const db2String = `UPDATE RESERVATIONS SET CHECK_IN = '${payload.body.checkIn}', CHECK_OUT = '${newCheckOut}' WHERE ID LIKE '${payload.body.ID}';`;
    const data = await connection.query(db2String);
    console.log(data);
    return data;
  } catch (err) {
    console.log(err);
  }
};

const connection = ibmdb.openSync(connStr, (err, conn) => {
  if (err) console.error(err);
  return conn;
});

app.post("/find", async (req, res) => {
  const result = await findUser(req);
  res.send(result);
});

app.post("/changeDate", async (req, res) => {
  const result = await updateDate(req);
  res.send(result);
});

app.listen(port, async () => {
  console.log(`Running service on port ${port}`);
});
