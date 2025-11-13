import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./style.css";
import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { FiUpload } from "react-icons/fi";
import { MdEdit } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5"; 

export default function Usuarios() {
 const API = (import.meta?.env?.VITE_API_URL ?? process.env.VITE_API_URL) || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

  const [usuarios, setUsuarios] = useState([]);
  const [editando, setEditando] = useState(null);
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
      
      const listaNormalizada = (res.data || []).map((u) => ({
        nome: u.nome?.trim() || "Sem nome",
        email: u.email || "—",
        role: u.role || "indefinido",
        foto: u.foto || "/src/assets/user-placeholder.png",
        ...u,
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

    if (!editando && !form.foto) {
      toast.error("A foto do usuário é obrigatória.");
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

  return (
    <div className="usuarios-container">
      <div className="inicio-menug">
        <Link to="/gestao-portais" className="voltar-adm">
          <IoIosArrowBack /> Voltar
        </Link>
        <h1 className="titulo-usuarios">Gerenciar Usuários</h1>
      </div>

      <div className="form-usuarios">
        <h2 className="adicionar-usuario">
          {editando ? "Editar Usuário" : "Adicionar Usuário"}
        </h2>
        <form onSubmit={handleSalvar}>
          <input
            type="text"
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <input
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={!!editando}
          />

          
          <div className="senha-wrapper">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder={editando ? "Nova Senha (opcional)" : "Senha"}
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
            />
            <button
              type="button"
              className="btn-mostrar-senha"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="select-usuarios"
          >
            <option value="aluno">Aluno</option>
            <option value="professor">Professor</option>
            <option value="admin">Administrador</option>
          </select>

          <label htmlFor="file-upload" className="upload-label-usuarios">
            <span className="upload-text">
              <FiUpload size={20} />{" "}
              {form.foto ? form.foto.name : "Escolher foto"}
            </span>
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: "none" }}
          />
          {preview && <img src={preview} className="foto-usuario-preview" />}
          <button type="submit" className="btn-salvar-usuario">
            {editando ? "Salvar Alterações" : "Adicionar Usuário"}
          </button>
          {editando && (
            <button
              type="button"
              className="btn-cancelar"
              onClick={() => {
                setEditando(null);
                setForm({
                  nome: "",
                  email: "",
                  senha: "",
                  role: "aluno",
                  foto: null,
                });
                setPreview(null);
              }}
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      <div className="filtros-usuarios">
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="input-busca"
        />
        <select
          value={filtroRole}
          onChange={(e) => setFiltroRole(e.target.value)}
          className="select-filtro-usuarios"
        >
          <option value="todos">Todos</option>
          <option value="aluno">Alunos</option>
          <option value="professor">Professores</option>
          <option value="admin">Administradores</option>
        </select>
      </div>

      <div className="usuarios-lista">
        <h2>Lista de Usuários</h2>
        <table>
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Função</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.email}>
                <td>
                  <img
                    src={u.foto || "/src/assets/user-placeholder.png"}
                    className="foto-tabela"
                  />
                </td>
                <td>{u.nome}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button
                    onClick={() => handleEditar(u)}
                    className="btn-editar-usuario"
                  >
                    <MdEdit /> Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(u.email)}
                    className="btn-excluir-usuario"
                  >
                    <FaRegTrashAlt /> Excluir
                  </button>
                </td>
              </tr>
            ))}
            {usuariosFiltrados.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "10px" }}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
