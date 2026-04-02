const dotenv = require("dotenv");

dotenv.config();

function getMongoUri() {
  return process.env.MONGO_URI || process.env.MONGODB_URI || "";
}

function maskMongoUri(uri) {
  if (!uri) return "(empty)";

  try {
    const parsed = new URL(uri);
    const protocol = parsed.protocol || "mongodb:";
    const auth = parsed.username ? `${encodeURIComponent(parsed.username)}:***@` : "";
    const host = parsed.host || "(unknown-host)";
    const pathname = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "";
    return `${protocol}//${auth}${host}${pathname}`;
  } catch {
    return "(unparseable mongo uri)";
  }
}

function validateMongoUri(rawUri) {
  const uri = String(rawUri || "").trim();

  if (!uri) {
    return {
      ok: false,
      reason: "MongoDB connection string is missing. Set MONGO_URI or MONGODB_URI."
    };
  }

  if (!/^mongodb(\+srv)?:\/\//i.test(uri)) {
    return {
      ok: false,
      reason: "MongoDB connection string must start with mongodb:// or mongodb+srv://."
    };
  }

  if (/\s/.test(uri)) {
    return {
      ok: false,
      reason: "MongoDB connection string contains whitespace. Check your environment variable formatting."
    };
  }

  try {
    const parsed = new URL(uri);

    if (!parsed.hostname) {
      return {
        ok: false,
        reason: "MongoDB connection string is missing a hostname."
      };
    }

    return { ok: true, uri };
  } catch {
    return {
      ok: false,
      reason:
        "MongoDB connection string could not be parsed. If your username or password contains special characters like @, :, /, or ?, URL-encode them."
    };
  }
}

module.exports = {
  getMongoUri,
  maskMongoUri,
  validateMongoUri
};
