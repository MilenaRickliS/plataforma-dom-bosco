import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./style.css";

export default function Usuarios() {
  const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";
  const [usuarios, setUsuarios] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", role: "aluno", foto: null });
  const [preview, setPreview] = useState(null);

  async function carregarUsuarios() {
    try {
      const res = await axios.get(`${API}/api/usuarios`);
      setUsuarios(res.data);
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

  async function handleCriar(e) {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) fd.append(key, value);
      });

      await axios.post(`${API}/api/usuarios`, fd);
      toast.success("Usuário criado com sucesso!");
      setForm({ nome: "", email: "", senha: "", role: "aluno", foto: null });
      setPreview(null);
      carregarUsuarios();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar usuário");
    }
  }

  async function handleExcluir(email) {
    if (!confirm("Deseja realmente excluir este usuário?")) return;
    try {
      await axios.delete(`${API}/api/usuarios/${email}`);
      toast.success("Usuário excluído!");
      carregarUsuarios();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir");
    }
  }

  return (
    <div className="usuarios-container">
      <h1>Gerenciar Usuários</h1>

      <div className="form-usuarios-card">
        <h2>{editando ? "Editar Usuário" : "Adicionar Usuário"}</h2>
        <form onSubmit={handleCriar}>
          <input
            type="text"
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            required
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="aluno">Aluno</option>
            <option value="professor">Professor</option>
            <option value="admin">Administrador</option>
          </select>
          <input type="file" accept="image/*" onChange={handleFile} />
          {preview && <img src={preview} className="foto-usuario-preview" />}
          <button type="submit" className="btn-salvar-usuario">
            {editando ? "Salvar Alterações" : "Adicionar Usuário"}
          </button>
        </form>
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
            {usuarios.map((u) => (
              <tr key={u.email}>
                <td>
                  <img
                    src={u.foto || "/src/assets/user-placeholder.png"}
                    alt="foto"
                    className="foto-tabela"
                  />
                </td>
                <td>{u.nome}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button onClick={() => handleExcluir(u.email)} className="btn-excluir-usuario">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
