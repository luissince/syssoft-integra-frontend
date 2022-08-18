const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');
const notaCredito = require('../services/NotaCredito');
const sede = require('../services/Sede');
const RepNotaCredito = require('../report/RepNotaCredito');
const { decrypt } = require('../tools/CryptoJS');
const { sendSuccess, sendClient, sendError } = require('../tools/Message');
const { isEmail } = require('../tools/Tools');

const repNotaCredito = new RepNotaCredito();

router.get('/list', async function (req, res) {
    return notaCredito.list(req, res);
});

router.get('/id', async function (req, res) {
    return notaCredito.id(req, res);
});

router.post('/add', async function (req, res) {
    return notaCredito.add(req, res);
});

router.get('/email', async function (req, res) {
    try {
        const sedeInfo = await sede.infoSedeReporte(req)

        if (typeof sedeInfo !== 'object') {
            return sendError(res, sedeInfo);
        }

        const detalle = await notaCredito.idReport(req)

        if (typeof detalle === 'object') {

            let pdf = await repNotaCredito.repComprobante(req, sedeInfo, detalle);

            if (typeof pdf === 'string') {
                return sendError(res, pdf);
            } else {

                const xml = await notaCredito.xmlGenerate(req);

                if (typeof xml === 'string') {
                    return sendError(res, xml);
                } else {
                    if (!isEmail(sedeInfo.usuarioEmail) &&  sedeInfo.claveEmail == "") {
                        return sendClient(res,"Las credenciales del correo para el envío no pueden ser vacios.");
                    } else {
                        if (!isEmail(detalle.cabecera.email)) {
                            return sendClient(res, "El correo del cliente no es valido.")
                        } else {
                            // create reusable transporter object using the default SMTP transport
                            let transporter = nodemailer.createTransport(smtpTransport({
                                // host: "smtp-mail.outlook.com.",
                                // port: 587,
                                service: 'gmail',
                                auth: {
                                    user: sedeInfo.usuarioEmail, // generated ethereal user
                                    pass: sedeInfo.claveEmail, // generated ethereal password
                                }
                            }));
                            // send mail with defined transport object
                            // Message object
                            let message = {
                                from: `"${sedeInfo.nombreEmpresa} 👻" ${sedeInfo.usuarioEmail}`,

                                // Comma separated list of recipients
                                to: detalle.cabecera.email,
                                // bcc: 'andris@ethereal.email',

                                // Subject of the message
                                subject: 'Comprobante Electrónico ✔',

                                // plaintext body
                                text: sedeInfo.ruc,

                                // HTML body
                                html:
                                    `<p>Estimado Cliente <b>${detalle.cabecera.informacion}</b>.</p>
                                    <p>Le envíamos la información de su comprobante electrónico.</p>
                                    <span>Tipo de Documento: <b>${detalle.cabecera.comprobante}</b></span><br/>
                                    <span>Número de Serie: <b>${detalle.cabecera.serie}</b></span><br/>
                                    <span>Número de Documento: <b>${detalle.cabecera.numeracion}</b></span><br/>
                                    <span>N° RUC del Emisor: <b>${sedeInfo.ruc}</b></span><br/>
                                    <span>N° RUC/DNI del Cliente: <b>${detalle.cabecera.documento}</b></span><br/>
                                    <span>Fecha de Emisión: <b>${detalle.cabecera.fecha}</b></span><br/>
                                    <p>Atentamente ,</p>`,

                                // An array of attachments
                                attachments: [
                                    {
                                        filename: `${sedeInfo.nombreEmpresa} ${detalle.cabecera.comprobante} ${detalle.cabecera.serie}-${detalle.cabecera.numeracion}.xml`,
                                        content: xml.xmlGenerado,
                                        contentType: 'text/plain'
                                    },

                                    {
                                        filename: `${sedeInfo.nombreEmpresa} ${detalle.cabecera.comprobante} ${detalle.cabecera.serie}-${detalle.cabecera.numeracion}.pdf`,
                                        content: pdf,
                                        contentType: 'application/pdf'
                                    },
                                ]
                            };

                            await transporter.sendMail(message);
                            return sendSuccess(res, "Se envío correctamente el correo a " + detalle.cabecera.email);
                        }
                    }
                }
            }
        } else {
            return sendError(res, detalle);
        }
    } catch (error) {
        console.log(error);
        return sendError(res, "Se produjo un error de servidor, intente nuevamente.");
    }
});

router.get('/repcomprobante', async function (req, res) {
    const decryptedData = decrypt(req.query.params, 'key-report-inmobiliaria');
    req.query.idSede = decryptedData.idSede;
    req.query.idNotaCredito = decryptedData.idNotaCredito;

    const sedeInfo = await sede.infoSedeReporte(req);

    if (typeof sedeInfo !== 'object') {
        return sendError(res, sedeInfo);
    }

    const detalle = await notaCredito.idReport(req);
    if (typeof detalle === 'object') {

        let data = await repNotaCredito.repComprobante(req, sedeInfo, detalle);

        if (typeof data === 'string') {
            return sendError(res, data);
        } else {
            res.setHeader('Content-disposition', `inline; filename=${detalle.cabecera.comprobante + " " + detalle.cabecera.serie + "-" + detalle.cabecera.numeracion}.pdf`);
            res.contentType("application/pdf");
            res.send(data);
        }
    } else {
        return sendError(res, detalle);
    }
});

router.get('/xmlsunat', async function (req, res) {
    const decryptedData = decrypt(req.query.params, 'key-report-inmobiliaria');
    req.query.idSede = decryptedData.idSede;
    req.query.idNotaCredito = decryptedData.idNotaCredito;
    req.query.xmlSunat = decryptedData.xmlSunat;

    const sedeInfo = await sede.infoSedeReporte(req);

    if (typeof sedeInfo !== 'object') {
        return sendError(res, sedeInfo);
    }

    const detalle = await notaCredito.xmlGenerate(req);

    if (typeof detalle === 'object') {
        const object = {
            "name": `${sedeInfo.nombreEmpresa} ${detalle.comprobante} ${detalle.serie}-${detalle.numeracion}.xml`,
            "data": detalle.xmlGenerado
        };
        const buffXmlSunat = Buffer.from(JSON.stringify(object), "utf-8");
        res.end(buffXmlSunat);
    } else {
        return sendError(res, detalle);
    }
});

module.exports = router;