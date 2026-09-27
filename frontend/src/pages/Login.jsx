import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Login() {
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(nomeUsuario, senha)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data || 'Erro ao realizar login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-hero">
        <div>
          <div className="brand-mark" style={{ marginBottom: 24 }}>BV</div>
          <h1>Vendas com controle e clareza.</h1>
          <p>Gerencie clientes, produtos, usuarios e pedidos em um painel simples, rapido e responsivo.</p>
        </div>
        <p style={{ color: '#64748b' }}>ByteVendas · gestao comercial</p>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Entrar</h2>
          <p className="muted">Use suas credenciais para acessar o sistema.</p>
          {error && <p className="error-text">{String(error)}</p>}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Nome de usuario</label>
            <input
              type="text"
              placeholder="seu.usuario"
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <button className="btn" type="submit" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Entrando...' : 'Acessar painel'}
          </button>
        </form>
      </section>
    </div>
  )
}
