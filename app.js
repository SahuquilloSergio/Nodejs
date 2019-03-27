// imports
const express = require('express');
const app = express();
const bodyParser = require('body-parser');


// inicializamos la conexion con firebase
// necesitamos json con las credenciales 

var admin = require("firebase-admin");

var serviceAccount = require("./clavefirebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mensajefirebase-9b1c3.firebaseio.com"
});

//Referencia a la base de datos
var db = admin.database();
var ref = db.ref("/juego");
var resultado = null
//Mostramos la base en la que estamos
ref.on("value", function(snapshot) {
    console.log("dentro de la funcion:" + snapshot.val().dispositivos);
    resultado = (snapshot.val() && snapshot.val().dispositivos) || 'Anonymous';

}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});

//especificamos el subdirectorio donde se encuentran las páginas estáticas
app.use(express.static(__dirname + '/html'));

//extended: false significa que parsea solo string (no archivos de imagenes por ejemplo)
app.use(bodyParser.urlencoded({ extended: false }));

//Pedimos los datos del dispositivo y del mensaje a enviar
app.post('/enviar', (req, res) => {
    let token = req.body.token;
    let titulo = req.body.titulo;
    let msg = req.body.msg;
    let pagina = '<!doctype html><html><head></head><body>';
    pagina += `<p>(${token}/${msg}) Enviado </p>`;
    pagina += '</body></html>';
    res.send(pagina);
    
    //TOKEN DEL DISPOSITIVO
    
    var registrationToken = token;

// Objeto mensaje que vamos a enviar
    var message = {
        data: {
            msg: msg,
            titulo: titulo
        },
    token: registrationToken,
    notification:{
        title:titulo,
        body:msg
    }
    };

//Enviamos el mensaje al dispositivo con el token especificado
    admin.messaging().send(message)
     .then((response) => {
    //Mostramos por consola una notificacion el mensaje fue enviado correctamente, o si gubo algun fallo
        console.log('Successfully sent message:', response);
    })
    .catch((error) => {
        console.log('Error sending message:', error);
    });
    });


app.get('/mostrar', (req, res) => {
    let pagina = '<!doctype html><html><head></head><body>';
    pagina += 'Muestro<br>';
    pagina += '<div id="resultado">' + resultado + '</div>'
    pagina += '<p>...</p>';
    pagina += '</body></html>';
    res.send(pagina);
});

//Puerto en el queda esperando peticiones nuestro servidor
var server = app.listen(8080, () => {
    console.log('Servidor web iniciado');
});


