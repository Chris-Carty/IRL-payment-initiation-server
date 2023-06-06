import "dotenv/config";
import express from "express";
import cors from "cors";
import generateTinkLinkUrl from "./routes/generateTinkLinkUrl.js";
import polling from "./routes/polling.js";
import refund from "./routes/refund.js";

const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());
app.use(cors());


app.use("/tinkLink", generateTinkLinkUrl);
app.use("/polling", polling);
app.use("/refund", refund);


app.get("/", (req, res) => {
  res.json("welcome to Percy's Piggy Bank server");
});

app.listen(port, () => {
  console.log(`Piggy bank server listening on port ${port}`);
});