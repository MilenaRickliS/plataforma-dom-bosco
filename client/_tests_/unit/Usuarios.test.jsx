import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";
import axios from "axios";


jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock("axios");


function MockUsuarios() {
  const [usuarios, setUsuarios] = useState([
    { nome: "Alice", email: "alice@teste.com", role: "aluno" },
    { nome: "Bruno", email: "bruno@teste.com", role: "professor" },
  ]);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", role: "aluno" });
  const [editando, setEditando] = useState(null);

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (editando) {
      await axios.put("/api/usuarios", form);
      toast.success("Usuário atualizado com sucesso!");
      setEditando(null);
    } else {
      await axios.post("/api/usuarios", form);
      toast.success("Usuário criado com sucesso!");
      setUsuarios((prev) => [...prev, form]);
    }
    setForm({ nome: "", email: "", senha: "", role: "aluno" });
  };

  const handleExcluir = async (email) => {
    await axios.delete("/api/usuarios", { params: { email } });
    toast.success("Usuário excluído!");
    setUsuarios((prev) => prev.filter((u) => u.email !== email));
  };

  return (
    <div>
      <h1>Gerenciar Usuários</h1>
      <form onSubmit={handleSalvar}>
        <input
          placeholder="Nome"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
        <input
          placeholder="E-mail"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Senha"
          type="password"
          value={form.senha}
          onChange={(e) => setForm({ ...form, senha: e.target.value })}
        />
        <button type="submit">
          {editando ? "Salvar Alterações" : "Adicionar Usuário"}
        </button>
      </form>

      <table data-testid="tabela">
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.email}>
              <td>{u.nome}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button
                  onClick={() => {
                    setEditando(u);
                    setForm({
                    nome: u.nome || "",
                    email: u.email || "",
                    role: u.role || "aluno",
                    senha: "", 
                    });

                  }}
                >
                  Editar
                </button>
                <button onClick={() => handleExcluir(u.email)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



describe("Página de Usuários", () => {
  beforeEach(() => jest.clearAllMocks());

  test("cria novo usuário com sucesso", async () => {
    axios.post.mockResolvedValueOnce({ data: { message: "ok" } });
    render(<MockUsuarios />);

    fireEvent.change(screen.getByPlaceholderText(/Nome/i), {
      target: { value: "Carlos" },
    });
    fireEvent.change(screen.getByPlaceholderText(/E-mail/i), {
      target: { value: "carlos@teste.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Senha/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByText(/Adicionar Usuário/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/usuarios", {
        nome: "Carlos",
        email: "carlos@teste.com",
        senha: "123456",
        role: "aluno",
      });
      expect(toast.success).toHaveBeenCalledWith("Usuário criado com sucesso!");
    });
  });

  test("edita usuário existente", async () => {
    axios.put.mockResolvedValueOnce({ data: { message: "ok" } });
    render(<MockUsuarios />);

    fireEvent.click(screen.getAllByText(/Editar/i)[0]);
    fireEvent.change(screen.getByPlaceholderText(/Nome/i), {
      target: { value: "Alice Editada" },
    });
    fireEvent.click(screen.getByText(/Salvar Alterações/i));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/usuarios", {
        nome: "Alice Editada",
        email: "alice@teste.com",
        senha: "",
        role: "aluno",
      });
      expect(toast.success).toHaveBeenCalledWith("Usuário atualizado com sucesso!");
    });
  });

  test("exclui usuário corretamente", async () => {
    axios.delete.mockResolvedValueOnce({ data: { message: "ok" } });
    render(<MockUsuarios />);

    fireEvent.click(screen.getAllByText(/Excluir/i)[0]);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("/api/usuarios", {
        params: { email: "alice@teste.com" },
      });
      expect(toast.success).toHaveBeenCalledWith("Usuário excluído!");
    });
  });
});
