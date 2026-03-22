module.exports = (req, res, next) => {
    console.log("---- Incoming Request ----");
    console.log("URL:", req.url);
    console.log("Method:", req.method);
    console.log("Body:", req.body);
    console.log("Headers:", req.headers);
    console.log("--------------------------");

    next();
};