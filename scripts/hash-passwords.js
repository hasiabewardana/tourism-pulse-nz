// This script hashes passwords for users and prints the email with the hashed password.
// It uses bcrypt for hashing and is intended to be run in a Node.js environment.
// Make sure to install bcrypt using `npm install bcrypt` before running this script.
// The output can be used to store hashed passwords in a database securely.
// Note: Do not hardcode passwords in production code; use environment variables or secure vaults
// for sensitive information.
// This script is for demonstration purposes only and should not be used in production without proper security measures
const bcrypt = require("bcrypt");

const passwords = [
  { email: "admin1@tourismpulsenz.nz", password: "admin1" },
  { email: "operator1@tourismpulsenz.nz", password: "operator1" },
  { email: "user1@gmail.com", password: "user1" },
];

(async () => {
  for (const user of passwords) {
    const hash = await bcrypt.hash(user.password, 10);
    console.log(`${user.email}: ${hash}`);
  }
})();
