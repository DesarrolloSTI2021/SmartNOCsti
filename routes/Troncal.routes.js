const { Router } = require('express');
const router = Router();

const{
    ObtenerMetricasTroncales
}=require('../controllers/genesys/Troncal.genesys');


router.get('/metricas',ObtenerMetricasTroncales);

module.exports = router;
