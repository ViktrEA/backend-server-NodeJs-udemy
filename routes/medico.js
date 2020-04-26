var express = require('express');

var app = express();

var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
var mdAutenticacion = require('../middlewares/autenticacion');


// ====================================
// Listado de Medico
// ====================================

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error cargando medico ',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    total: conteo,
                    medico: medicos
                });
            });

        });
});


// ====================================
// Actualizar medico
// ====================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar medico'
            });
        }
        if (!medico) {
            return req.status(400).json({
                ok: false,
                message: 'El medico con' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado,
                // usuarioToken: req.usuario
            });
        });

    });
});

// ====================================
// Agregar medico
// ====================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al agregar medico',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoGuardado,
            // usuarioToken: req.usuario
        });
    });

});

// ====================================
// Eliminar medico
// ====================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            message: 'Medico borrado con éxito',
            // usuarioToken: req.usuario
        });
    });

});

module.exports = app;