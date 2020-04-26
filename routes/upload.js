var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

// default options
app.use(fileUpload());

// Modelos

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipo de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no válida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: falso,
            message: 'No seleciono nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // obtener nombre de archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // extensiones válidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    //Mover archivo Path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: ' Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);


    });

});

function subirPorTipo(tipo, id, nombreArchivo, res, path) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                fs.unlinkSync(`./uploads/${tipo}/${nombreArchivo}`);
                return res.status(400).json({
                    ok: false,
                    message: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            //Elimina la imagen si ya existe 
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                if (err) {
                    return res.status(200).json({
                        ok: false,
                        message: 'error al actualizar imagen de usuario',
                    });

                }
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de usuario actualizado',
                    usuario: usuarioActualizado
                });
            });

        });
    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                fs.unlinkSync(`./uploads/${tipo}/${nombreArchivo}`);
                return res.status(400).json({
                    ok: false,
                    message: 'Medico no existe',
                    errors: { message: 'Medico no existe' }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            //Elimina la imagen si ya existe 
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(200).json({
                        ok: false,
                        message: 'error al actualizar imagen de médico',
                    });

                }
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de médico actualizado',
                    medico: medicoActualizado
                });
            });

        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                fs.unlinkSync(`./uploads/${tipo}/${nombreArchivo}`);
                return res.status(400).json({
                    ok: false,
                    message: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            //Elimina la imagen si ya existe 
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(200).json({
                        ok: false,
                        message: 'error al actualizar imagen de hospital',
                    });

                }
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de hospital actualizado',
                    hospital: hospitalActualizado
                });
            });

        });
    }
}

module.exports = app;