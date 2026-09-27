const express = require("express")
const cliente = express()
const clienteController = require("../controllers/clienteController.js")

const autenticarUsuario = require("../middlewares/autenticarUsuario.js")
const autorizarTipoUsuario = require("../middlewares/autorizarTipoUsuario.js")

cliente.post(
    "/api/cliente/cadastrar",
    autenticarUsuario,
    autorizarTipoUsuario(["Gerente", "Vendedor"]),
    clienteController.cadastrar
)

cliente.patch(
    "/api/cliente/atualizar/:id",
    autenticarUsuario,
    autorizarTipoUsuario(["Gerente", "Vendedor"]),
    clienteController.atualizar
)

cliente.delete(
    "/api/cliente/excluir/:id",
    autenticarUsuario,
    autorizarTipoUsuario(["Gerente"]),
    clienteController.excluir
)

cliente.get(
    "/api/cliente/listar",
    autenticarUsuario,
    autorizarTipoUsuario(["Gerente", "Vendedor"]),
    clienteController.listar
)

cliente.get(
    "/api/cliente/listar/:id",
    autenticarUsuario,
    autorizarTipoUsuario(["Gerente", "Vendedor"]),
    clienteController.clienteEspecifico
)

module.exports = cliente