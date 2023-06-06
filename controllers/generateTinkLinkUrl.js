import axios from 'axios';
import qs from 'qs';

// Config
const CLIENT_ID = process.env.TINK_CLIENT_ID;
const CLIENT_SECRET = process.env.TINK_CLIENT_SECRET;
const ACCOUNT_ID = process.env.SETTLEMENT_ACCOUNT_ID;
const MERCHANT_ID = process.env.MERCHANT_ID;


export const generateAccesstoken = async () => {

    let data = qs.stringify({
      'client_id': CLIENT_ID,
      'client_secret': CLIENT_SECRET,
      'grant_type': 'client_credentials',
      'scope': 'payment:read,payment:write,transfer:execute,transfer:read,link-session:write,settlement-accounts:readonly,settlement-accounts, merchants:readonly,merchants'
    })

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.tink.com/api/v1/oauth/token',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : data
    };

    return axios(config)
        .then(function (response) {
            const access_token = response.data.access_token;
            return access_token;
        })
        .catch(function (error) {
        console.log(error);
        });
 
};

export const generatePaymentRequestId = async (access_token) => {
 
   let data = {
        "accountId": ACCOUNT_ID,
        "amount": {
            "currencyCode": "GBP",
            "value": {
            "scale": "1",
            "unscaledValue": "1"
            }
        },
        "market": "GB",
        "merchantId": MERCHANT_ID,
        "payeeName": "Percys Piggy Bank",
        "reference": "Oink",
        "scheme": "FASTER_PAYMENTS"
    }

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.tink.com/payment/v1/settlement-account-payment-requests',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        },
        data : data
    };

    return axios(config)
        .then(function (response) {
            const payment_id = response.data.id;
            return payment_id;
        })
        .catch(function (error) {
        console.log(error);
        });

};

export const generateTinkLinkUrl = async (req, res) => {

    const access_token = generateAccesstoken();

    access_token.then(function(result) {

        const payment_id = generatePaymentRequestId(result)
        payment_id.then(function(id){
            const tinkLinkUrl = `https://link.tink.com/1.0/pay/?client_id=2ff04e23663c4e009214e5917dd4022e&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&market=GB&locale=en_US&payment_request_id=${id}`
            res.status(200).json({
                  url: tinkLinkUrl,
                });
        })
    })
};


