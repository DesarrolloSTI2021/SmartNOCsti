const { Router } = require('express');
const router = Router();

const{
    Inicio
}=require('../controllers/Inicio.controller');


router.get('/',Inicio);

module.exports = router;
