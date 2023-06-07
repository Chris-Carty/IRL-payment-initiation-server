import axios from 'axios';
import qs from 'qs';
import { uuid } from 'uuidv4';

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


export const listTransactions = async (access_token, payment_request_id) => {
    

    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.tink.com/payment/v1/merchants/${MERCHANT_ID}/accounts/${ACCOUNT_ID}/transactions`,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    };

    return axios(config)
        .then(function (response) {
            // Set array of transactions
            const transaction_arr = response.data.transactions
            // Filter array of transactions to find transac that correspond to payment_request_id
            let transaction_obj = transaction_arr.find(o => o.paymentRequestId === payment_request_id)
            return transaction_obj.id;
        })
        .catch(function (error) {
        console.log(error);
        });

};



export const refundRequest = async (access_token, transaction_id) => {
 
   let data = {
    "amount": {
        "currencyCode": "GBP",
        "value": {
        "scale": "0",
        "unscaledValue": "1"
        }
    },
    "metadata": {
        "key1": "value1",
        "key2": "value2"
    },
    "reference": "Refund7ad0feabb4ab",
    "transactionId": transaction_id
    }

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://api.tink.com/payment/v1/merchants/${MERCHANT_ID}/accounts/${ACCOUNT_ID}/refunds`,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
            'Idempotency-Key': uuid()
        },
        data : data
    };

    return axios(config)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
        console.log(error);
        });
};

export const createRefund = async (req, res) => {

    const payment_request_id = req.params.transaction_id

    const access_token = generateAccesstoken();

    access_token.then(function(token) {

        const transactionToRefund = listTransactions(token, payment_request_id)
        transactionToRefund.then(function(transaction_id){

            console.log(transaction_id)
            const refund = refundRequest(token, transaction_id)
            refund.then(function(response){     
                    res.status(200).json({
                    response
                    });
            })
        })
    })
};


