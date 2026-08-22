const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers to prevent SRV lookup failures on Windows/local networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (err) {
  // fallback to default DNS configuration
}

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MongoDB Connection Error: MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
