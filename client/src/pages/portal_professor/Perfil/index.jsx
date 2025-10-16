import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../contexts/auth";
import { db } from "../../../services/firebaseConnection";
import { collection, query, where, getDocs } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import axios from "axios";
import { toast } from "react-toastify";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import "./style.css";

export default function Perfil() {
  const { user } = useContext(AuthContext);
  const [perfil, setPerfil] = useState(null);
  const [novaFoto, setNovaFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);


  const CLOUD_NAME = "dfbreo0qd"; 
  const UPLOAD_PRESET = "plataforma_dom_bosco"; 
 
  useEffect(() => {
    const carregarPerfil = async () => {
      if (!user?.email) return;
      try {
        const q = query(collection(db, "usuarios"), where("email", "==", user.email));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setPerfil(snapshot.docs[0].data());
        } else {
          toast.warn("Perfil não encontrado no banco.");
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        toast.error("Erro ao carregar dados do perfil.");
      }
    };
    carregarPerfil();
  }, [user]);

  
  
  async function handleAtualizarFoto() {
  if (!novaFoto) return toast.info("Selecione uma imagem primeiro.");
  setLoading(true);
  try {
    const CLOUD_NAME = "dfbreo0qd";
    const UPLOAD_PRESET = "plataforma_dom_bosco";

    const formData = new FormData();
    formData.append("file", novaFoto);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );

    console.log("✅ Upload Cloudinary:", response.data);
    const imageUrl = response.data.secure_url;
    toast.success("Imagem enviada com sucesso!");
  } catch (error) {
    console.error("❌ Erro no upload Cloudinary:", error.response?.data || error);
    toast.error("Erro no upload. Verifique o preset no Cloudinary.");
  } finally {
    setLoading(false);
  }
}

  
  async function handleAlterarSenha() {
    if (novaSenha.length < 6) {
      toast.warn("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    try {
      await updatePassword(user, novaSenha);
      setNovaSenha("");
      toast.success("Senha alterada com sucesso!");
    } catch (err) {
      console.error("Erro ao alterar senha:", err);
      toast.error("Erro ao alterar senha. Faça login novamente e tente de novo.");
    }
  }

  if (!perfil) {
    return (
      <div className="layout">
        <MenuLateralAluno />
        <div className="page2">
          <main>
            <MenuTopoAluno />
            <p>Carregando perfil...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <MenuLateralAluno />
      <div className="page2">
        <main>
          <MenuTopoAluno />
          <div className="perfil-container">
            <div className="perfil-foto">
              <img
                src={preview || perfil.foto || "/src/assets/user-placeholder.png"}
                alt="Foto do usuário"
                className="foto-circulo"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setNovaFoto(file);
                    setPreview(URL.createObjectURL(file));
                  }
                }}
              />
              <button
                disabled={!novaFoto || loading}
                onClick={handleAtualizarFoto}
                className="btn-salvar"
              >
                {loading ? "Enviando..." : "Salvar nova foto"}
              </button>
            </div>

            <div className="perfil-info">
              <p><strong>Nome:</strong> {perfil.nome}</p>
              <p><strong>E-mail:</strong> {perfil.email}</p>

              <div className="alterar-senha">
                <h3>Alterar Senha</h3>
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                />
                <button onClick={handleAlterarSenha} className="btn-salvar">
                  Atualizar senha
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
