
const mysql = require('mysql')

// hacemos la conexion con las variables de entorno
const conexion = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.BD_PASS,
    database : process.env.DB_DATABASE,
})

conexion.connect( (error) =>{
    if(error){
        console.log('El error de cnexion es: '+error)
        return;
    }
    console.log('¡Conectado a la base de datos MYSQL!')
})

module.exports = conexion