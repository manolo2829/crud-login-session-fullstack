const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conexion = require('../database/db.js')
// LE INDICAMOS A NODE QUE VAMOS A UTILIZAR PROMESAS
const {promisify} = require('util')

// procedimiento para registrarnos
exports.register = async(req, res) => {
    try{
        const name = req.body.name
        const user = req.body.user
        const pass = req.body.pass
        if(!name || !user || !pass){
            res.render('register', {
                alert:true,
                alertTitle: 'Advertencia',
                alertMessage: 'Complete los campos antes de enviar el formulario',
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'register'
            })
        }else{
            conexion.query('SELECT * FROM users WHERE user = ?', [user], async(error, results) => {
                if(results.length !== 0){
                    res.render('register', {
                        alert:true,
                        alertTitle: 'Ese nombre de usuario ya existe',
                        alertMessage: 'Pruebe uno nuevo',
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: '/register'
                    })
                    console.log(error)
                    console.log('ese usuario ya existe')
                }else{
                     // encriptamos la contraseña con el metodo hash
                    let passHash = await bcryptjs.hash(pass, 8)
                    // console.log(passHash)
                    conexion.query('INSERT INTO users SET ?', {user: user, name: name, pass:passHash}, (error, results) => {
                        if(error){console.log(error)}
                        res.redirect('/')
                    })
                }
            })            
           

        }
        
    }catch (error) {
        console.log(error)
    }
}

// procedimineto para login
exports.login = async(req, res) => {
    try {
        const user = req.body.user
        const pass = req.body.pass
        // console.log(user+' - '+pass)

        if(!user || !pass){
            res.render('login', {
                alert:true,
                alertTitle: 'Advertencia',
                alertMessage: 'Ingrese un usuario y password',
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            })
        }else{
            conexion.query('SELECT * FROM users WHERE user = ?', [user], async(error, results) => {
                if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                    res.render('login', {
                        alert:true,
                        alertTitle: 'Error',
                        alertMessage: 'Usuario y/o Password incorrectas',
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: '/login'
                    })
                    console.log(error)
                }else{
                    // incio de sision ok
                    const id = results[0].id
                    
                    // le pasamos la clave secreta
                    const token = jwt.sign({id:id}, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA
                    })

                    console.log('TOKEN: '+ token + ' para el usuario: '+user)

                    const cookiesOptions = {
                        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000 ),
                        httpOnly: true
                    }
                    res.cookie('jwt', token, cookiesOptions)
                    res.render('login', {
                        alert:true,
                        alertTitle: 'Conexion exitosa',
                        alertMessage: '¡LOGIN CORRECTO!',
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 800,
                        ruta: '/'
                    })
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}

// methodo para verificar si el usuario esta authenticado
exports.isAuthenticated = async(req, res, next) => {
    // condicional que pregunta si esta nuestra cookie llamada jwt
    if (req.cookies.jwt) {
        try {
            // dcodificamos la cookie
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
            conexion.query('SELECT * FROM users WHERE id = ?', [decodificada.id], (error, results)=> {
                // lo que estamos haciendo en este condicional es que en el caso de que los resultados no tengan ningun valor
                if(!results){return next()}
                req.user = results[0]
                // next pasa a ejecutar el siguiente midlewear
                return next()
            })
        } catch (error) {
            console.log(error)
            return next()
        }
    }else{
        res.redirect('/login')

    }
}

// procedimiento de cerrar sesion

exports.logout = (req, res) => {
    res.clearCookie('jwt')
    return res.redirect('/')
}