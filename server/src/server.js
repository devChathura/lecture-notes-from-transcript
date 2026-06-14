const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

const app = require("./app");

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = server;
