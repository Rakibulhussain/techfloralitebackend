

const requestLogger = (req, res, next) => {
  const start = Date.now();

  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    req.ip;
  console.log( "\n********** ********** **********   ********** ********** ********** ********** ********** ********** ********** ********** ********** ********** **********  \n");
  console.log(`📅 ${new Date().toLocaleString()}`);
  console.log(`🌐 ${req.method} ${req.originalUrl}`);
  console.log(`🖥️ IP: ${ip}`);
  console.log(`📦 Body:`, req.body);
  console.log(`❓ Query:`, req.query);
  console.log(`📌 Params:`, req.params);

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log(`✅ Status: ${res.statusCode}`);
    console.log(`⏱️ Time: ${duration} ms`);

    console.log("\n #################### #################### #################### #################### #################### ################### #################### ############  \n");

  });

  next();
};

module.exports={
requestLogger
} 