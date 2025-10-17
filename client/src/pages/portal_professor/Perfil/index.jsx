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
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import axios from "axios";
import { toast } from "react-toastify";

import { FiCamera } from "react-icons/fi";
import { IoEye, IoEyeOff } from "react-icons/io5";
import "./style.css";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";

export default function Perfil() {
  const { user } = useContext(AuthContext);
  const [perfil, setPerfil] = useState(null);
  const [novaFoto, setNovaFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
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

 
  async function handleAlterarSenha() {
    const auth = getAuth(); 
    const currentUser = auth.currentUser;

    if (!currentUser) {
      toast.error("Erro: usuário não autenticado.");
      return;
    }

    if (novaSenha.length < 6) {
      toast.warn("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!senhaAtual) {
      toast.warn("Digite sua senha atual para confirmar.");
      return;
    }

    try {
      const cred = EmailAuthProvider.credential(currentUser.email, senhaAtual);
      await reauthenticateWithCredential(currentUser, cred); 
      await updatePassword(currentUser, novaSenha); 

      setSenhaAtual("");
      setNovaSenha("");
      toast.success("Senha alterada com sucesso!");
    } catch (err) {
      console.error("Erro ao alterar senha:", err);

      if (err.code === "auth/wrong-password") {
        toast.error("Senha atual incorreta.");
      } else if (err.code === "auth/requires-recent-login") {
        toast.error("Por segurança, faça login novamente e tente de novo.");
      } else if (err.code === "auth/invalid-credential") {
        toast.error("Credenciais inválidas. Faça login novamente.");
      } else {
        toast.error("Erro ao alterar senha. Tente novamente.");
      }
    }
  }

  if (!perfil) {
    return (
      <div className="layout">
        <MenuLateralProfessor />
        <div className="page2">
          <main>
            <MenuTopoProfessor />
            <p>Carregando perfil...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <MenuLateralProfessor />
      <div className="page2">
        <main>
          <MenuTopoProfessor />
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

              <div className="alterar-senha">
                <h3>Alterar Senha</h3>

               
                <div className="senha-wrapper">
                  <input
                    type={mostrarSenhaAtual ? "text" : "password"}
                    placeholder="Senha atual"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-mostrar-senha"
                    onClick={() =>
                      setMostrarSenhaAtual((prev) => !prev)
                    }
                  >
                    {mostrarSenhaAtual ? <IoEyeOff /> : <IoEye />}
                  </button>
                </div>

                
                <div className="senha-wrapper">
                  <input
                    type={mostrarNovaSenha ? "text" : "password"}
                    placeholder="Nova senha"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-mostrar-senha"
                    onClick={() => setMostrarNovaSenha((prev) => !prev)}
                  >
                    {mostrarNovaSenha ? <IoEyeOff /> : <IoEye />}
                  </button>
                </div>

                <button
                  onClick={handleAlterarSenha}
                  className="btn-salvar-foto"
                >
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
