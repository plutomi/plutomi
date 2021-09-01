const ngrok = require("ngrok");
(async function () {
  const url = await ngrok.connect(3000);
  console.log(url);
})();
