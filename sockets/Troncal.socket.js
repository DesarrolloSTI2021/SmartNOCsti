
const WebSocketClient = require('websocket').client;
const websocketClient = new WebSocketClient();
// API instances
const platformClient = require('purecloud-platform-client-v2');
const notificationsApi = new platformClient.NotificationsApi();

let arraytopics = [];
let listatroncales = [];

const {ObtenerMetricasTroncales}=require('../controllers/genesys/Troncal.genesys');
const {AutenticacionGenesys}=require('../controllers/genesys/Autenticacion.genesys');

const socketcontroler = async (socket) => {
    if (listatroncales.length > 0) { listatroncales = []; }

    console.log('Cliente conectado y escuchando: Troncales');
    socket.on('disconnect', () => {
        console.log('Cliente desconectado: Troncales.......');
    });

    NotificacionTroncales()
    .then(data=>conectarwebsocket(socket))
    .catch(err=>console.log(err))
    
};


const conectarwebsocket=(socket)=>{

    websocketClient.on('connect', connection => {
        connection.on('message', message => {

            let data = JSON.parse(message.utf8Data);
            let topic = data.topicName;
            let eventBody = data.eventBody;
            let arrtopicname = topic.split('.');
            const [, objectopic] = arrtopicname;

            let foundtpic = arraytopics.find((e) => e.id === topic);
            if (foundtpic) {
                const { calls: {
                    inboundCallCount,
                    outboundCallCount
                } } = eventBody;
                let encuentratroncal = listatroncales.find((e) => e.subscriptionTopic === foundtpic.id);

                if (encuentratroncal) {
                    encuentratroncal.entrantes = inboundCallCount;
                    encuentratroncal.salientes = outboundCallCount;
                }

            }
           console.log(listatroncales.length);
            socket.emit('edge-metrica', listatroncales);
            // For heartbeats
            if (topic == 'channel.metadata') {
                console.log(eventBody.message);
            }
        });
    });
};

const NotificacionTroncales=async()=>{

    let resultado = await ObtenerMetricasTroncales();
    const{result:troncales}=resultado;
    troncales.forEach(troncal => {

        let ObjectId = troncal.id;
        let subscriptionTopic = `v2.telephony.providers.edges.trunks.${ObjectId}.metrics`;
        let entrantes = 0;
        let salientes = 0;
        let datostroncal = { ...troncal, subscriptionTopic, entrantes, salientes };
        //Listado de objtetos troncal
        listatroncales.push(datostroncal);
        arraytopics.push({ id: subscriptionTopic });
    });

    AutenticacionGenesys()
        .then(data => notificationsApi.postNotificationsChannels())
        .then(data => {
            let websocketUri = data.connectUri;
            let channelId = data.id;
            websocketClient.connect(websocketUri);
            return notificationsApi.postNotificationsChannelSubscriptions(channelId, arraytopics);
        })
        .then(data => {
            console.log('Subscribed to trunks');
        })
        .catch(e => console.error(e));

};

module.exports={

    socketcontroler
}
