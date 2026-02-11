import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../contexts/auth";
import { db } from "../../../services/firebaseConnection";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MenuLateralAluno from "../../../components/portais/MenuLateralAluno";
import MenuTopoAluno from "../../../components/portais/MenuTopoAluno";
import { FiCamera } from "react-icons/fi";
import "./style.css";

export default function Perfil() {
  const { user } = useContext(AuthContext);
  const [perfil, setPerfil] = useState(null);
  const [novaFoto, setNovaFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const CLOUD_NAME = "dfbreo0qd";
  const UPLOAD_PRESET = "plataforma_dom_bosco";

  
  useEffect(() => {
    const carregarPerfil = async () => {
      if (!user?.email) return;
      try {
        const q = query(
          collection(db, "usuarios"),
          where("email", "==", user.email)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docRef = snapshot.docs[0];
          setPerfil({ id: docRef.id, ...docRef.data() });
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
      const formData = new FormData();
      formData.append("file", novaFoto);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );

      const imageUrl = response.data.secure_url;
      const userQuery = query(
        collection(db, "usuarios"),
        where("email", "==", user.email)
      );
      const snapshot = await getDocs(userQuery);

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const ref = doc(db, "usuarios", userDoc.id);
        await updateDoc(ref, { foto: imageUrl });
        setPerfil((prev) => ({ ...prev, foto: imageUrl }));

        
        const hoje = new Date().toDateString();
        const chaveDiaria = `${user.uid}-foto-${hoje}`;

        
        toast.success("Foto atualizada com sucesso!");
      } else {
        toast.error("Usuário não encontrado no banco.");
      }

      setNovaFoto(null);
      setPreview(null);
    } catch (error) {
      console.error("❌ Erro no upload Cloudinary:", error);
      toast.error("Erro ao atualizar foto.");
    } finally {
      setLoading(false);
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
              <div className="foto-wrapper">
                <img
                  src={
                    preview || perfil.foto || "/src/assets/user-placeholder.png"
                  }
                  alt="Foto do usuário"
                  className="foto-circulo"
                />
                <label className="camera-overlay">
                  <FiCamera size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    data-testid="upload-foto"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setNovaFoto(file);
                        setPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              </div>

              {novaFoto && (
                <button
                  disabled={loading}
                  onClick={handleAtualizarFoto}
                  className="btn-salvar-foto"
                >
                  {loading ? "Enviando..." : "Salvar nova foto"}
                </button>
              )}
            </div>

           
            <div className="perfil-info">
              <p>
                <strong>Nome:</strong> {perfil.nome}
              </p>
              <p>
                <strong>E-mail:</strong> {perfil.email}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
