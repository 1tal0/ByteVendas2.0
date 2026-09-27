const db = require("../db/db.js")

const cadastrar = (req, res) => {
    const { id_venda, id_produto, quantidade, preco_unitario_momento, subtotal } = req.body

    let mysql = "INSERT INTO itens_venda (id_venda, id_produto, quantidade, preco_unitario_momento, subtotal) VALUES (?, ?, ?, ?, ?)"

    db.query(
        mysql,
        [id_venda, id_produto, quantidade, preco_unitario_momento, subtotal],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao cadastrar item de venda.", detalhes: err})
            } else {
                return res.status(201).json({message: "Item de venda cadastrado com sucesso.", detalhes: result})
            }
        }
    )
}

const excluir = (req, res) => {
    const { id } = req.params

    let mysql = "DELETE FROM itens_venda WHERE id=?"

    db.query(
        mysql,
        [id],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao excluir item de venda.", detalhes: err})
            } else {
                return res.status(200).json({message: "Item de venda excluído com sucesso.", detalhes: result})
            }
        }
    )
}

const listar = (req, res) => {
    const { id_venda } = req.params

    let mysql = "SELECT p.tipo, p.nome, p.marca, p.id AS id_produto, p.qtd_estoque," +
            " iv.id AS id_item_venda, iv.preco_unitario_momento, iv.quantidade, iv.subtotal" +
            " FROM produtos AS p, itens_venda AS iv WHERE p.id = iv.id_produto AND iv.id_venda = ?"

    db.query(
        mysql,
        [id_venda],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao listar itens de venda.", detalhes: err})
            } else {
                return res.status(200).json(result)
            }
        }
    )
}

module.exports = {
    cadastrar,
    excluir,
    listar
}