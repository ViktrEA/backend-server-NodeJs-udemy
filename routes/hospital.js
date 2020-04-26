var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var mdAutenticacion = require('../middlewares/autenticacion');



// ====================================
// Listado de Hospital
// ====================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospital',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    total: conteo,
                    hospital: hospital
                });
            });



        });

});

// ====================================
// Actualizar Hospital
// ====================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id: ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado,
                // usuariotoken: req.usuario,
            });
        });

    });

});



// ====================================
// Crear nuevo Hospital
// ====================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });


    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al agregar un hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            // usuarioToken: req.usuario
        });
    });

});

// ====================================
// Eliminar Hospital por id
// ====================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
            message: 'Hospital borrado con éxito',
            // usuariotoken: req.usuario
        });
    });
});

module.exports = app;