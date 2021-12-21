
const WebSocketClientuser = require('websocket').client;
const websocketClientuser = new WebSocketClientuser();
// API instances
const platformClient = require('purecloud-platform-client-v2');
const notificationsApi = new platformClient.NotificationsApi();
const {ObtenerUsuariosConectados}=require('../controllers/genesys/Usuarios.genesys');
const {AutenticacionGenesys}=require('../controllers/genesys/Autenticacion.genesys');

let arraytopics = [];
let listausuarios=[];


const socketcontrolerusuarios = async (socketusuarios) => {
    if (listausuarios.length > 0) { listausuarios = []; }

    console.log('Cliente conectado y escuchando: Usuarios');
    socketusuarios.on('disconnect', () => {
        console.log('Cliente desconectado: Usuarios.......');
    });

    NotificacionUsuarios()
    .then(data=>conectarwebsocketusuario(socketusuarios))
    .catch(err=>console.log(err))

};

const conectarwebsocketusuario=(socketuser)=>{

    websocketClientuser.on('connect', connection => {
        connection.on('message', message => {

          
            let data = JSON.parse(message.utf8Data);
            let topic = data.topicName;
            let eventBody = data.eventBody;
            let arrtopicname = topic.split('.');
            const [, objectopic] = arrtopicname;
            // console.log(objectopic);
            let foundtpic = arraytopics.find((e) => e.id === topic);
            if (foundtpic) {
                let encuentrausuariop = listausuarios.find((e) => e.subscriptionTopicpresence === foundtpic.id);
                if (encuentrausuariop) {
                    const { presenceDefinition: {
                        systemPresence
                    }, modifiedDate } = eventBody;
                    encuentrausuariop.systemPresence = systemPresence;
                    encuentrausuariop.startTime = modifiedDate;

                }
                let encuentrausuarior = listausuarios.find((e) => e.subscriptionTopicroutingStatus === foundtpic.id);
                if (encuentrausuarior) {
                    const { routingStatus: {
                        status
                    } } = eventBody;
                    encuentrausuarior.status = status;

                }

            }
            console.log({n:listausuarios.length});
            socketuser.emit('usuarios-metrica', listausuarios);

            // For heartbeats
            if (topic == 'channel.metadata') {
                console.log(eventBody.message);
            }
        });
    });
};
const NotificacionUsuarios=async()=>{

   
    let usuarios = await ObtenerUsuariosConectados();
    console.log(usuarios.length);
    usuarios.forEach(usuario => {

        let ObjectId = usuario.id;
        let subscriptionTopicpresence = `v2.users.${ObjectId}.presence`;
        let subscriptionTopicroutingStatus = `v2.users.${ObjectId}.routingStatus`;

        let datosusuarios = { ...usuario, subscriptionTopicpresence, subscriptionTopicroutingStatus };
        //Listado de objtetos troncal
        listausuarios.push(datosusuarios);

        arraytopics.push({ id: subscriptionTopicpresence });
        arraytopics.push({ id: subscriptionTopicroutingStatus });

    });

    AutenticacionGenesys()
        .then(data => notificationsApi.postNotificationsChannels())
        .then(data => {
            let websocketUri = data.connectUri;
            let channelId = data.id;
            websocketClientuser.connect(websocketUri);
                //console.log(websocketUri);
            return notificationsApi.postNotificationsChannelSubscriptions(channelId, arraytopics);
        })
        .then(data => {
            console.log('Subscribed to users');
        })
        .catch(e => console.error(e));

};


module.exports={
    socketcontrolerusuarios
}