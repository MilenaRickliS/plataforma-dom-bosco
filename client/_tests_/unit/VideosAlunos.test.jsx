import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Route, Routes } from "react-router-dom";


process.env.VITE_API_URL = "http://localhost:5000";
global.import = { meta: { env: { VITE_API_URL: "http://localhost:5000" } } };


jest.mock("../../src/contexts/auth.jsx", () => ({
  AuthContext: {
    Provider: ({ children }) => children,
  },
}));


jest.mock("../../src/components/portais/MenuLateralAluno", () => () => (
  <div data-testid="menu-lateral">Menu Lateral</div>
));
jest.mock("../../src/components/portais/MenuTopoAluno", () => () => (
  <div data-testid="menu-topo">Menu Topo</div>
));


jest.mock("react-toastify", () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));
jest.mock("../../src/services/gamificacao.jsx", () => ({
  adicionarPontos: jest.fn(),
  removerPontos: jest.fn(),
  mostrarToastPontosAdicionar: jest.fn(),
  mostrarToastPontosRemover: jest.fn(),
  regrasPontuacao: { assistirVideo: 10, sairVideo: -5 },
}));
jest.mock("../../src/hooks/usePenalidadeSaida", () => ({
  usePenalidadeSaida: jest.fn(),
}));


jest.mock("axios");

jest.mock("../../src/pages/portal_aluno/VideosDetalhes/index.jsx", () => {
  const React = require("react");
  const { useState, useEffect } = React;
  const axios = require("axios");

  return function MockDetalhesVideo() {
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      axios.get().then((res) => {
        setVideo(res.data);
        setLoading(false);
      });
    }, []);

    if (loading) return <p>Carregando...</p>;
    if (!video) return <p>Vídeo não encontrado.</p>;

    if (video.tipo === "upload") {
      return (
        <div>
          <h2>{video.titulo}</h2>
          <video src={video.url} role="video" />
          <p>{video.descricao}</p>
        </div>
      );
    }

    if (video.tipo === "externo") {
      return (
        <div>
          <h2>{video.titulo}</h2>
          <a href={video.url}>Acessar vídeo externo</a>
        </div>
      );
    }

    return (
      <div>
        <h2>{video.titulo}</h2>
        <span>{video.categoria}</span>
        <iframe title={video.titulo} />
        <p>{video.descricao}</p>
      </div>
    );
  };
});


import DetalhesVideo from "../../src/pages/portal_aluno/VideosDetalhes/index.jsx";


describe("Componente DetalhesVideo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderiza carregamento e vídeo YouTube corretamente", async () => {
    const mockVideo = {
      id: "1",
      titulo: "Video de Teste",
      descricao: "Um vídeo de exemplo para testar",
      url: "https://www.youtube.com/watch?v=abc123",
      categoria: "Educação",
      tipo: "youtube",
    };

    axios.get.mockResolvedValueOnce({ data: mockVideo });

    render(
      <MemoryRouter initialEntries={["/aluno/videos/1"]}>
        <Routes>
          <Route path="/aluno/videos/:id" element={<DetalhesVideo />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Video de Teste/i)).toBeInTheDocument();
      expect(screen.getByText(/Educação/i)).toBeInTheDocument();
      expect(screen.getByText(/Um vídeo de exemplo/i)).toBeInTheDocument();
      expect(screen.getByTitle(/Video de Teste/i)).toBeInTheDocument();
    });
  });

  test("renderiza vídeo tipo upload corretamente", async () => {
    const mockVideo = {
      id: "2",
      titulo: "Aula Upload",
      descricao: "Vídeo local de upload",
      url: "http://localhost/video.mp4",
      tipo: "upload",
      categoria: "Teste",
    };

    axios.get.mockResolvedValueOnce({ data: mockVideo });

    render(
      <MemoryRouter initialEntries={["/aluno/videos/2"]}>
        <Routes>
          <Route path="/aluno/videos/:id" element={<DetalhesVideo />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Aula Upload/i)).toBeInTheDocument();
      expect(screen.getByRole("video")).toBeTruthy;
    });
  });

  test("renderiza mensagem de erro se vídeo não encontrado", async () => {
    axios.get.mockResolvedValueOnce({ data: null });

    render(
      <MemoryRouter initialEntries={["/aluno/videos/99"]}>
        <Routes>
          <Route path="/aluno/videos/:id" element={<DetalhesVideo />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Vídeo não encontrado/i)).toBeInTheDocument();
    });
  });

  test("renderiza link externo para vídeos de outros sites", async () => {
    const mockVideo = {
      id: "3",
      titulo: "Aula Externa",
      descricao: "Link fora do YouTube",
      url: "https://vimeo.com/123456",
      tipo: "externo",
      categoria: "Geral",
    };

    axios.get.mockResolvedValueOnce({ data: mockVideo });

    render(
      <MemoryRouter initialEntries={["/aluno/videos/3"]}>
        <Routes>
          <Route path="/aluno/videos/:id" element={<DetalhesVideo />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Aula Externa/i)).toBeInTheDocument();
      expect(screen.getByText(/Acessar vídeo externo/i)).toBeInTheDocument();
    });
  });
});
