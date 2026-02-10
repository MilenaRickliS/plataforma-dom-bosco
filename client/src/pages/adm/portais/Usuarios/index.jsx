import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./style.css";
import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { FiUpload, FiFilter } from "react-icons/fi";
import { MdEdit } from "react-icons/md";
import { FaRegTrashAlt, FaPlus } from "react-icons/fa";
import { IoEye, IoEyeOff, IoClose } from "react-icons/io5";

export default function Usuarios() {
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

  const [usuarios, setUsuarios] = useState([]);
  const [editando, setEditando] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    role: "aluno",
    foto: null,
  });
  const [preview, setPreview] = useState(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState("todos");

  async function carregarUsuarios() {
    try {
      const res = await axios.get(`${API}/api/usuarios`);

      const listaNormalizada = (res.data || [])
        .filter((u) => u.email && u.email.trim() !== "")
        .map((u) => ({
          ...u,
          nome: u.nome?.trim() || "Sem nome",
          email: u.email,
          role: u.role || "indefinido",
          foto: u.foto || "/src/assets/user-placeholder.png",
        }));
      setUsuarios(listaNormalizada);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar usuários");
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  function handleFile(e) {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, foto: file });
      setPreview(URL.createObjectURL(file));
    }
  }

  function validarFormulario() {
    const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/u;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.nome.trim()) {
      toast.error("O nome é obrigatório.");
      return false;
    }
    if (!regexNome.test(form.nome.trim())) {
      toast.error("O nome deve conter apenas letras e acentos.");
      return false;
    }

    if (!form.email.trim()) {
      toast.error("O e-mail é obrigatório.");
      return false;
    }
    if (!regexEmail.test(form.email.trim())) {
      toast.error("Formato de e-mail inválido (ex: usuario@dominio.com).");
      return false;
    }

    if (!editando && !form.senha.trim()) {
      toast.error("A senha é obrigatória.");
      return false;
    }
    if (form.senha && form.senha.length > 0 && form.senha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return false;
    }

    if (!form.role) {
      toast.error("Selecione uma função para o usuário.");
      return false;
    }

    if (form.foto && form.foto.type && !form.foto.type.startsWith("image/")) {
      toast.error("A foto deve ser uma imagem válida (JPG, PNG, etc).");
      return false;
    }

    return true;
  }

  async function handleSalvar(e) {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));

      if (editando) {
        await axios.put(`${API}/api/usuarios`, fd, {
          params: { emailOriginal: editando.email },
        });
        toast.success("Usuário atualizado com sucesso!");
      } else {
        await axios.post(`${API}/api/usuarios`, fd);
        toast.success("Usuário criado com sucesso!");
      }

      setForm({ nome: "", email: "", senha: "", role: "aluno", foto: null });
      setPreview(null);
      setEditando(null);
      setModalAberto(false);
      carregarUsuarios();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar usuário");
    }
  }

  function handleEditar(u) {
    setEditando(u);
    setForm({
      nome: u.nome,
      email: u.email,
      senha: "",
      role: u.role,
      foto: null,
    });
    setPreview(u.foto);
    setModalAberto(true);
  }

  function handleFecharModal() {
    setModalAberto(false);
    setEditando(null);
    setForm({ nome: "", email: "", senha: "", role: "aluno", foto: null });
    setPreview(null);
  }

  function handleAbrirNovo() {
    setEditando(null);
    setForm({ nome: "", email: "", senha: "", role: "aluno", foto: null });
    setPreview(null);
    setModalAberto(true);
  }

  async function handleExcluir(email) {
    if (!confirm("Deseja realmente excluir este usuário?")) return;
    try {
      await axios.delete(`${API}/api/usuarios`, { params: { email } });
      toast.success("Usuário excluído!");
      carregarUsuarios();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir");
    }
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const nomeSeguro = (u?.nome || "").toString().toLowerCase();
    const buscaNormalizada = (busca || "").toString().toLowerCase();
    const nomeMatch = nomeSeguro.includes(buscaNormalizada);
    const roleMatch = filtroRole === "todos" || u.role === filtroRole;
    return nomeMatch && roleMatch;
  });

  function getIniciais(nome) {
    if (!nome) return "?";
    const partes = nome.trim().split(" ");
    if (partes.length === 1) return partes[0][0]?.toUpperCase() || "?";
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  function getRoleLabel(role) {
    const labels = { aluno: "Aluno", professor: "Professor", admin: "Administrador" };
    return labels[role] || role;
  }

  function getRoleBadgeClass(role) {
    const classes = { aluno: "badge-aluno", professor: "badge-professor", admin: "badge-admin" };
    return classes[role] || "";
  }

  return (
    <div className="gu-page">
      {/* Header */}
      <div className="gu-header">
        <div className="gu-header-left">
          <Link to="/inicio-adm" className="gu-voltar">
            <IoIosArrowBack /> Voltar
          </Link>
          <div>
            <h1 className="gu-titulo">Gerenciamento de Usuários</h1>
            <p className="gu-subtitulo">Gerencie os usuários do sistema, edite permissões e status</p>
          </div>
        </div>
        <button className="gu-btn-novo" onClick={handleAbrirNovo}>
          <FaPlus /> Novo Usuário
        </button>
      </div>

      {/* Filtros */}
      <div className="gu-filtros-card">
        <div className="gu-filtros-header">
          <FiFilter /> <span>Filtros</span>
        </div>
        <div className="gu-filtros-row">
          <div className="gu-filtro-group">
            <label>Buscar por Nome</label>
            <input
              type="text"
              placeholder="Digite o nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="gu-input"
            />
          </div>
          <div className="gu-filtro-group">
            <label>Filtrar por Função</label>
            <select
              value={filtroRole}
              onChange={(e) => setFiltroRole(e.target.value)}
              className="gu-select"
            >
              <option value="todos">Todas as funções</option>
              <option value="aluno">Alunos</option>
              <option value="professor">Professores</option>
              <option value="admin">Administradores</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="gu-tabela-card">
        <table className="gu-tabela">
          <thead>
            <tr>
              <th>USUÁRIO</th>
              <th>FUNÇÃO</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.email}>
                <td>
                  <div className="gu-usuario-info">
                    {u.foto && u.foto !== "/src/assets/user-placeholder.png" ? (
                      <img src={u.foto} className="gu-avatar-img" alt={u.nome} />
                    ) : (
                      <div className="gu-avatar">{getIniciais(u.nome)}</div>
                    )}
                    <div className="gu-usuario-texto">
                      <span className="gu-usuario-nome">{u.nome}</span>
                      <span className="gu-usuario-email">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`gu-badge ${getRoleBadgeClass(u.role)}`}>
                    {getRoleLabel(u.role)}
                  </span>
                </td>
                <td>
                  <div className="gu-acoes">
                    <button onClick={() => handleEditar(u)} className="gu-btn-editar" title="Editar">
                      <MdEdit />
                    </button>
                    <button onClick={() => handleExcluir(u.email)} className="gu-btn-excluir" title="Excluir">
                      <FaRegTrashAlt />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {usuariosFiltrados.length === 0 && (
              <tr>
                <td colSpan="4" className="gu-vazio">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="gu-overlay" onClick={handleFecharModal}>
          <div className="gu-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gu-modal-header">
              <h2>{editando ? "Editar Usuário" : "Novo Usuário"}</h2>
              <button className="gu-modal-fechar" onClick={handleFecharModal}>
                <IoClose />
              </button>
            </div>
            <form onSubmit={handleSalvar} className="gu-modal-form">
              <div className="gu-form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Digite o nome completo"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="gu-input"
                />
              </div>
              <div className="gu-form-group">
                <label>Email *</label>
                <input
                  type="email"
                  placeholder="usuario@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={!!editando}
                  className="gu-input"
                />
              </div>
              <div className="gu-form-group">
                <label>{editando ? "Nova Senha (opcional)" : "Senha *"}</label>
                <div className="gu-senha-wrapper">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder={editando ? "Nova senha (opcional)" : "Mínimo 6 caracteres"}
                    value={form.senha}
                    onChange={(e) => setForm({ ...form, senha: e.target.value })}
                    className="gu-input"
                  />
                  <button
                    type="button"
                    className="gu-btn-senha"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                  >
                    {mostrarSenha ? <IoEyeOff /> : <IoEye />}
                  </button>
                </div>
              </div>
              <div className="gu-form-group">
                <label>Função</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="gu-select"
                >
                  <option value="aluno">Aluno</option>
                  <option value="professor">Professor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="gu-form-group">
                <label>Foto</label>
                <label htmlFor="gu-file-upload" className="gu-upload-label">
                  <FiUpload size={18} />
                  {form.foto ? form.foto.name : "Escolher foto"}
                </label>
                <input
                  id="gu-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  style={{ display: "none" }}
                />
                {preview && <img src={preview} className="gu-foto-preview" alt="Preview" />}
              </div>
              <div className="gu-modal-botoes">
                <button type="button" className="gu-btn-cancelar" onClick={handleFecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="gu-btn-salvar">
                  {editando ? "Salvar Alterações" : "Criar Usuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
