require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/user", require("./routes/user"));
app.use("/demo", require("./routes/demo"));
app.use("/trips", require("./routes/trips"));
app.use("/onboarding", require("./routes/onboarding"));

const port = process.env.PORT || 6001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
