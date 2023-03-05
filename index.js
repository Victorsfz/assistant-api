require("dotenv").config();

const express = require("express");
const cors = require("cors");
const port = process.env.PORT;
const ibmdb = require("ibm_db");

const connStr = `DATABASE=${process.env.DATABASE};HOSTNAME=${process.env.HOSTNAME};PORT=${process.env.DB2_PORT};PROTOCOL=TCPIP;UID=bmq13124;PWD=iAlSyAQh0jryJxuE;Security=SSL;`;

const app = express();

app.use(express.json());
app.use(cors());

const findUser = async (payload) => {
  console.log(payload.body.ID);
  try {
    const db2String = `SELECT * FROM RESERVATIONS WHERE ID LIKE '${payload.body.ID}';`;
    const data = await connection.query(db2String);
    return data
  } catch (err) {
    console.log(err);
  }
};

const dateDifference = async (payload) => {
  let checkIn = new Date(payload[0].CHECK_IN)
  let checkOut = new Date(payload[0].CHECK_OUT)
  let difference = checkOut.getTime() - checkIn.getTime();
  let totalDays = Math.ceil(difference / (1000 * 3600 * 24)); 
  return totalDays;
}

const updateDate = async (payload) => {
  try {
    const result = await findUser(payload);
    if (result.length !== 0 ) {
      const stayLength = await dateDifference(result)
      let oldCheckIn = result[0].CHECK_IN
      console.log(oldCheckIn)
      let newCheckOut = new Date(payload.body.newCheckIn);
      newCheckOut.setDate(newCheckOut.getDate() + stayLength);
      newCheckOut = newCheckOut.toLocaleDateString("en-US")
      const db2String = `UPDATE RESERVATIONS SET CHECK_IN = '${payload.body.newCheckIn}', CHECK_OUT = '${newCheckOut}', ${payload.body.freeDateOption} = '${oldCheckIn}' WHERE ID LIKE '${payload.body.ID}';`;
      const data = await connection.query(db2String);
        return `Data updated. New check-in is: ${payload.body.newCheckIn}`;
    } else {
      return "User not found"
    }
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
  console.log(result)
  if (result.length !== 0) {
    res.send(result[0]);
    } else {
      res.send("User not found")
  }
});

app.post("/changeDate", async (req, res) => {
  const result = await updateDate(req);
  res.send(result);
});

app.get("/", (req, res) => {
  res.send("Funcionando")
})

app.listen(port, async () => {
  console.log(`Running service on port ${port}`);
});
