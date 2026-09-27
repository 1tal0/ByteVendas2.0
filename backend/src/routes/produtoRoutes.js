const express = require("express")
const produto = express()
const produtoController = require("../controllers/produtoController.js")

const autenticarUsuario = require("../middlewares/autenticarUsuario.js")
const autorizarTipoUsuario = require("../middlewares/autorizarTipoUsuario.js")

produto.post(
    "/api/produto/cadastrar",
    autenticarUsuario,
    autorizarTipoUsuario(["Gerente"]),
    produtoController.cadastrar
)

produto.patch(
    "/api/produto/atualizar/:id",
    autenticarUsuario,
    autorizarTipoUsuario(["Gerente"]),
    produtoController.atualizar
)

produto.delete(
    "/api/produto/excluir/:id",
    autenticarUsuario,
    autorizarTipoUsuario(["Gerente"]),
    produtoController.excluir
)

produto.get(
    "/api/produto/listar",
    autenticarUsuario,
    autorizarTipoUsuario(["Gerente", "Vendedor"]),
    produtoController.listar
)

produto.get(
    "/api/produto/listar/:id",
    autenticarUsuario,
    autorizarTipoUsuario(["Gerente", "Vendedor"]),
    produtoController.produtoEspecifico
)

module.exports = produto