const db = require("../db/db.js")
const jwt = require("jsonwebtoken")

const logar = (req, res) => {
    try {
        const { nome_usuario, senha } = req.body

        const mysql = "SELECT * FROM usuarios WHERE BINARY nome_usuario = ? AND BINARY senha = ?"

        db.query(
            mysql,
            [nome_usuario, senha],
            (err, result) => {
                // 1. Trata erro na consulta SQL
                if (err) {
                    console.log(err)
                    return res.status(500).send("Erro interno no banco de dados.")
                }

                // 2. Verifica se encontrou algum usuário
                if (!result || result.length === 0) {
                    return res.status(401).send("Usuário ou senha inválidos.")
                }

                const usuario = result[0]

                // 3. Gera o token com as informações do usuário encontrado
                const token = jwt.sign(
                    { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN }
                )

                // 4. Retorna a resposta com sucesso
                return res.status(200).json({
                    token: token,
                    idUsuario: usuario.id,
                    nome: usuario.nome,
                    tipo: usuario.tipo,
                    email: usuario.email
                })
            }
        )

    } catch (error) {
        return res.status(500).send("Erro ao logar usuário: " + error.message)
    }
}

const cadastrar = (req, res) => {
    const { nome, cpf, endereco, nome_usuario, email, senha, tipo } = req.body

    let mysql = "INSERT INTO usuarios (nome, cpf, endereco, nome_usuario, email, senha, tipo) VALUES (?, ?, ?, ?, ?, ?, ?)"

    db.query(
        mysql,
        [nome, cpf, endereco, nome_usuario, email, senha, tipo],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao cadastrar usuário.", detalhes: err})
            } else {
                return res.status(201).json({message: "Usuário cadastrado com sucesso.", detalhes: result})
            }
        }
    )
}

const atualizar = (req, res) => {
    const { nome, cpf, endereco, nome_usuario, email, senha, tipo } = req.body
    const { id } = req.params

    let mysql = "UPDATE usuarios SET nome=?, cpf=?, endereco=?, nome_usuario=?, email=?, senha=?, tipo=? WHERE id=?"

    db.query(
        mysql,
        [nome, cpf, endereco, nome_usuario, email, senha, tipo, id],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao atualizar usuário.", detalhes: err})
            } else {
                return res.status(200).json({message: "Usuário atualizado com sucesso.", detalhes: result})
            }
        }
    )
}

const excluir = (req, res) => {
    const { id } = req.params

    let mysql = "DELETE FROM usuarios WHERE  id=?"

    db.query(
        mysql,
        [id],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao excluir usuário.", detalhes: err})
            } else {
                return res.status(200).json({message: "Usuário excluído com sucesso.", detalhes: result})
            }
        }
    )
}

const listar = (req, res) => {

    let mysql = "SELECT id, tipo, nome, cpf, endereco, email, nome_usuario, senha FROM usuarios"

    db.query(
        mysql,
        [],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao listar usuários.", detalhes: err})
            } else {
                return res.status(200).json(result)
            }
        }
    )
}

const usuarioEspecifico = (req, res) => {
    const { id } = req.params

    let mysql = "SELECT id, tipo, nome, cpf, endereco, email, nome_usuario, senha FROM usuarios WHERE id=?"

    db.query(
        mysql,
        [id],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao buscar usuário específico.", detalhes: err})
            } else {
                return res.status(200).json(result)
            }
        }
    )
}

module.exports = {
    cadastrar,
    atualizar,
    excluir,
    listar,
    usuarioEspecifico,
    logar
}