const platformClient = require('purecloud-platform-client-v2');

const trunksapi= new platformClient.TelephonyProvidersEdgeApi();

const { AutenticacionGenesys}=require('../genesys/Autenticacion.genesys');


const ObtenerMetricasTroncales=async()=>{

    let autenticacion=await AutenticacionGenesys();
    let listatroncales=[];
    let datos={pageNumber:1,pageSize:100,trunkType:'EXTERNAL'};
    return new Promise((resolve, reject)=>{

        trunksapi.getTelephonyProvidersEdgesTrunks(datos)
        .then(data=>{
            data.entities.forEach(troncal => {

                const{id,edge:{
                    name
                },trunkBase:{
                    name:trunkbasename
                }}=troncal;

                listatroncales.push({id,name,trunkbasename});
            });

          
            resolve({msg:process.env.RES,result:listatroncales})


        })
        .catch(err=>{

            reject({msg:err,result:{}})
        })
    });

};


module.exports={

  ObtenerMetricasTroncales
}