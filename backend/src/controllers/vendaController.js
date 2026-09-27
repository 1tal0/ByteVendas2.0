const db = require("../db/db.js")

const cadastrar = (req, res) => {
    const { id_cliente, id_vendedor, valor_total, forma_pagamento, status } = req.body

    let mysql = "INSERT INTO vendas (id_cliente, id_vendedor, data_venda, valor_total, forma_pagamento, status) VALUES (?, ?, NOW(), ?, ?, ?)"

    db.query(
        mysql,
        [id_cliente, id_vendedor, valor_total, forma_pagamento, status],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao cadastrar venda.", detalhes: err})
            }

            return res.status(201).json({message: "Venda cadastrada com sucesso.", detalhes: result})
        }
    )
}

const atualizar = (req, res) => {
    const { id_cliente, valor_total, forma_pagamento, status } = req.body
    const { id } = req.params

    let mysql = "UPDATE vendas SET id_cliente=?, valor_total=?, forma_pagamento=?, status=? WHERE id=?"

    db.query(
        mysql,
        [id_cliente, valor_total, forma_pagamento, status, id],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao atualizar venda.", detalhes: err})
            } else {
                return res.status(200).json({message: "Venda atualizada com sucesso.", detalhes: result})
            }
        }
    )
}

const listar = (req, res) => {
    const { id_usuario } = req.params
    
    let mysql = "SELECT v.id AS id_venda, c.id AS id_cliente, c.nome, c.cpf, v.status, v.data_venda" +
        " FROM vendas AS v" +
        " INNER JOIN clientes AS c ON v.id_cliente = c.id" +
        " INNER JOIN usuarios AS u ON v.id_vendedor = u.id" +
        " WHERE u.id = ?" +
        " ORDER BY v.data_venda DESC";

    db.query(
        mysql,
        [id_usuario],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao listar vendas.", detalhes: err})
            } 

            return res.status(200).json(result)
        }
    )
}

const vendaEspecifica = (req, res) => {
    const { id_usuario, id_venda } = req.params
    
    let mysql = "SELECT v.id AS id_venda, c.id AS id_cliente, c.nome, c.cpf, v.status, v.data_venda" +
        " FROM clientes AS c, vendas AS v, usuarios AS u WHERE u.id = ? AND v.id = ?" + 
        " AND (v.id_cliente = c.id AND v.id_vendedor = u.id) ORDER BY v.data_venda DESC"

    db.query(
        mysql,
        [id_usuario, id_venda],
        (err, result) => {
            if(err) {
                console.log(err)
                return res.status(500).json({error: "Erro ao buscar venda específica.", detalhes: err})
            }
            
            return res.status(200).json(result)
        }
    )
}

module.exports = {
    cadastrar,
    atualizar,
    listar,
    vendaEspecifica
}