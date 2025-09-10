import { Routes, Route } from 'react-router-dom'

import Login from '../pages/Login';
import Inicio from '../pages/site/Inicio';
import Sobre from '../pages/site/Sobre';
import Galeria from '../pages/site/Galeria';
import Educacao from '../pages/site/Educacao';
import CursosDetalhes from '../pages/site/CursosDetalhes';
import ProjetosCursos from '../pages/site/ProjetosCursos';
import Comunidade from '../pages/site/Comunidade';
import Eventos from '../pages/site/Eventos';
import ProximosEventos from '../pages/site/ProximosEventos';
import EventosDetalhes from '../pages/site/EventosDetalhes';
import Contato from '../pages/site/Contato';

import Private from './private';

import InicioAluno from '../pages/portal_aluno/Inicio';
import AgendaAluno from '../pages/portal_aluno/Agenda';
import VideosAluno from '../pages/portal_aluno/Videos';
import VideosDetalhesAluno from '../pages/portal_aluno/VideosDetalhes';
import NotasAluno from '../pages/portal_aluno/Notas';
import DocumentosAluno from '../pages/portal_aluno/Documentos';
import AjudaAluno from '../pages/portal_aluno/Ajuda';
import AvisosAluno from '../pages/portal_aluno/Avisos';
import PerfilAluno from '../pages/portal_aluno/Perfil';
import TurmaAluno from '../pages/portal_aluno/Turma';
import AtividadesAluno from '../pages/portal_aluno/Atividades';
import AtivDetalheAluno from '../pages/portal_aluno/AtivDetalhe';
import AlunosAluno from '../pages/portal_aluno/Alunos';

import InicioAdm from '../pages/adm/Inicio';

import InicioProfessor from '../pages/adm/portal_professor/Inicio';
import AgendaProfessor from '../pages/adm/portal_professor/Agenda';
import VideosProfessor from '../pages/adm/portal_professor/Videos';
import VideosDetalhesProfessor from '../pages/adm/portal_professor/DetalhesVideo';
import AddVideos from '../pages/adm/portal_professor/AddVideos';
import NotasProfessor from '../pages/adm/portal_professor/Notas';
import DocumentosProfessor from '../pages/adm/portal_professor/Documentos';
import AjudaProfessor from '../pages/adm/portal_professor/Ajuda';
import AvisosProfessor from '../pages/adm/portal_professor/Avisos';
import PostAvisosProfessor from '../pages/adm/portal_professor/PostAvisos';
import PerfilProfessor from '../pages/adm/portal_professor/Perfil';
import TurmaProfessor from '../pages/adm/portal_professor/Turma';
import AddAtividadeProfessor from '../pages/adm/portal_professor/AddAtividade';
import AtividadesProfessor from '../pages/adm/portal_professor/Atividades';
import AtivDetalheProfessor from '../pages/adm/portal_professor/AtivDetalhes';
import AlunosProfessor from '../pages/adm/portal_professor/Alunos';



function RoutesApp(){
  return(
    <Routes>
      <Route path="/" element={<Inicio/>}/>

      <Route path="/sobre" element={<Sobre/>}/>

      <Route path="/galeria" element={<Galeria/>}/>

      <Route path="/educacao" element={<Educacao/>}/>

      <Route path="/detalhes-curso" element={<CursosDetalhes/>}/>

      <Route path="/projetos&oficinas" element={<ProjetosCursos/>}/>

      <Route path="/comunidade" element={<Comunidade/>}/>

      <Route path="/eventos" element={<Eventos/>}/>

      <Route path="/proximos-eventos" element={<ProximosEventos/>}/>

      <Route path="/detalhes-evento" element={<EventosDetalhes/>}/>

      <Route path="/contato" element={<Contato/>}/>

      <Route path="/login" element={ <Login/> } />
      
      <Route path="/cardapio" element={ <Private><Cardapio/></Private> } />
    
    </Routes>
  )
}

export default RoutesApp;