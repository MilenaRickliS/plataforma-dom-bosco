import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";


function MockMedalhasAtribuir() {
  const [novo, setNovo] = useState({
    title: "",
    imageFile: null,
    category: "geral",
  });
  const [mensagem, setMensagem] = useState("");

  async function handleSalvar(e) {
    e.preventDefault();

    if (!novo.title.trim()) {
      toast.error("⚠️ O título não pode estar vazio.");
      return;
    }
    if (!novo.imageFile) {
      toast.error("⚠️ É necessário enviar uma imagem da medalha.");
      return;
    }
    if (!novo.category.trim()) {
      toast.error("⚠️ Selecione ou crie uma categoria.");
      return;
    }

 
    toast.success("🏅 Modelo criado com sucesso!");
    setMensagem("Criado");
    setNovo({ title: "", imageFile: null, category: "geral" });
  }

  return (
    <form onSubmit={handleSalvar}>
      <h2>Criar Novo Modelo</h2>

      <label>
        Título:
        <input
          placeholder="Ex.: Estrela da Semana"
          value={novo.title}
          onChange={(e) => setNovo({ ...novo, title: e.target.value })}
        />
      </label>

      <label>
        Imagem da medalha:
        <input
          aria-label="Imagem da medalha"
          type="file"
          accept="image/*"
          onChange={(e) =>
            setNovo({ ...novo, imageFile: e.target.files?.[0] || null })
          }
        />
      </label>

      <label>
        Categoria:
        <select
          aria-label="Categoria:"
          value={novo.category}
          onChange={(e) => setNovo({ ...novo, category: e.target.value })}
        >
          <option value="">Selecione</option>
          <option value="geral">Geral</option>
        </select>
      </label>

      <button type="submit">Salvar Modelo</button>
      {mensagem && <p data-testid="mensagem">{mensagem}</p>}
    </form>
  );
}


jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));


describe("Página de Medalhas - Criação de Medalha", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("cria medalha com campos obrigatórios corretamente", async () => {
    render(<MockMedalhasAtribuir />);

    const titulo = screen.getByPlaceholderText(/Estrela da Semana/i);
    const arquivo = new File(["conteudo"], "medalha.png", { type: "image/png" });
    const fileInput = screen.getByLabelText(/Imagem da medalha/i);
    const categoria = screen.getByLabelText(/Categoria:/i);
    const botao = screen.getByText(/Salvar Modelo/i);

    
    fireEvent.change(titulo, { target: { value: "Medalha de Ouro" } });
    fireEvent.change(fileInput, { target: { files: [arquivo] } });
    fireEvent.change(categoria, { target: { value: "geral" } });

    fireEvent.click(botao);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("🏅 Modelo criado com sucesso!");
      expect(screen.getByTestId("mensagem")).toHaveTextContent("Criado");
    });

    
    expect(titulo.value).toBe("");
  });

  test("exibe erro se faltar imagem", async () => {
    render(<MockMedalhasAtribuir />);

    const titulo = screen.getByPlaceholderText(/Estrela da Semana/i);
    fireEvent.change(titulo, { target: { value: "Sem imagem" } });

    fireEvent.click(screen.getByText(/Salvar Modelo/i));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "⚠️ É necessário enviar uma imagem da medalha."
      );
    });
  });

  test("exibe erro se faltar título", async () => {
    render(<MockMedalhasAtribuir />);

    fireEvent.click(screen.getByText(/Salvar Modelo/i));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("⚠️ O título não pode estar vazio.");
    });
  });
});
