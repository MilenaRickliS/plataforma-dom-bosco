import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";


jest.mock("axios");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast" />,
}));


function Usuarios() {
  const [usuarios, setUsuarios] = React.useState([]);
  const [novoUsuario, setNovoUsuario] = React.useState({
    nome: "",
    email: "",
    senha: "",
    role: "aluno",
  });

  async function carregarUsuarios() {
    const res = await axios.get("/api/usuarios");
    setUsuarios(res.data);
  }

  React.useEffect(() => {
    carregarUsuarios();
  }, []);

  async function handleSalvar() {
    await axios.post("/api/usuarios", novoUsuario);
    await carregarUsuarios();
  }

  return (
    <div>
      <h1>Gerenciar Usuários</h1>
      <input
        data-testid="nome"
        placeholder="Nome"
        value={novoUsuario.nome}
        onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
      />
      <input
        data-testid="email"
        placeholder="E-mail"
        value={novoUsuario.email}
        onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
      />
      <input
        data-testid="senha"
        placeholder="Senha"
        value={novoUsuario.senha}
        onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
      />
      <button data-testid="btn-salvar" onClick={handleSalvar}>
        Adicionar Usuário
      </button>
      <ul data-testid="lista-usuarios">
        {usuarios.map((u) => (
          <li key={u.email}>{u.nome}</li>
        ))}
      </ul>
    </div>
  );
}

function GerenciarTurmas() {
  const [turmas, setTurmas] = React.useState([]);
  const [detalhes, setDetalhes] = React.useState(null);
  const [professor, setProfessor] = React.useState("");
  const [aluno, setAluno] = React.useState("");

  async function carregarTurmas() {
    const res = await axios.get("/api/gestao-turmas");
    setTurmas(res.data);
  }

  React.useEffect(() => {
    carregarTurmas();
  }, []);

  async function verDetalhes(id) {
    const res = await axios.get(`/api/gestao-turmas/detalhes?turmaId=${id}`);
    setDetalhes(res.data);
  }

  async function alterarProfessor() {
    await axios.patch("/api/gestao-turmas/alterarProfessor", {
      turmaId: detalhes.id,
      novoProfessorIdentificador: professor,
    });
    const res = await axios.get(`/api/gestao-turmas/detalhes?turmaId=${detalhes.id}`);
    setDetalhes(res.data);
  }

  async function adicionarAluno() {
    await axios.post("/api/gestao-turmas/adicionarAluno", {
      turmaId: detalhes.id,
      alunoIdentificador: aluno,
    });
    const res = await axios.get(`/api/gestao-turmas/detalhes?turmaId=${detalhes.id}`);
    setDetalhes(res.data);
  }

  async function removerAluno(idAluno) {
    await axios.patch("/api/gestao-turmas/removerAluno", {
      turmaId: detalhes.id,
      alunoId: idAluno,
    });
    const res = await axios.get(`/api/gestao-turmas/detalhes?turmaId=${detalhes.id}`);
    setDetalhes(res.data);
  }

  return (
    <div>
      <h1>Gerenciar Turmas</h1>
      {!detalhes &&
        turmas.map((t) => (
          <button key={t.id} data-testid={`turma-${t.id}`} onClick={() => verDetalhes(t.id)}>
            {t.nomeTurma}
          </button>
        ))}
      {detalhes && (
        <div data-testid="detalhes-turma">
          <p>Turma: {detalhes.nomeTurma}</p>
          <input
            data-testid="professor"
            placeholder="Novo professor"
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
          />
          <button data-testid="btn-professor" onClick={alterarProfessor}>
            Vincular Professor
          </button>

          <input
            data-testid="aluno"
            placeholder="Novo aluno"
            value={aluno}
            onChange={(e) => setAluno(e.target.value)}
          />
          <button data-testid="btn-adicionar" onClick={adicionarAluno}>
            Adicionar Aluno
          </button>

          {detalhes.alunos.map((a) => (
            <div key={a.id}>
              <span>{a.nome}</span>
              <button data-testid={`remover-${a.id}`} onClick={() => removerAluno(a.id)}>
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


describe("Integração - Fluxo do Administrador", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Admin → adiciona usuário → visualiza turmas → vincula professor → adiciona e exclui alunos", async () => {
    
    axios.get.mockImplementation((url) => {
      if (url === "/api/usuarios") {
        return Promise.resolve({ data: [] });
      }
      if (url === "/api/gestao-turmas") {
        return Promise.resolve({
          data: [{ id: "t1", nomeTurma: "Turma A", professorNome: "Antigo" }],
        });
      }
      if (url.startsWith("/api/gestao-turmas/detalhes")) {
        return Promise.resolve({
          data: {
            id: "t1",
            nomeTurma: "Turma A",
            professorNome: "Antigo",
            alunos: [{ id: "a1", nome: "Aluno 1" }],
          },
        });
      }
      return Promise.resolve({ data: [] });
    });

    axios.post.mockImplementation((url, body) => {
      if (url === "/api/usuarios") return Promise.resolve({ data: { message: "Usuário criado" } });
      if (url.includes("adicionarAluno")) return Promise.resolve({ data: { message: "Aluno adicionado" } });
      return Promise.resolve({ data: {} });
    });

    axios.patch.mockImplementation((url, body) => {
      if (url.includes("alterarProfessor")) return Promise.resolve({ data: { message: "Professor alterado" } });
      if (url.includes("removerAluno")) return Promise.resolve({ data: { message: "Aluno removido" } });
      return Promise.resolve({ data: {} });
    });

   
    render(
      <MemoryRouter initialEntries={["/admin/usuarios"]}>
        <Routes>
          <Route path="/admin/usuarios" element={<Usuarios />} />
          <Route path="/admin/turmas" element={<GerenciarTurmas />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId("nome"), { target: { value: "Milena" } });
    fireEvent.change(screen.getByTestId("email"), { target: { value: "milena@teste.com" } });
    fireEvent.change(screen.getByTestId("senha"), { target: { value: "123456" } });
    fireEvent.click(screen.getByTestId("btn-salvar"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/usuarios", {
        nome: "Milena",
        email: "milena@teste.com",
        senha: "123456",
        role: "aluno",
      });
    });

   
    render(<GerenciarTurmas />);
    await waitFor(() => expect(screen.getByText("Turma A")).toBeInTheDocument());

   
    fireEvent.click(screen.getByTestId("turma-t1"));
    await waitFor(() => expect(screen.getByTestId("detalhes-turma")).toBeInTheDocument());

 
    fireEvent.change(screen.getByTestId("professor"), { target: { value: "prof123" } });
    fireEvent.click(screen.getByTestId("btn-professor"));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledWith(
      "/api/gestao-turmas/alterarProfessor",
      expect.objectContaining({
        turmaId: "t1",
        novoProfessorIdentificador: "prof123",
      })
    ));

    
    fireEvent.change(screen.getByTestId("aluno"), { target: { value: "a2" } });
    fireEvent.click(screen.getByTestId("btn-adicionar"));
    await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
      "/api/gestao-turmas/adicionarAluno",
      expect.objectContaining({
        turmaId: "t1",
        alunoIdentificador: "a2",
      })
    ));

   
    fireEvent.click(screen.getByTestId("remover-a1"));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledWith(
      "/api/gestao-turmas/removerAluno",
      expect.objectContaining({
        turmaId: "t1",
        alunoId: "a1",
      })
    ));
  });
});
