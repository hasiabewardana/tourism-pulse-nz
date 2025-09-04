// Import the bcrypt library to handle password hashing securely
const bcrypt = require("bcrypt");

// Define an array of user objects containing email and plain text passwords to be hashed
const passwords = [
  { email: "admin1@tourismpulsenz.nz", password: "admin1##" }, // Admin user credentials
  { email: "operator1@tourismpulsenz.nz", password: "operator1" }, // Operator user credentials
  { email: "user1@gmail.com", password: "user1" }, // Public user credentials
];

// Execute an immediately invoked async function to process passwords sequentially
(async () => {
  for (const user of passwords) {
    // Iterate over each user object in the array
    const hash = await bcrypt.hash(user.password, 10); // Generate a hash for the user's password with a salt round of 10
    console.log(`${user.email}: ${hash}`); // Output the email and corresponding hashed password to the console
  }
})();
