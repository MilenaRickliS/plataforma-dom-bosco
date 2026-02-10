import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import logo from '../../../../assets/logo2.png';
import './style.css';
import { IoIosArrowBack } from "react-icons/io";
import { FiUpload, FiFilter } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function MenuGestao() {
    
    const API = import.meta.env.VITE_API_URL || "https://plataforma-dom-bosco-backend-krq4dua7f-milenaricklis-projects.vercel.app";

    const [membros, setMembros] = useState([]);
    const [nome, setNome] = useState("");
    const [cargo, setCargo] = useState("");
    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState("");
    const [editando, setEditando] = useState(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [menuAberto, setMenuAberto] = useState(null);
    const [busca, setBusca] = useState("");
    const [mostrarFiltro, setMostrarFiltro] = useState(false);
    const [toast, setToast] = useState({ message: "", type: "" });
    const menuRef = useRef(null);

    const mostrarToast = (mensagem, tipo) => {
        setToast({ message: mensagem, type: tipo });
        setTimeout(() => setToast({ message: "", type: "" }), 3000);
    };

    const fetchEquipe = async () => {
        try {
        const res = await axios.get(`${API}/api/equipe`);
        setMembros(res.data);
        } catch (error) {
        console.error(error);
        mostrarToast("Erro ao carregar equipe.", "erro");
        }
    };

    useEffect(() => {
        fetchEquipe();
    }, []);

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuAberto(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFoto(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const regexNome = /^[A-Za-zÀ-ú\s]+$/;
        const regexCargo = /^[A-Za-zÀ-ú0-9\s]+$/;

        if (!nome.trim() || !cargo.trim()) {
        mostrarToast("Preencha todos os campos!", "erro");
        return;
        }

        if (!regexNome.test(nome)) {
        mostrarToast("O nome deve conter apenas letras e acentos.", "erro");
        return;
        }

        if (!regexCargo.test(cargo)) {
        mostrarToast("O cargo só pode conter letras, acentos e números.", "erro");
        return;
        }

        const formData = new FormData();
        formData.append("nome", nome);
        formData.append("cargo", cargo);
        if (foto) formData.append("foto", foto);

        try {
        if (editando) {
            await axios.put(`${API}/api/equipe?id=${editando}`, formData);
            mostrarToast("Membro atualizado com sucesso!", "sucesso");
        } else {
            await axios.post(`${API}/api/equipe`, formData);
            mostrarToast("Membro adicionado com sucesso!", "sucesso");
        }

        setNome("");
        setCargo("");
        setFoto(null);
        setPreview("");
        setEditando(null);
        setModalAberto(false);
        fetchEquipe();
        } catch (error) {
        console.error(error);
        mostrarToast("Erro ao salvar membro. Tente novamente.", "erro");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir este membro?")) {
        try {
            await axios.delete(`${API}/api/equipe?id=${id}`);
            fetchEquipe();
            setMenuAberto(null);
            mostrarToast("Membro excluído com sucesso!", "sucesso");
        } catch (error) {
            console.error(error);
            mostrarToast("Erro ao excluir membro.", "erro");
        }
        }
    };

    const handleEdit = (membro) => {
        setEditando(membro.id);
        setNome(membro.nome);
        setCargo(membro.cargo);
        setPreview(membro.foto);
        setMenuAberto(null);
        setModalAberto(true);
    };

    const handleAbrirNovo = () => {
        setEditando(null);
        setNome("");
        setCargo("");
        setFoto(null);
        setPreview("");
        setModalAberto(true);
    };

    const handleFecharModal = () => {
        setModalAberto(false);
        setEditando(null);
        setNome("");
        setCargo("");
        setFoto(null);
        setPreview("");
    };

    const membrosFiltrados = membros.filter((m) =>
        (m.nome || "").toLowerCase().includes(busca.toLowerCase())
    );

    function getIniciais(nome) {
        if (!nome) return "?";
        const partes = nome.trim().split(" ");
        if (partes.length === 1) return partes[0][0]?.toUpperCase() || "?";
        return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }

    return (
        <div>
             {toast.message && <div className={`toast ${toast.type}`}>{toast.message}</div>}
            <div className="inicio-menug">
                <Link to="/inicio-adm" className="voltar-adm"><IoIosArrowBack />Voltar</Link>
                <div className="titulo-menug">
                    <img src={logo} alt="Logo" />
                    <p>Gestão Site Instituto</p>
                </div>
                
            </div>
            <p className="p-opcoes">Bem-vindo! Escolha uma das opções abaixo a editar:</p>
            <div className="opcoes-menug">
                <Link to="/galeria-gestao">GALERIA</Link> 
                <Link to="/cursos-gestao">CURSOS</Link>                  
            </div>

            {/* ===== SEÇÃO EQUIPE REDESENHADA ===== */}
            <div className="ge-section">
                <div className="ge-header">
                    <div className="ge-header-left">
                        <span className="ge-count">{membrosFiltrados.length}</span>
                        <h2 className="ge-titulo">Equipe</h2>
                    </div>
                    <div className="ge-header-right">
                        <button className="ge-btn-filtro" onClick={() => setMostrarFiltro(!mostrarFiltro)}>
                            <FiFilter /> Filtrar
                        </button>
                        <button className="ge-btn-novo" onClick={handleAbrirNovo}>
                            <FaPlus /> Adicionar Membro
                        </button>
                    </div>
                </div>

                {mostrarFiltro && (
                    <div className="ge-filtro-bar">
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="ge-input"
                        />
                    </div>
                )}

                <div className="ge-grid">
                    {membrosFiltrados.map((membro) => (
                        <div key={membro.id} className="ge-card">
                            <div className="ge-card-top">
                                {membro.foto ? (
                                    <img src={membro.foto} alt={membro.nome} className="ge-card-avatar-img" />
                                ) : (
                                    <div className="ge-card-avatar">{getIniciais(membro.nome)}</div>
                                )}
                                <div className="ge-card-menu-wrapper" ref={menuAberto === membro.id ? menuRef : null}>
                                    <button className="ge-card-menu-btn" onClick={() => setMenuAberto(menuAberto === membro.id ? null : membro.id)}>
                                        <BsThreeDotsVertical />
                                    </button>
                                    {menuAberto === membro.id && (
                                        <div className="ge-dropdown">
                                            <button onClick={() => handleEdit(membro)}>Editar</button>
                                            <button onClick={() => handleDelete(membro.id)} className="ge-dropdown-excluir">Excluir</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="ge-card-info">
                                <p className="ge-card-nome">{membro.nome}</p>
                                <p className="ge-card-cargo">{membro.cargo}</p>
                            </div>
                        </div>
                    ))}
                    {membrosFiltrados.length === 0 && (
                        <p className="ge-vazio">Nenhum membro encontrado.</p>
                    )}
                </div>
            </div>

            {/* ===== MODAL ===== */}
            {modalAberto && (
                <div className="ge-overlay" onClick={handleFecharModal}>
                    <div className="ge-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ge-modal-header">
                            <h2>{editando ? "Editar Funcionário" : "Adicionar Funcionário"}</h2>
                            <button className="ge-modal-fechar" onClick={handleFecharModal}>
                                <IoClose />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="ge-modal-form">
                            <div className="ge-form-group">
                                <label>Nome</label>
                                <input
                                    type="text"
                                    placeholder="Nome do funcionário"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="ge-input"
                                />
                            </div>
                            <div className="ge-form-group">
                                <label>Função</label>
                                <input
                                    type="text"
                                    placeholder="Função do funcionário"
                                    value={cargo}
                                    onChange={(e) => setCargo(e.target.value)}
                                    className="ge-input"
                                />
                            </div>
                            <div className="ge-form-group">
                                <label>Foto</label>
                                <label htmlFor="ge-foto-upload" className="ge-upload-label">
                                    <FiUpload size={18} /> Escolher imagem
                                </label>
                                <input
                                    id="ge-foto-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                                {preview && <img src={preview} alt="preview" className="ge-foto-preview" />}
                                {foto && <p className="ge-nome-arquivo">{foto.name}</p>}
                            </div>
                            <div className="ge-modal-botoes">
                                <button type="button" className="ge-btn-cancelar" onClick={handleFecharModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="ge-btn-salvar">
                                    {editando ? "Salvar" : "Salvar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}