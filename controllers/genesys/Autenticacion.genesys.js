const platformClient = require('purecloud-platform-client-v2');
const client = platformClient.ApiClient.instance;
// Create API instance
var authorizationApi = new platformClient.AuthorizationApi();

// Authenticate
const clientID=process.env.GENESYS_CLOUD_CLIENT_ID;
const secretCLIENTE=process.env.GENESYS_CLOUD_CLIENT_SECRET;



const AutenticacionGenesys=()=>{
   
    return new Promise((resolve,reject)=>{

        client.loginClientCredentialsGrant(clientID, secretCLIENTE)
        .then(data=>{

            const{accessToken:Token,tokenExpiryTime:Expire}=data;
            resolve({
                msg:process.env.RES,
                result:{
                    Token,
                    Expire
                }
            })
        })
        .catch(err=>{
            reject({
                msg:err,
                result:{}
              
            })
        })

    });
    
 
};

module.exports={
        AutenticacionGenesys
}