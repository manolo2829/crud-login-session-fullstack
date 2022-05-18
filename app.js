const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

const app = express()

// SETEAMOS EL MOTOR DE PLANTILLAS
app.set('view engine', 'ejs')

// SETEAMOS LA CARPETA PUBLIC PARA ARCHIVOS ESTATICOS
app.use(express.static('public'))

// PARA PROCESAR DATOS ENVIADOS DESDE FORMS
app.use(express.urlencoded({extended:true}))
app.use(express.json())

// SETEAMOS LAS VARIABLES DE ENTORNO
dotenv.config({path: './env/.env'})

// PARA PODER TRABAJAR CON LOS COOKIES
app.use(cookieParser())

// llamar al router
app.use('/', require('./routes/router.js'))

// para eliminar el cache y que no s epueda volver con el boton back luego de que hacemos el logout
app.use(function(req, res, next){
    if(!req.user){
        res.header('Cache-Control', 'private, no-cache, no store, must-revalidate');
    }
    next()
})

app.listen(3000, () => {
    console.log('SERVER UP running in http://localhost:3000')
})