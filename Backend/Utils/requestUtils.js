function collectRequestData(req) {
  const parts = [];

  if (req.originalUrl) parts.push(String(req.originalUrl));

  if (req.query && Object.keys(req.query).length > 0) {
    parts.push(JSON.stringify(req.query));
  }

  if (req.body && Object.keys(req.body).length > 0) {
    parts.push(JSON.stringify(req.body));
  }

  return parts.join(" ");
}

function getClientIp(req) {
  return req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip || "Unknown";
}

module.exports = { collectRequestData, getClientIp };