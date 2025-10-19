const bcrypt = require('bcrypt');
bcrypt.hash('yourpassword', 10).then(console.log);
bcrypt.compare('yourpassword', '$2b$10$2uY8O4qJLF.87bFfXYR7muMEIkPg51qETS17CC7Q44qoZ6.vVcVDW').then(console.log); // should return true
