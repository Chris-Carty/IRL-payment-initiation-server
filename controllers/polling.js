import axios from 'axios';
import qs from 'qs';

// Config
const CLIENT_ID = process.env.TINK_CLIENT_ID;
const CLIENT_SECRET = process.env.TINK_CLIENT_SECRET;


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

export const getTransfer = async (access_token, transaction_id) => {

    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.tink.com/api/v1/payments/requests/${transaction_id}/transfers`,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    };

    return axios(config)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            console.log("payment-status-error")
        console.log(error);
        });

}; 

export const getPaymentStatus = async (req, res) => {

    const transaction_id = req.params.transaction_id

    const access_token = generateAccesstoken();

    access_token.then(function(jwt_bearer) {

        const status = getTransfer(jwt_bearer, transaction_id)
        status.then(function(status_object){
            console.log(status_object)
            res.status(200).json({
                  status_object
                });
        })
    })
};


