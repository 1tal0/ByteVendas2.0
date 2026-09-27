const express = require("express")
const itemVenda = express()
const itemVendaController = require("../controllers/itemVendaController.js")

const autenticarUsuario = require("../middlewares/autenticarUsuario.js")
const autorizarTipoUsuario = require("../middlewares/autorizarTipoUsuario.js")

itemVenda.post(
    "/api/itemVenda/cadastrar",
    autenticarUsuario,
    autorizarTipoUsuario(["Vendedor"]),
    itemVendaController.cadastrar
)

itemVenda.delete(
    "/api/itemVenda/excluir/:id",
    autenticarUsuario,
    autorizarTipoUsuario(["Vendedor"]),
    itemVendaController.excluir
)

itemVenda.get(
    "/api/itemVenda/listar/:id_venda",
    autenticarUsuario,
    autorizarTipoUsuario(["Vendedor"]),
    itemVendaController.listar
)

module.exports = itemVenda