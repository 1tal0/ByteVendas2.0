require("dotenv").config();
const express = require("express")
const app = express()
const cors = require("cors")

const usuarioRoutes = require("./src/routes/usuarioRoutes.js")
const clienteRoutes = require("./src/routes/clienteRoute.js")
const produtoRoutes = require("./src/routes/produtoRoutes.js")
const vendaRoutes = require("./src/routes/vendaRoute.js")
const itemVendaRoutes = require("./src/routes/itemVendaRoute.js")

const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({extend: false}))
app.use(bodyParser.json())
app.use(cors())

app.use(usuarioRoutes)
app.use(clienteRoutes)
app.use(produtoRoutes)
app.use(vendaRoutes)
app.use(itemVendaRoutes)

const porta = process.env.PORT_SERVER || 8080

const iniciarServidor = () => {
    try {
        app.listen(porta, () => {
            console.log(`Servidor ativo! Porta: ${porta}.`)
        })
    } catch (error) {
        console.error("Erro ao iniciar o servidor:", error)
    }
}

iniciarServidor()