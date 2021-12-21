const { request, response } = require('express');
const { ObtenerMetricasTroncales} = require('./genesys/Troncal.genesys');



const Inicio=async(req=request,res=response)=>{

    res.render('Home');
};


module.exports={
    Inicio
}