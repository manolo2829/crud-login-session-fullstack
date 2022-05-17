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
// app.use(cookieParser)

// llamar al router
app.use('/', require('./routes/router.js'))

app.listen(3000, () => {
    console.log('SERVER UP running in http://localhost:3000')
})