const express = require("express");
const query = require("../mySQL/connection");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const results = await query(
    `SELECT id 
      FROM users 
        WHERE email LIKE "${email}" 
          AND hashed_password 
            LIKE "${password}";`
  );
  if (results.length > 0) {
    res.send({ status: 1 });
  } else {
    res.send({ status: 0 });
  }
});

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const results = await query(
      `INSERT INTO users (email, hashed_password) VALUES ('${email}', '${password}')`
    );
    res.send({ status: 1 });
  } catch (e) {
    console.log(e);
    res.send({ status: 0 });
  }
});

module.exports = router;
