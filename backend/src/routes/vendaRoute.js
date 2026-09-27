const express = require("express")
const venda = express()
const vendaController = require("../controllers/vendaController.js")

const autenticarUsuario = require("../middlewares/autenticarUsuario.js")
const autorizarTipoUsuario = require("../middlewares/autorizarTipoUsuario.js")

venda.post(
    "/api/venda/cadastrar",
    autenticarUsuario,
    autorizarTipoUsuario(["Vendedor"]),
    vendaController.cadastrar
)

venda.patch(
    "/api/venda/atualizar/:id",
    autenticarUsuario,
    autorizarTipoUsuario(["Vendedor"]),
    vendaController.atualizar
)

venda.get(
    "/api/venda/listar/:id_usuario",
    autenticarUsuario,
    autorizarTipoUsuario(["Vendedor"]),
    vendaController.listar
)

venda.get(
    "/api/venda/listar/:id_usuario/:id_venda",
    autenticarUsuario,
    autorizarTipoUsuario(["Vendedor"]),
    vendaController.vendaEspecifica
)

module.exports = venda