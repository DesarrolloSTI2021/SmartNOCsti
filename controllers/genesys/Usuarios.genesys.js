const platformClient = require('purecloud-platform-client-v2');

const userapi= new platformClient.UsersApi();

const { AutenticacionGenesys}=require('../genesys/Autenticacion.genesys');

let listausuarios=[];
let listExpands=['presence','routingStatus'];

const ObtenerUsuarios=async(pagenumber)=>{

   
    let templista=[];
    let token=await AutenticacionGenesys();
    return new Promise((resolve, reject)=>{
        userapi.getUsers({'pageSize':100,'pageNumber':pagenumber,'state':'active',
        'expand':listExpands})
        .then(data=>{  
            if(data.entities.length>0){
                templista=data.entities
                resolve(templista)
            }else{
                reject(templista);
            }
        })
       
    })

};

const ObtenerUsuariosConectados=async()=>{
    let page=0;
    let contador=0;
    do {
        page++;
       await ObtenerUsuarios(page)
        .then((data)=>{

            data.forEach(element => {

                const{
                    id,name,email,
                    routingStatus:{
                    status,startTime
                },
                presence:{
                    presenceDefinition:{
                        systemPresence
                    }
                }
                ,acdAutoAnswer}=element;

                let datosusuario={
                    id,
                    name,
                    email,
                    status,
                    startTime,
                    systemPresence,
                    acdAutoAnswer
                };
                listausuarios.push(datosusuario);

                
            });
            contador=data.length;
        })
        .catch(error=>{

            contador=error.length;
            return listausuarios; 
        })
    } while (contador>0);

    listausuarios=listausuarios.filter((e)=>e.systemPresence!="Offline");

    return listausuarios; 
};


module.exports={

    ObtenerUsuarios,
    ObtenerUsuariosConectados
};