const db = require("../db/db.js")

const cadastrar = (req, res) => {
    const { nome, cpf, endereco, email, telefone } = req.body

    let mysql = "INSERT INTO clientes (nome, cpf, endereco, email, telefone) VALUES (?, ?, ?, ?, ?)"

    db.query(
        mysql,
        [nome, cpf, endereco, email, telefone],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao cadastrar cliente.", detalhes: err})
            } else {
                return res.status(201).json({message: "Cliente cadastrado com sucesso.", detalhes: result})
            }
        }
    )
}

const atualizar = (req, res) => {
    const { nome, cpf, endereco, email, telefone } = req.body
    const { id } = req.params

    let mysql = "UPDATE clientes SET nome=?, cpf=?, endereco=?, email=?, telefone=? WHERE id=?"

    db.query(
        mysql,
        [nome, cpf, endereco, email, telefone, id],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao atualizar cliente.", detalhes: err})
            } else {
                return res.status(200).json({message: "Cliente atualizado com sucesso.", detalhes: result})
            }
        }
    )
}

const excluir = (req, res) => {
    const { id } = req.params

    let mysql = "DELETE FROM clientes WHERE  id=?"

    db.query(
        mysql,
        [id],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao excluir cliente.", detalhes: err})
            } else {
                return res.status(200).json({message: "Cliente excluído com sucesso.", detalhes: result})
            }
        }
    )
}

const listar = (req, res) => {

    let mysql = "SELECT id, nome, cpf, endereco, email, telefone FROM clientes"

    db.query(
        mysql,
        [],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao listar clientes.", detalhes: err})
            } else {
                return res.status(200).json(result)
            }
        }
    )
}

const clienteEspecifico = (req, res) => {
    const { id } = req.params

    let mysql = "SELECT id, nome, cpf, endereco, email, telefone FROM clientes WHERE id=?"

    db.query(
        mysql,
        [id],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao buscar cliente específico.", detalhes: err})
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
    clienteEspecifico
}