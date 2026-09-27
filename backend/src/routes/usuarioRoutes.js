const express = require("express")
const usuario = express()
const usuarioController = require("../controllers/usuarioController.js")

const autenticarUsuario = require("../middlewares/autenticarUsuario.js")
const autorizarTipoUsuario = require("../middlewares/autorizarTipoUsuario.js")

usuario.post(
    "/api/usuario/logar",
    usuarioController.logar
)

usuario.post(
    "/api/usuario/cadastrar",
    autenticarUsuario,
    autorizarTipoUsuario(["Gerente"]),
    usuarioController.cadastrar
)

usuario.patch(
    "/api/usuario/atualizar/:id",
    autenticarUsuario,
    autorizarTipoUsuario(["Gerente"]),
    usuarioController.atualizar
)

usuario.delete(
    "/api/usuario/excluir/:id",
    autenticarUsuario,
    autorizarTipoUsuario(["Gerente"]),
    usuarioController.excluir
)

usuario.get(
    "/api/usuario/listar",
    autenticarUsuario,
    autorizarTipoUsuario(["Gerente"]),
    usuarioController.listar
)

usuario.get(
    "/api/usuario/listar/:id",
    autenticarUsuario,
    autorizarTipoUsuario(["Gerente"]),
    usuarioController.usuarioEspecifico
)

module.exports = usuario