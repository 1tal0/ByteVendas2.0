import { useState, useEffect, useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function Produtos() {
  const { user } = useContext(AuthContext)
  const [produtos, setProdutos] = useState([])
  
  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    marca: '',
    preco_base: '',
    qtd_estoque: '',
    tipo: 'Nacional',
    imposto_local: '',
    taxa_importacao: '',
    pais_origem: ''
  })

  useEffect(() => {
    carregarProdutos()
  }, [])

  const carregarProdutos = async () => {
    try {
      const response = await api.get('/produto/listar')
      setProdutos(response.data)
    } catch (err) {
      alert('Erro ao carregar produtos.')
    }
  }

  const handleCadastrar = async (e) => {
    e.preventDefault()
    try {
      // Ajusta os campos com 0 ou null dependendo do tipo selecionado
      const payload = {
        ...novoProduto,
        preco_base: parseFloat(novoProduto.preco_base),
        qtd_estoque: parseInt(novoProduto.qtd_estoque),
        imposto_local: novoProduto.tipo === 'Nacional' ? parseFloat(novoProduto.imposto_local || 0) : 0,
        taxa_importacao: novoProduto.tipo === 'Importado' ? parseFloat(novoProduto.taxa_importacao || 0) : 0,
        pais_origem: novoProduto.tipo === 'Importado' ? novoProduto.pais_origem : 'Brasil'
      }

      await api.post('/produto/cadastrar', payload)
      alert('Produto cadastrado com sucesso!')
      
      setNovoProduto({
        nome: '',
        marca: '',
        preco_base: '',
        qtd_estoque: '',
        tipo: 'Nacional',
        imposto_local: '',
        taxa_importacao: '',
        pais_origem: ''
      })

      carregarProdutos()
    } catch (err) {
      alert('Erro ao cadastrar produto.')
    }
  }

  const handleExcluir = async (id) => {
    if (confirm('Deseja realmente excluir este produto?')) {
      try {
        await api.delete(`/produto/excluir/${id}`)
        carregarProdutos()
      } catch (err) {
        alert('Erro ao excluir produto.')
      }
    }
  }

  return (
    <div>
      {/* Exibe o formulário apenas para perfil Gerente */}
      {user?.tipo === 'Gerente' && (
        <div className="card">
          <h3>Cadastrar Novo Produto</h3>
          <form onSubmit={handleCadastrar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label>Nome do Produto</label>
              <input
                type="text"
                placeholder="Ex: Notebook"
                value={novoProduto.nome}
                onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                required
              />
            </div>

            <div>
              <label>Marca</label>
              <input
                type="text"
                placeholder="Ex: Dell"
                value={novoProduto.marca}
                onChange={(e) => setNovoProduto({ ...novoProduto, marca: e.target.value })}
                required
              />
            </div>

            <div>
              <label>Preço Base (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={novoProduto.preco_base}
                onChange={(e) => setNovoProduto({ ...novoProduto, preco_base: e.target.value })}
                required
              />
            </div>

            <div>
              <label>Qtd. em Estoque</label>
              <input
                type="number"
                placeholder="0"
                value={novoProduto.qtd_estoque}
                onChange={(e) => setNovoProduto({ ...novoProduto, qtd_estoque: e.target.value })}
                required
              />
            </div>

            <div>
              <label>Tipo de Produto</label>
              <select
                value={novoProduto.tipo}
                onChange={(e) => setNovoProduto({ ...novoProduto, tipo: e.target.value })}
              >
                <option value="Nacional">Nacional</option>
                <option value="Importado">Importado</option>
              </select>
            </div>

            {/* Campos dinâmicos baseados no Tipo */}
            {novoProduto.tipo === 'Nacional' ? (
              <div>
                <label>Imposto Local (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 12"
                  value={novoProduto.imposto_local}
                  onChange={(e) => setNovoProduto({ ...novoProduto, imposto_local: e.target.value })}
                  required
                />
              </div>
            ) : (
              <>
                <div>
                  <label>Taxa de Importação (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 60"
                    value={novoProduto.taxa_importacao}
                    onChange={(e) => setNovoProduto({ ...novoProduto, taxa_importacao: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>País de Origem</label>
                  <input
                    type="text"
                    placeholder="Ex: China"
                    value={novoProduto.pais_origem}
                    onChange={(e) => setNovoProduto({ ...novoProduto, pais_origem: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            <button type="submit" style={{ gridColumn: 'span 2', marginTop: '10px' }}>
              Salvar Produto
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Catálogo de Produtos</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Marca</th>
              <th>Tipo</th>
              <th>Preço Base</th>
              <th>Estoque</th>
              <th>Detalhes Fiscais</th>
              {user?.tipo === 'Gerente' && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nome}</td>
                <td>{p.marca}</td>
                <td>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    backgroundColor: p.tipo === 'Nacional' ? '#e0f2fe' : '#fef3c7',
                    color: p.tipo === 'Nacional' ? '#0369a1' : '#b45309'
                  }}>
                    {p.tipo}
                  </span>
                </td>
                <td>R$ {Number(p.preco_base).toFixed(2)}</td>
                <td>{p.qtd_estoque} un</td>
                <td>
                  {p.tipo === 'Nacional' 
                    ? `Imposto: ${p.imposto_local}%`
                    : `Taxa: ${p.taxa_importacao}% (${p.pais_origem})`
                  }
                </td>
                {user?.tipo === 'Gerente' && (
                  <td>
                    <button className="danger" onClick={() => handleExcluir(p.id)}>
                      Excluir
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}