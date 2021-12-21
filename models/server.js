const express = require('express');
const  cors = require('cors');
const fileUpload = require('express-fileupload');
const hbs=require('hbs');
const path = require('path');
require('dotenv').config();

const { socketcontroler } = require('../sockets/Troncal.socket');
const { socketcontrolerusuarios } = require('../sockets/Usuario.socket');

require('dotenv').config();


class Server {

    constructor() {

        this.app    = express();
        this.port   =process.env.PORT;
        this.server = require('http').createServer(this.app);
        this.io     =require('socket.io')(this.server);


        
        hbs.registerPartials(path.join(__dirname, '../', '/views/partials'));
        //motor de plantillas Handlebars
        this.app.set('view engine', 'hbs');

        //paths
        this.paths={
            
            smartnoc:'/nocSTI',
            troncal:'/api/troncal'
        }

        //middlewares
        this.middlewares();

        //rutas
        this.routes();


        this.sockets();

    }

    //middlewares
    middlewares(){

        this.app.use(cors());

        this.app.use(express.json());

        //Servir contenido estático
        this.app.use(express.static('public'));



        this.app.use(fileUpload({
            useTempFiles:true,
            tempFileDic:'/tmp/'
        }));


        
    }
    //funciones
    routes() {
     
        this.app.use(this.paths.smartnoc,require('../routes/Inicio.routes'));
        this.app.use(this.paths.troncal,require('../routes/Troncal.routes'));

    }

    sockets(){
        
        this.io.on('connection',socketcontrolerusuarios);
        this.io.on('connection',socketcontroler);

          
      }
   
    listen() {
        this.server.listen(this.port, () => {
            console.log(`REST Socket server escuchando en el puerto:${this.port}`)
        })
    }
}



module.exports = Server;