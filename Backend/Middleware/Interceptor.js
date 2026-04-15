module.exports = (req, res, next) => {
  console.log("---- Incoming Request ----");
  console.log("Time:", new Date().toLocaleString());
  console.log("URL:", req.originalUrl);
  console.log("Method:", req.method);
  console.log("IP:", req.ip);
  console.log("--------------------------");

  next();
};