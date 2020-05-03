var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');


var GoogleAuth = require('google-auth-library');

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;

// ==========================================
//  Autenticación De Google
// ==========================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
    });
    const playload = ticket.getPlayload();

    return {
        nombre: playload.name,
        email: playload.email,
        img: playload.picture,
        google: true
    };
}

app.post('/google', async(req, res) => {
    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(() => {
            return;
        });

    if (googleUser === undefined) {
        return res.status(403).json({
            ok: false,
            mensaje: 'Token no válido'
        });
    } else {
        Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuarios',
                    errors: err
                });
            }
            if (usuarioDB) {
                if (usuarioDB.google === false) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Debe usar su autenticación estándar',
                    });
                } else {
                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
                    return res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token,
                        id: usuarioDB.id
                    });
                }
            } else {
                // El usuario no existe, hay que crearlo
                var usuario = new Usuario({
                    nombre: googleUser.nombre,
                    email: googleUser.email,
                    img: googleUser.img,
                    google: true,
                    password: ':)'
                });
                usuario.save((err, usuarioDB) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al guardar usuario',
                            errors: err
                        });
                    }
                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
                    return res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token,
                        id: usuarioDB.id
                    });
                });
            }
        });
    }
});

// =========================================================================
// Autenticación Normal
// =========================================================================


app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuario) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // crear token!!!
        usuario.password = ':)';
        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuario,
            token: token,
            id: usuario._id
        });
    });


});

module.exports = app;