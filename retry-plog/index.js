const axios = require("axios");
const express = require("express");

const app = express();

const PORT = 5252;

app.get("/", async (req, res) => {
  const target = "https://enoki.henchgalphilippines.com";

  const checkSite = async () => {
    try {
      const response = await axios.get(target, { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  };

  let ready = await checkSite();
  while (!ready) {
    await new Promise((r) => setTimeout(r, 1000));
    ready = await checkSite();
  }

  res.redirect(target);
});

app.listen(PORT, () => {
  console.log(`Kiosk redirect server running at http://localhost:${PORT}`);
});
