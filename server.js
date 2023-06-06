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
  res.json("welcome to Percy's Piggy Bank");
});

app.listen(port, () => {
  console.log(`Piggy bank server listening on port ${port}`);
});



/*

const getAccessToken = async () => {

    let data = {
      'client_id': '2ff04e23663c4e009214e5917dd4022e',
      'client_secret': '095428794b4a41eba43fcbd60d2b35fe',
      'grant_type': 'client_credentials',
      'scope': 'payment:read,payment:write,settlement-accounts:readonly,settlement-accounts'
    }

    let URL = 'https://api.tink.com/api/v1/oauth/token'

    try {
      api
        .post(URL, data)
        .then(async (response) => {
          // GENERATE QR CODE FROM URL
          console.log(response)
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          console.log(error);
        });
    } catch {
      setLoading(false);
      console.log("Error getting access token");
    }
  };
)

*/