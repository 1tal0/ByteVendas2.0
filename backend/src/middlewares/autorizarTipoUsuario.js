const db = require("../db/db.js")
const jwt = require("jsonwebtoken")

const autorizarTipoUsuario = (tiposPermitidos) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization // Pega o cabeçalho de autorização

            if(authHeader == null || !authHeader.startsWith("Bearer "))
                return res.status(401).send("Token de autenticação ausente ou inválido.")

            const token = authHeader.split(" ")[1] // Extrai o token após "Bearer "

            const decoded = jwt.verify(token, process.env.JWT_SECRET) // Verifica o token

            let usuario = null
            db.query(
                "SELECT * FROM usuarios WHERE id = ?",
                [decoded.id],
                (err, result) => {
                    if(err) {
                        return res.status(500).send("Erro ao buscar usuário.")
                    }
                    usuario = result[0]
                    if(usuario == null) {
                        return res.status(401).send("Usuário não encontrado.")
                    }

                    if(!tiposPermitidos.includes(usuario.tipo)) {
                        return res.status(403).send("Acesso negado. Tipo de usuário não autorizado.")
                    }

                    req.usuario = usuario // Adiciona o usuário autenticado ao objeto de requisição

                    next() // Continua para o próximo middleware ou rota
                }
            )
        } catch(error) {
            return res.status(500).send("Erro na autorização do usuário."+error)
        }
    }
}

module.exports = autorizarTipoUsuario