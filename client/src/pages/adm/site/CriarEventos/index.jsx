import { useState, useEffect } from "react";
import axios from "axios";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { FiUpload } from "react-icons/fi";
import { FaCalendarAlt } from "react-icons/fa";
import "./style.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";


export default function CriarEventoGestao() {
  
    const API = import.meta.env.VITE_API_URL;
    const [contagemPalavras, setContagemPalavras] = useState(0);

    const navigate = useNavigate();
    const [form, setForm] = useState({
        titulo: "",
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
        temInscricao: false,
        linkInscricao: "",
        descricao: "",
        dataHora: "",
    });
    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);
    const [toast, setToast] = useState(null);
    const [params] = useSearchParams();
    const id = params.get("id");

  
  useEffect(() => {
    if (id) {
      const fetchEvento = async () => {
        try {
          const res = await axios.get(`${API}/api/eventos`);
          const evento = res.data.find((e) => e.id === id);
          if (evento) {
            let dataFormatada = "";
            if (evento.dataHora?._seconds) {
              dataFormatada = new Date(evento.dataHora._seconds * 1000)
                .toISOString()
                .slice(0, 16);
            } else if (evento.dataHora) {
              dataFormatada = evento.dataHora;
            }

            setForm({
              titulo: evento.titulo || "",
              rua: evento.rua || "",
              numero: evento.numero || "",
              bairro: evento.bairro || "",
              cidade: evento.cidade || "",
              estado: evento.estado || "",
              cep: evento.cep || "",
              temInscricao: Boolean(evento.temInscricao),
              linkInscricao: evento.linkInscricao || "",
              descricao: evento.descricao || "",
              dataHora: dataFormatada,
            });

            setPreview(evento.imagemUrl || null);
          }
        } catch (error) {
          console.error("Erro ao carregar evento:", error);
        }
      };

      fetchEvento();
    }
  }, [id]);

  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    
    if (name === "cep") {
      val = val.replace(/\D/g, ""); 
      if (val.length > 5) val = val.slice(0, 5) + "-" + val.slice(5, 8);
    }

    setForm({ ...form, [name]: val });

    
    if (name === "cep" && val.length === 9) {
      buscarCep(val);
    }
  };

  
  const buscarCep = async (cep) => {
    try {
      const res = await axios.get(`https://viacep.com.br/ws/${cep.replace("-", "")}/json/`);
      if (!res.data.erro) {
        setForm((prev) => ({
          ...prev,
          rua: res.data.logradouro || prev.rua,
          bairro: res.data.bairro || prev.bairro,
          cidade: res.data.localidade || prev.cidade,
          estado: res.data.uf || prev.estado,
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    setImagem(file);
    setPreview(URL.createObjectURL(file));
  };

  
  const validarFormulario = () => {
    const regexTitulo = /^[A-Za-zÀ-ÿ0-9\s]+$/;
    const regexLetras = /^[A-Za-zÀ-ÿ\s]+$/;
    const regexNumeros = /^[0-9]+$/;
    const regexCEP = /^[0-9]{5}-[0-9]{3}$/;

    if (!form.titulo || !regexTitulo.test(form.titulo)) {
      return "Título inválido (somente letras, números e acentos)";
    }
    if (!id && !imagem) {
      return "Selecione uma imagem";
    }
    if (!form.cep || !regexCEP.test(form.cep)) {
      return "CEP inválido (use o formato 00000-000)";
    }
    if (!form.rua || !regexLetras.test(form.rua)) {
      return "Rua inválida (somente letras e acentos)";
    }
    if (!form.numero || !regexNumeros.test(form.numero)) {
      return "Número inválido (somente números)";
    }
    if (!form.bairro || !regexLetras.test(form.bairro)) {
      return "Bairro inválido (somente letras e acentos)";
    }
    if (!form.cidade || !regexLetras.test(form.cidade)) {
      return "Cidade inválida (somente letras e acentos)";
    }
    if (!form.estado || !regexLetras.test(form.estado)) {
      return "Estado inválido (somente letras e acentos)";
    }

    if (form.temInscricao && !form.linkInscricao.trim()) {
      return "Link de inscrição não pode ser vazio";
    }
    if (!form.descricao || form.descricao.trim().split(/\s+/).length < 15) {
      return "Descrição deve conter no mínimo 15 palavras";
    }
    if (!form.dataHora) {
      return "Informe a data e hora do evento";
    }
    return null;
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const erro = validarFormulario();
    if (erro) {
      mostrarToast(erro, "erro");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (imagem) data.append("imagem", imagem);

    try {
      if (id) {
        await axios.put(`${API}/api/eventos/${id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        mostrarToast("Evento atualizado com sucesso!", "sucesso");
      } else {
        await axios.post("http://localhost:5000/api/eventos", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        mostrarToast("Evento criado com sucesso!", "sucesso");
      }

      setTimeout(() => {
        navigate("/eventos-gestao");
      }, 2500);
    } catch (error) {
      console.error(error);
      mostrarToast("Erro ao salvar evento!", "erro");
    }
  };

  
  const mostrarToast = (mensagem, tipo) => {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="criar-evento-container">
      <Link to="/eventos-gestao" className="voltar-para-menu">
        <IoIosArrowBack /> Voltar
      </Link>
      <h1 className="h1-eventos">{id ? "Editar Evento" : "Criar Evento"}</h1>

      <form onSubmit={handleSubmit} className="form-evento">
        <input name="titulo" placeholder="Título" value={form.titulo} onChange={handleChange} required />

        <label htmlFor="file-upload" className="upload-label-evento">
          <FiUpload size={20} />
          {imagem ? imagem.name : id ? "Trocar imagem" : "Escolher foto"}
        </label>
        <input id="file-upload" type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        {preview && <img src={preview} alt="Prévia" className="preview-img-evento" />}
        
        <input name="cep" placeholder="CEP (00000-000)" value={form.cep} onChange={handleChange} />   
        <input name="rua" placeholder="Rua" value={form.rua} onChange={handleChange} />
        <input name="numero" placeholder="Número" value={form.numero} onChange={handleChange} />
        <input name="bairro" placeholder="Bairro" value={form.bairro} onChange={handleChange} />
        <input name="cidade" placeholder="Cidade" value={form.cidade} onChange={handleChange} />
        <input name="estado" placeholder="Estado" value={form.estado} onChange={handleChange} />
        

        <label className="tem-inscricao">
          <input type="checkbox" name="temInscricao" checked={form.temInscricao} onChange={handleChange} />
          <span className="slider"></span>
          <span className="label-text">Possui inscrição?</span>
        </label>

        {form.temInscricao && (
          <input
            name="linkInscricao"
            placeholder="Link da inscrição"
            value={form.linkInscricao}
            onChange={handleChange}
          />
        )}

        <div className="descricao-container">
            <textarea
                name="descricao"
                placeholder="Descrição (mínimo 15 palavras)"
                value={form.descricao}
                onChange={(e) => {
                handleChange(e);
                const texto = e.target.value.trim();
                const palavras = texto === "" ? 0 : texto.split(/\s+/).length;
                setContagemPalavras(palavras);
                }}
            ></textarea>

            <p
                className={`contador-palavras ${
                contagemPalavras >= 15 ? "ok" : "incompleto"
                }`}
            >
                {contagemPalavras} / 15 palavras
            </p>
        </div>


        <div className="campo-data-hora">            
            <DatePicker
                selected={form.dataHora ? new Date(form.dataHora.replace("T", " ")) : null}

                onChange={(date) => {
                  if (!date) return;
                  const local = date.toLocaleString("sv-SE", { hour12: false }).slice(0, 16);
                  setForm((prev) => ({ ...prev, dataHora: local }));
                }}



                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="Selecione a data e hora"
                locale={ptBR}
                className="input-datepicker"
            />
        
        </div>



        <button className="button-criar-evento" type="submit">
          {id ? "Salvar Alterações" : "Criar Evento"}
        </button>
      </form>

      {toast && <div className={`toast ${toast.tipo}`}>{toast.mensagem}</div>}
    </div>
  );
}
