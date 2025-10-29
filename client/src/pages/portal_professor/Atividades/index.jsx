import { useContext, useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaFolder } from "react-icons/fa";
import { VscKebabVertical } from "react-icons/vsc";
import { collection, getDocs, query, where } from "firebase/firestore";
import MenuLateralProfessor from "../../../components/portais/MenuLateralProfessor";
import MenuTopoProfessor from "../../../components/portais/MenuTopoProfessor";
import { db } from "../../../services/firebaseConnection";
import { AuthContext } from "../../../contexts/auth";
import './style.css';

export default function Atividades() {
  const { user } = useContext(AuthContext);
  const [carregando, setCarregando] = useState(true);
  const [atividades, setAtividades] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const fetch = async () => {
      try {
        setCarregando(true);
        let turmaCodigo = null;
        try { turmaCodigo = localStorage.getItem('lastTurmaCodigo'); } catch {}
        if (!turmaCodigo) {
          setAtividades([]);
          return;
        }
        const q = query(
          collection(db, "atividade"),
          where("usuarioId", "==", user.uid),
          where("turmaCodigo", "==", turmaCodigo)
        );
        const snap = await getDocs(q);
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAtividades(lista);
      } catch (e) {
        console.error("Erro ao listar atividades:", e);
      } finally {
        setCarregando(false);
      }
    };
    fetch();
  }, [user]);

  const grupos = useMemo(() => {
    const map = new Map();
    atividades.forEach((a) => {
      const key = a.conteudo || "Sem conteúdo";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    });
    for (const [, arr] of map.entries()) {
      arr.sort((x, y) => {
        const dx = x?.entrega?.toDate ? x.entrega.toDate().getTime() : new Date(x?.entrega || 0).getTime();
        const dy = y?.entrega?.toDate ? y.entrega.toDate().getTime() : new Date(y?.entrega || 0).getTime();
        return dx - dy;
      });
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [atividades]);

  const formatPrazo = (ts) => {
    try {
      const d = ts?.toDate ? ts.toDate() : new Date(ts);
      if (!d || isNaN(d)) return "00/00/00 - 00h";
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = String(d.getFullYear()).slice(-2);
      const hh = String(d.getHours()).padStart(2, '0');
      return `${dd}/${mm}/${yy} - ${hh}h`;
    } catch {
      return "00/00/00 - 00h";
    }
  };

  return (
    <div className="layout">
      <MenuLateralProfessor />  
      <div className="page2">
        <main id="sala">
            <MenuTopoProfessor/>
          <div className="menu-turma">
            {(() => {
              let last = null; try { last = localStorage.getItem('lastTurmaCodigo'); } catch {}
              const to = last ? `/professor/turma/${last}` : "/professor/turma";
              return <NavLink to={to}>Painel</NavLink>;
            })()}
            <NavLink to="/professor/atividades">Todas as atividades</NavLink>
            <NavLink to="/professor/alunos-turma">Alunos</NavLink>
          </div>
          <div className="add-atividade-area">
            <NavLink to="/add-atividade-professor" className="add-atividade-box">
              + Adicionar atividade
            </NavLink>
          </div>

          {carregando ? (
            <p className="info">Carregando atividades...</p>
          ) : grupos.length === 0 ? (
            <p className="info">Nenhuma atividade encontrada para a turma selecionada.</p>
          ) : (
            grupos.map(([conteudo, itens]) => (
              <section key={conteudo} className="grupo-conteudo">
                <h3 className="titulo-conteudo">{conteudo}</h3>
                {itens.map((a) => (
                  <Link key={a.id} to="/professor/detalhes-ativ" className="atividade">
                    <FaFolder className="folder" />
                    <div>
                      <h4>{a.tituloAtividade || "Título Atividade"}</h4>
                      <p>Prazo {formatPrazo(a.entrega)}</p>
                    </div>
                    <VscKebabVertical />
                  </Link>
                ))}
              </section>
            ))
          )}
        </main>
      </div>
    </div>
  );
}