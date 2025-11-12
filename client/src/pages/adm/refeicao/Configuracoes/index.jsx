import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../../../../assets/logo2.png";
import "./style_config.css";
import { IoIosArrowBack } from "react-icons/io";
import { FiSettings, FiSave, FiTrash2, FiEdit, FiPlus } from "react-icons/fi";
import { MdOutlineScale } from "react-icons/md";
import { FaUserCog } from "react-icons/fa";

export default function ConfiguracoesRefeicoes() {
  // Estados para Gerenciamento de Tara
  const [taras, setTaras] = useState([]);
  const [novaTara, setNovaTara] = useState({ nome: '', peso: '' });
  const [editandoTara, setEditandoTara] = useState(null);

  // Estados para Gerenciamento de Usuários
  const [usuarios, setUsuarios] = useState([]);
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', email: '', tipo: 'operador' });
  const [editandoUsuario, setEditandoUsuario] = useState(null);

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Buscar taras
      const resTaras = await fetch('/api/refeicoes/taras');
      const dataTaras = await resTaras.json();
      setTaras(dataTaras);

      // Buscar usuários
      const resUsuarios = await fetch('/api/refeicoes/usuarios');
      const dataUsuarios = await resUsuarios.json();
      setUsuarios(dataUsuarios);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Dados mockados
      setTaras([
        { id: 1, nome: 'Prato Pequeno', peso: 0.250 },
        { id: 2, nome: 'Prato Médio', peso: 0.350 },
        { id: 3, nome: 'Prato Grande', peso: 0.450 },
      ]);
      setUsuarios([
        { id: 1, nome: 'Admin Sistema', email: 'admin@dombosco.org', tipo: 'admin' },
        { id: 2, nome: 'Operador Refeitório', email: 'operador@dombosco.org', tipo: 'operador' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensagem = (texto, tipo) => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem({ texto: '', tipo: '' }), 3000);
  };

  // Funções de Tara
  const adicionarTara = async () => {
    if (!novaTara.nome || !novaTara.peso) {
      mostrarMensagem('Preencha todos os campos', 'erro');
      return;
    }
    try {
      const response = await fetch('/api/refeicoes/taras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaTara)
      });
      const data = await response.json();
      setTaras([...taras, data]);
      setNovaTara({ nome: '', peso: '' });
      mostrarMensagem('Tara adicionada com sucesso!', 'sucesso');
    } catch (error) {
      console.error('Erro ao adicionar tara:', error);
      mostrarMensagem('Erro ao adicionar tara', 'erro');
    }
  };

  const atualizarTara = async (id) => {
    try {
      await fetch(`/api/refeicoes/taras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editandoTara)
      });
      setTaras(taras.map(t => t.id === id ? editandoTara : t));
      setEditandoTara(null);
      mostrarMensagem('Tara atualizada com sucesso!', 'sucesso');
    } catch (error) {
      console.error('Erro ao atualizar tara:', error);
      mostrarMensagem('Erro ao atualizar tara', 'erro');
    }
  };

  const excluirTara = async (id) => {
    if (!confirm('Deseja realmente excluir esta tara?')) return;
    try {
      await fetch(`/api/refeicoes/taras/${id}`, { method: 'DELETE' });
      setTaras(taras.filter(t => t.id !== id));
      mostrarMensagem('Tara excluída com sucesso!', 'sucesso');
    } catch (error) {
      console.error('Erro ao excluir tara:', error);
      mostrarMensagem('Erro ao excluir tara', 'erro');
    }
  };

  // Funções de Usuário
  const adicionarUsuario = async () => {
    if (!novoUsuario.nome || !novoUsuario.email) {
      mostrarMensagem('Preencha todos os campos', 'erro');
      return;
    }
    try {
      const response = await fetch('/api/refeicoes/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUsuario)
      });
      const data = await response.json();
      setUsuarios([...usuarios, data]);
      setNovoUsuario({ nome: '', email: '', tipo: 'operador' });
      mostrarMensagem('Usuário adicionado com sucesso!', 'sucesso');
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      mostrarMensagem('Erro ao adicionar usuário', 'erro');
    }
  };

  const atualizarUsuario = async (id) => {
    try {
      await fetch(`/api/refeicoes/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editandoUsuario)
      });
      setUsuarios(usuarios.map(u => u.id === id ? editandoUsuario : u));
      setEditandoUsuario(null);
      mostrarMensagem('Usuário atualizado com sucesso!', 'sucesso');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      mostrarMensagem('Erro ao atualizar usuário', 'erro');
    }
  };

  const excluirUsuario = async (id) => {
    if (!confirm('Deseja realmente excluir este usuário?')) return;
    try {
      await fetch(`/api/refeicoes/usuarios/${id}`, { method: 'DELETE' });
      setUsuarios(usuarios.filter(u => u.id !== id));
      mostrarMensagem('Usuário excluído com sucesso!', 'sucesso');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      mostrarMensagem('Erro ao excluir usuário', 'erro');
    }
  };

  return (
    <div className="configuracoes-container">
      {mensagem.texto && (
        <div className={`mensagem-flutuante ${mensagem.tipo}`}>
          {mensagem.texto}
        </div>
      )}

      <div className="configuracoes-header">
        <Link to="/refeicoes-dashboard" className="voltar-btn">
          <IoIosArrowBack /> Voltar
        </Link>
        <div className="titulo-configuracoes">
          <img src={logo} alt="Logo" />
          <h1>Área Administrativa</h1>
        </div>
      </div>

      {loading ? (
        <div className="loading-config">Carregando configurações...</div>
      ) : (
        <>
          {/* Gerenciamento de Tara */}
          <section className="secao-config">
            <div className="secao-header">
              <MdOutlineScale size={28} />
              <h2>Gerenciamento de Tara</h2>
            </div>
            
            <div className="form-adicionar">
              <input
                type="text"
                placeholder="Nome do recipiente"
                value={novaTara.nome}
                onChange={(e) => setNovaTara({ ...novaTara, nome: e.target.value })}
              />
              <input
                type="number"
                step="0.001"
                placeholder="Peso (kg)"
                value={novaTara.peso}
                onChange={(e) => setNovaTara({ ...novaTara, peso: e.target.value })}
              />
              <button className="btn-adicionar" onClick={adicionarTara}>
                <FiPlus /> Adicionar
              </button>
            </div>

            <div className="lista-itens">
              {taras.map((tara) => (
                <div key={tara.id} className="item-card">
                  {editandoTara?.id === tara.id ? (
                    <>
                      <input
                        type="text"
                        value={editandoTara.nome}
                        onChange={(e) => setEditandoTara({ ...editandoTara, nome: e.target.value })}
                      />
                      <input
                        type="number"
                        step="0.001"
                        value={editandoTara.peso}
                        onChange={(e) => setEditandoTara({ ...editandoTara, peso: e.target.value })}
                      />
                      <div className="item-acoes">
                        <button className="btn-salvar" onClick={() => atualizarTara(tara.id)}>
                          <FiSave /> Salvar
                        </button>
                        <button className="btn-cancelar" onClick={() => setEditandoTara(null)}>
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="item-info">
                        <span className="item-nome">{tara.nome}</span>
                        <span className="item-detalhe">{tara.peso} kg</span>
                      </div>
                      <div className="item-acoes">
                        <button className="btn-editar" onClick={() => setEditandoTara(tara)}>
                          <FiEdit />
                        </button>
                        <button className="btn-excluir" onClick={() => excluirTara(tara.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Gerenciamento de Usuários */}
          <section className="secao-config">
            <div className="secao-header">
              <FaUserCog size={28} />
              <h2>Gerenciamento de Usuários</h2>
            </div>
            
            <div className="form-adicionar">
              <input
                type="text"
                placeholder="Nome completo"
                value={novoUsuario.nome}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
              />
              <input
                type="email"
                placeholder="E-mail"
                value={novoUsuario.email}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
              />
              <select
                value={novoUsuario.tipo}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, tipo: e.target.value })}
              >
                <option value="operador">Operador</option>
                <option value="admin">Administrador</option>
              </select>
              <button className="btn-adicionar" onClick={adicionarUsuario}>
                <FiPlus /> Adicionar
              </button>
            </div>

            <div className="lista-itens">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="item-card">
                  {editandoUsuario?.id === usuario.id ? (
                    <>
                      <input
                        type="text"
                        value={editandoUsuario.nome}
                        onChange={(e) => setEditandoUsuario({ ...editandoUsuario, nome: e.target.value })}
                      />
                      <input
                        type="email"
                        value={editandoUsuario.email}
                        onChange={(e) => setEditandoUsuario({ ...editandoUsuario, email: e.target.value })}
                      />
                      <select
                        value={editandoUsuario.tipo}
                        onChange={(e) => setEditandoUsuario({ ...editandoUsuario, tipo: e.target.value })}
                      >
                        <option value="operador">Operador</option>
                        <option value="admin">Administrador</option>
                      </select>
                      <div className="item-acoes">
                        <button className="btn-salvar" onClick={() => atualizarUsuario(usuario.id)}>
                          <FiSave /> Salvar
                        </button>
                        <button className="btn-cancelar" onClick={() => setEditandoUsuario(null)}>
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="item-info">
                        <span className="item-nome">{usuario.nome}</span>
                        <span className="item-detalhe">{usuario.email}</span>
                        <span className={`badge-tipo ${usuario.tipo}`}>{usuario.tipo}</span>
                      </div>
                      <div className="item-acoes">
                        <button className="btn-editar" onClick={() => setEditandoUsuario(usuario)}>
                          <FiEdit />
                        </button>
                        <button className="btn-excluir" onClick={() => excluirUsuario(usuario.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
