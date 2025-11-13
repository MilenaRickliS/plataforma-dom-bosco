
import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";


jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

function MockAddVideos() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [modo, setModo] = useState("upload");
  const [videoFile, setVideoFile] = useState(null);
  const [videoLink, setVideoLink] = useState("");

  const validar = () => {
    if (!titulo.trim()) return toast.error("O título não pode ser vazio.");
    if (!descricao.trim()) return toast.error("A descrição não pode ser vazia.");
    if (!categoria.trim()) return toast.error("Escolha ou crie uma categoria.");
    if (modo === "upload" && !videoFile)
      return toast.error("Selecione um vídeo antes de enviar.");
    if (modo === "link" && !videoLink.trim())
      return toast.error("Informe o link do vídeo.");
    toast.success("Validação passou!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validar();
  };

  return (
    <div>
      <button onClick={() => setModo("upload")}>Upload</button>
      <button onClick={() => setModo("link")}>Link</button>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Título do vídeo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <textarea
          placeholder="Descrição do vídeo"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="">Selecione...</option>
          <option value="Matemática">Matemática</option>
          <option value="História">História</option>
        </select>

        {modo === "upload" ? (
          <input
            data-testid="file-input"
            type="file"
            onChange={(e) => setVideoFile(e.target.files[0])}
          />
        ) : (
          <input
            data-testid="link-input"
            placeholder="Link do vídeo"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
          />
        )}

        <button type="submit">Salvar vídeo</button>
      </form>
    </div>
  );
}

describe("Componente AddVideos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("valida campos obrigatórios no modo upload", async () => {
    render(<MockAddVideos />);

    const btnSalvar = screen.getByText("Salvar vídeo");
    fireEvent.click(btnSalvar);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("O título não pode ser vazio.");
    });

   
    fireEvent.change(screen.getByPlaceholderText(/Título do vídeo/i), {
      target: { value: "Aula de Matemática" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Descrição do vídeo/i), {
      target: { value: "Descrição válida com várias palavras." },
    });
    fireEvent.click(btnSalvar);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Escolha ou crie uma categoria.");
    });

    fireEvent.change(screen.getByDisplayValue("Selecione..."), {
      target: { value: "Matemática" },
    });
    fireEvent.click(btnSalvar);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Selecione um vídeo antes de enviar.");
    });
  });

  test("valida campos obrigatórios no modo link", async () => {
    render(<MockAddVideos />);

    
    fireEvent.click(screen.getByText("Link"));

    const btnSalvar = screen.getByText("Salvar vídeo");
    fireEvent.click(btnSalvar);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("O título não pode ser vazio.");
    });

 
    fireEvent.change(screen.getByPlaceholderText(/Título do vídeo/i), {
      target: { value: "Aula de História" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Descrição do vídeo/i), {
      target: { value: "Descrição suficiente e válida para o teste." },
    });
    fireEvent.change(screen.getByDisplayValue("Selecione..."), {
      target: { value: "História" },
    });

    fireEvent.click(btnSalvar);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Informe o link do vídeo.");
    });
  });
});
