const mongoose = require("mongoose");
const { getMongoUri, maskMongoUri, validateMongoUri } = require("./env");

let connectionPromise = null;

function classifyMongoError(error) {
  const message = String(error?.message || "");

  if (/authentication failed|bad auth|auth failed/i.test(message)) {
    return "Authentication failed. Check Atlas username/password and make sure special characters are URL-encoded.";
  }

  if (/getaddrinfo|enotfound|querysrv|dns/i.test(message)) {
    return "DNS/network lookup failed. Check the Atlas hostname, SRV record resolution, and outbound DNS/network access.";
  }

  if (/ip.*not.*whitelist|not authorized on admin to execute command|connection .* closed|server selection timed out/i.test(message)) {
    return "Atlas network access may be blocking this connection. Verify the connecting machine or server egress IP is allowed in Atlas IP Access List.";
  }

  if (/ssl|tls|certificate|handshake/i.test(message)) {
    return "TLS handshake failed. Check Atlas TLS requirements, runtime CA certificates, and any proxy/network interception.";
  }

  if (/timed out|timeout/i.test(message)) {
    return "Connection timed out. This is often caused by Atlas IP access rules, blocked outbound traffic, or DNS/network issues.";
  }

  if (/could not be parsed|invalid scheme/i.test(message)) {
    return "MongoDB connection string appears invalid. Verify the URI format and URL-encode special characters in credentials.";
  }

  return "Unknown MongoDB connection error. Check connection string format, Atlas network access, and server runtime logs.";
}

async function attemptConnection(uri, attemptNumber) {
  console.log(`[db] connecting to MongoDB Atlas (attempt ${attemptNumber}) using ${maskMongoUri(uri)}`);

  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10
  });
}

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const validation = validateMongoUri(getMongoUri());

  if (!validation.ok) {
    throw new Error(validation.reason);
  }

  const uri = validation.uri;

  connectionPromise = (async () => {
    try {
      await attemptConnection(uri, 1);
      console.log("✅ DB connected");
      return mongoose.connection;
    } catch (error) {
      const isRetryable = /timed out|timeout|getaddrinfo|enotfound|querysrv|dns|server selection/i.test(
        String(error?.message || "")
      );

      console.error(`[db] first connection attempt failed: ${classifyMongoError(error)}`);

      if (!isRetryable) {
        throw error;
      }

      console.warn("[db] retrying MongoDB connection once after transient network/server selection failure");

      await new Promise((resolve) => setTimeout(resolve, 1500));
      await attemptConnection(uri, 2);
      console.log("✅ DB connected");
      return mongoose.connection;
    }
  })();

  try {
    return await connectionPromise;
  } catch (err) {
    console.error("❌ DB connection error:", classifyMongoError(err));
    throw err;
  } finally {
    connectionPromise = null;
  }
};

module.exports = connectDB;
