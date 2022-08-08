import 'dotenv/config'
import conn from './config/dbConfig.js'
import express from 'express'
import axios from 'axios'
import cors from 'cors'
import twilioVerify from './routes/twilioVerify.js'
import payment from './routes/tl_payment.js'
import rvnu from './routes/rvnuCode.js'
import user from './routes/rvnuUser.js'
import merchant from './routes/rvnuMerchant.js'
import providers from './routes/tl_providers.js'
import * as tlSigning from 'truelayer-signing'


const app = express()
app.use(express.json())
app.use(cors())

app.use('/verify', twilioVerify)
app.use('/payment', payment)
app.use('/rvnu', rvnu)
app.use('/providers', providers)
app.use('/user', user)
app.use('/merchant', merchant)


app.get('/', (req, res) => {
    res.json("welcome to RVNU")
})


// ########## WEBHOOK NOTIFICATIONS ########## 

// Webhook URI set in the TrueLayer console

/*

const allowedJkus = {
    "https://webhooks.truelayer.com/.well-known/jwks": true,
    "https://webhooks.truelayer-sandbox.com/.well-known/jwks": true,
  };

async function verify_hook(req) {
    // extract the Tl-Signature from the headers
    let sig = req.headers["tl-signature"];
    tlSigning.SignatureError.ensure(sig, "missing Tl-Signature header");
    console.log(sig)
  
    // `jku` field is included in webhook signatures
    let jku = tlSigning.extractJku(sig);
    console.log(jku)

    // check `jku` is an allowed TrueLayer url & fetch jwks JSON (not provided by this lib)
    ensureJkuAllowed(jku);
    let jwks = fetchJwks(jku);
  
    // verify the request (will throw on failure)
    tlSigning.verify({
      signature: sig,
      method: req.method,
      path: req.path,
      headers: req.headers,
      body: req.body,
      jwks: JSON.stringify(jwks),
    });
  }
*/

export const paymentExecuted = (status, payment_id, event_id, executed_at) => {
  // Updates database to reflect 'payment_executed' status
  const query = "UPDATE RvnuTransaction SET Status = '"+ status +"', EventID = '"+ event_id +"', Webhook_Datetime = '"+ executed_at +"'WHERE PaymentID = '"+ payment_id +"'"

  try {
    conn.query(query, (err) => {
      if(err) return console.log(err)
      console.log("Successfully updated payment status: payment_executed'");
    });
  } catch (err) {
      console.log(err)
  }
}

export const paymentFailed = (status, payment_id, event_id, failed_at, description) => {
  // Updates database to reflect 'payment_failed' status
  const query = "UPDATE RvnuTransaction SET Status = '"+ status +"', EventID = '"+ event_id +"', Webhook_Datetime = '"+ failed_at +"', Webhook_Description = '"+ description +"' WHERE PaymentID = '"+ payment_id +"'"

  try {
    conn.query(query, (err) => {
      if(err) return console.log(err)
      console.log("Successfully updated payment status: payment_failed");
    });
  } catch (err) {
      console.log(err)
  }
}

// Handle webhook notifications sent from TrueLayer
// Webhook URI set in the TrueLayer console (use ngrok whilst in development mode)
// Payment notifictions have two 'type'(s):
// payment_executed or payment_failed
app.post('/notifications', function(req, res) {

    try {

        //const signature = req.header('Tl-Signature')
        const requestItems = req.body

        console.log("Notification request items below:")
        console.log(requestItems)
        const status = requestItems.type
        const payment_id = requestItems.payment_id
        const event_id = requestItems.event_id

        switch(status) {

          case 'payment_executed':
            const executed_at = requestItems.executed_at
            paymentExecuted(status, payment_id, event_id, executed_at)
            break;

          case 'payment_failed':
            const description = requestItems.failure_reason
            const failed_at = requestItems.failed_at
            paymentFailed(status, payment_id, event_id, failed_at, description)
            break;

          default:
            paymentFailed()
        }

        //console.log(signature)

        //verify_hook(req)

    } catch (error) {

    }
  
});


/*
  // global JWK cache
  const cachedJwks = {};
  
  // Tries to retrive the JWKs from a cache,
  // otherwises, gets the JWKs from the endpoint.
  // JWKs are unique by JKU+KID,
  // which is how the cache is determined to be up to date
  async function get_jwks(sig) {
    let kid = tlSigning.extractKid(sig);
    tlSigning.SignatureError.ensure(kid, `Tl-Signature has missing key id`);
  
    let jku = tlSigning.extractJku(sig);
    tlSigning.SignatureError.ensure(allowedJkus[jku], `Tl-Signature has invalid jku: ${jku}`);
  
    // check if we have this KID/JKU pair stored
    let jwks = cachedJwks[jku];
    if (jwks) {
      for (let i = 0; i < jwks.keys.length; i++) {
        if (jwks.keys[i].kid == kid) {
          return jwks;
        }
      }
    }
  
    // otherwise, fetch the JWKs from the server
    cachedJwks[jku] = (await axios.get(jku)).data;
    return cachedJwks[jku];
  }
  

  // Note: Webhook path can be whatever is configured, here a unique path
  // is used matching the README example signature.
  app.post('/notifications',
    express.text({ type: "application/json" }),
    (req, res, next) => {
      // attempt to verify the webhook
      // if success, call the next handler
      // if failure, return 403 Forbidden
      return verify_hook(req)
        .then(next)
        .catch(err => {
          console.warn(err);
          res.status(403).end();
        });
    },
    (_req, res) => {
      res.status(202).end();
    }
  );
  */

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))