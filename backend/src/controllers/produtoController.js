const db = require("../db/db.js")

const cadastrar = (req, res) => {
    const { nome, marca, preco_base, qtd_estoque, tipo, imposto_local, taxa_importacao, pais_origem } = req.body

    let mysql = "INSERT INTO produtos (nome, marca, preco_base, qtd_estoque, tipo, imposto_local, taxa_importacao, pais_origem) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"

    db.query(
        mysql,
        [nome, marca, preco_base, qtd_estoque, tipo, imposto_local, taxa_importacao, pais_origem],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao cadastrar produto.", detalhes: err})
            } else {
                return res.status(201).json({message: "Produto cadastrado com sucesso.", detalhes: result})
            }
        }
    )
}

const atualizar = (req, res) => {
    const { nome, marca, preco_base, qtd_estoque, tipo, imposto_local, taxa_importacao, pais_origem } = req.body
    const { id } = req.params

    let mysql = "UPDATE produtos SET nome=?, marca=?, preco_base=?, qtd_estoque=?, tipo=?, imposto_local=?, taxa_importacao=?, pais_origem=? WHERE id=?"

    db.query(
        mysql,
        [nome, marca, preco_base, qtd_estoque, tipo, imposto_local, taxa_importacao, pais_origem, id],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao atualizar produto.", detalhes: err})
            } else {
                return res.status(200).json({message: "Produto atualizado com sucesso.", detalhes: result})
            }
        }
    )
}

const excluir = (req, res) => {
    const { id } = req.params

    let mysql = "DELETE FROM produtos WHERE id=?"

    db.query(
        mysql,
        [id],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao excluir produto.", detalhes: err})
            } else {
                return res.status(200).json({message: "Produto excluído com sucesso.", detalhes: result})
            }
        }
    )
}

const listar = (req, res) => {
    let mysql = "SELECT id, tipo, nome, marca, preco_base, qtd_estoque, imposto_local, taxa_importacao, pais_origem FROM produtos"

    db.query(
        mysql,
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao listar produtos.", detalhes: err})
            } else {
                return res.status(200).json(result)
            }
        }
    )
}

const produtoEspecifico = (req, res) => {
    const { id } = req.params
    
    let mysql = "SELECT id, tipo, nome, marca, preco_base, qtd_estoque, imposto_local, taxa_importacao, pais_origem FROM produtos WHERE id=?"

    db.query(
        mysql,
        [id],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao buscar produto específico.", detalhes: err})
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
    produtoEspecifico
}