

const socket= io();

socket.on('connect',()=>{
    console.log('Conectado troncal');
});

socket.on('disconnect',()=>{
    console.log('Desconectado troncal');
  
});


socket.on('edge-metrica',(troncales)=>{


    console.log(troncales);
});


socket.on('usuarios-metrica',(usuarios)=>{

    console.log(usuarios);
});