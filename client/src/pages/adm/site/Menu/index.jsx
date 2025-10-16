import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import logo from '../../../../assets/logo2.png';
import './style.css';
import { IoIosArrowBack } from "react-icons/io";
import { FiUpload } from "react-icons/fi";

export default function MenuGestao() {
    
    const API = import.meta.env.VITE_API_URL;
    const [membros, setMembros] = useState([]);
    const [nome, setNome] = useState("");
    const [cargo, setCargo] = useState("");
    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState("");
    const [editando, setEditando] = useState(null);
    const [toast, setToast] = useState({ message: "", type: "" });

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
            await axios.put(`${API}/api/equipe/${editando}`, formData);
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
        fetchEquipe();
        } catch (error) {
        console.error(error);
        mostrarToast("Erro ao salvar membro. Tente novamente.", "erro");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir este membro?")) {
        try {
            await axios.delete(`${API}/api/equipe/${id}`);
            fetchEquipe();
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
        mostrarToast("Modo de edição ativado.", "sucesso");
    };

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
                <Link to="/eventos-gestao">EVENTOS</Link>
                <Link to="/projetos-de-cursos-gestao">PROJETOS E OFICINAS</Link> 
                <Link to="/comunidade-gestao">PROJETOS SOCIAIS E VOLUNTARIADO</Link>   
                <Link to="/cursos-gestao">CURSOS</Link>                  
            </div>

            <div className="gestao-equipe">
                 <h2>Gerenciar Equipe</h2>

                <form className="form-equipe" onSubmit={handleSubmit}>
                    <input
                    type="text"
                    placeholder="Nome Completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    />
                    <input
                    type="text"
                    placeholder="Cargo"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    />
                    <label htmlFor="foto" className="label-foto">
                        <FiUpload size={18} style={{ marginRight: "8px" }} />Escolher imagem
                    </label>
                    <input
                        id="foto"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />

                    {preview && (
                    <img
                        src={preview}
                        alt="preview"
                        style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        margin: "10px auto",
                        display: "block",
                        }}
                    />
                    )}
                    {foto && <p className="nome-arquivo">📁 {foto.name}</p>}

                    <button type="submit">
                    {editando ? "Salvar alterações" : "Adicionar membro"}
                    </button>
                </form>

                <div className="lista-equipe">
                    {membros.map((membro) => (
                    <div key={membro.id} className="card-equipe-admin">
                        <img src={membro.foto} alt={membro.nome} />
                        <div>
                        <p><strong>{membro.nome}</strong></p>
                        <p>{membro.cargo}</p>
                        </div>
                        <div className="acoes">
                        <button onClick={() => handleEdit(membro)}>Editar</button>
                        <button onClick={() => handleDelete(membro.id)}>Excluir</button>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    );
}