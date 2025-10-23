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
import Usuarios from '../pages/adm/portais/Usuarios';
import MenuPortais from '../pages/adm/portais/Menu';

import InicioProfessor from '../pages/portal_professor/Inicio';
import AgendaProfessor from '../pages/portal_professor/Agenda';
import VideosProfessor from '../pages/portal_professor/Videos';
import VideosDetalhesProfessor from '../pages/portal_professor/DetalhesVideo';
import AddVideos from '../pages/portal_professor/AddVideos';
import EditarVideo from '../pages/portal_professor/EditarVideo';
import NotasProfessor from '../pages/portal_professor/Notas';
import DocumentosProfessor from '../pages/portal_professor/Documentos';
import AjudaProfessor from '../pages/portal_professor/Ajuda';
import AvisosProfessor from '../pages/portal_professor/Avisos';
import PostAvisosProfessor from '../pages/portal_professor/PostAvisos';
import PerfilProfessor from '../pages/portal_professor/Perfil';
import TurmaProfessor from '../pages/portal_professor/Turma';
import AddAtividadeProfessor from '../pages/portal_professor/AddAtividade';
import AtividadesProfessor from '../pages/portal_professor/Atividades';
import AtivDetalheProfessor from '../pages/portal_professor/AtivDetalhes';
import AlunosProfessor from '../pages/portal_professor/Alunos';

import InicioRefeicao from '../pages/adm/refeicao/Inicio';
import AdicionarRefeicao from '../pages/adm/refeicao/Adicionar';
import ContarRefeicao from '../pages/adm/refeicao/Contar';
import RelatoriosRefeicao from '../pages/adm/refeicao/Relatorios';
import RegistrosRefeicao from '../pages/adm/refeicao/Registros';

import MenuGestao from '../pages/adm/site/Menu';
import GaleriaGestao from '../pages/adm/site/Galeria';
import EventosGestao from '../pages/adm/site/Eventos';
import CriarEventos from '../pages/adm/site/CriarEventos';
import ProjetosCursosGestao from '../pages/adm/site/ProjetosCursos';
import ComunidadeGestao from '../pages/adm/site/Comunidade';
import CursosGestao from '../pages/adm/site/Cursos';
import CriarCurso from '../pages/adm/site/CriarCurso';
import EditarCurso from '../pages/adm/site/EditarCurso';
import DetalhesCurso from "../pages/adm/site/DetalhesCurso";



function RoutesApp(){
  return(
    <Routes>
      <Route path="/login" element={ <Login/> } />  
      <Route path="/" element={<Inicio/>}/>
      <Route path="/sobre" element={<Sobre/>}/>
      <Route path="/galeria" element={<Galeria/>}/>
      <Route path="/educacao" element={<Educacao/>}/>
      <Route path="/detalhes-curso/:id" element={<CursosDetalhes/>}/>
      <Route path="/projetos&oficinas" element={<ProjetosCursos/>}/>
      <Route path="/comunidade" element={<Comunidade/>}/>
      <Route path="/eventos" element={<Eventos/>}/>
      <Route path="/proximos-eventos" element={<ProximosEventos/>}/>
      <Route path="/detalhes-evento/:id" element={<EventosDetalhes/>}/>
      <Route path="/contato" element={<Contato/>}/>  

      <Route path="/inicio-adm" element={ <Private rota="admin"><InicioAdm/></Private> } />
      <Route path="/gestao-portais" element={ <Private rota="admin"><MenuPortais/></Private> } />
      <Route path="/usuarios" element={ <Private rota="admin"><Usuarios/></Private> } />

      <Route path="/inicio-refeicao" element={ <Private rota="admin"><InicioRefeicao/></Private> } />
      <Route path="/adicionar-refeicao" element={ <Private rota="admin"><AdicionarRefeicao/></Private> } />
      <Route path="/contar-refeicao" element={ <Private rota="admin"><ContarRefeicao/></Private> } />
      <Route path="/relatorios-refeicao" element={ <Private rota="admin"><RelatoriosRefeicao/></Private> } />
      <Route path="/registros-refeicao" element={ <Private rota="admin"><RegistrosRefeicao/></Private> } />

      <Route path="/menu-gestao" element={ <Private rota="admin"><MenuGestao/></Private> } />
      <Route path="/galeria-gestao" element={ <Private rota="admin"><GaleriaGestao/></Private> } />
      <Route path="/eventos-gestao" element={ <Private rota="admin"><EventosGestao/></Private> } /> 
      <Route path="/criar-evento" element={ <Private rota="admin"><CriarEventos/></Private> } />     
      <Route path="/projetos-de-cursos-gestao" element={ <Private rota="admin"><ProjetosCursosGestao/></Private> } />
      <Route path="/comunidade-gestao" element={ <Private rota="admin"><ComunidadeGestao/></Private> } />
      <Route path="/cursos-gestao" element={ <Private rota="admin"><CursosGestao/></Private> } />
      <Route path="/criar-curso" element={ <Private rota="admin"><CriarCurso/></Private> } />
      <Route path="/editar-curso/:id" element={<EditarCurso />} />
      <Route path="/detalhes-curso-gestao/:id" element={<DetalhesCurso />} />

      <Route path="/aluno/inicio" element={ <Private rota="aluno"><InicioAluno/></Private> } />
      <Route path="/aluno/agenda" element={ <Private rota="aluno"><AgendaAluno/></Private> } />
      <Route path="/aluno/videos" element={ <Private rota="aluno"><VideosAluno/></Private> } />
      <Route path="/aluno/videos/:id" element={ <Private rota="aluno"><VideosDetalhesAluno/></Private> } />
      <Route path="/aluno/notas" element={ <Private rota="aluno"><NotasAluno/></Private> } />
      <Route path="/aluno/documentos" element={ <Private rota="aluno"><DocumentosAluno/></Private> } />
      <Route path="/aluno/ajuda" element={ <Private rota="aluno"><AjudaAluno/></Private> } />
      <Route path="/aluno/avisos" element={ <Private rota="aluno"><AvisosAluno/></Private> } />
      <Route path="/aluno/perfil" element={ <Private rota="aluno"><PerfilAluno/></Private> } />
      <Route path="/aluno/turma" element={ <Private rota="aluno"><TurmaAluno/></Private> } />
      <Route path="/aluno/atividades" element={ <Private rota="aluno"><AtividadesAluno/></Private> } />
      <Route path="/aluno/detalhes-ativ" element={ <Private rota="aluno"><AtivDetalheAluno/></Private> } />
      <Route path="/aluno/alunos-turma" element={ <Private rota="aluno"><AlunosAluno/></Private> } />

      <Route path="/professor/inicio" element={ <Private rota="professor"><InicioProfessor/></Private> } />
      <Route path="/professor/agenda" element={ <Private rota="professor"><AgendaProfessor/></Private> } />
      <Route path="/professor/videos" element={ <Private rota="professor"><VideosProfessor/></Private> } />
      <Route path="/professor/videos/:id" element={ <Private rota="professor"><VideosDetalhesProfessor/></Private> } />
      <Route path="/professor/editar-video/:id" element={<Private rota="professor"><EditarVideo/></Private>} />
      <Route path="/add-videos-professor" element={ <Private rota="professor"><AddVideos/></Private> } />
      <Route path="/professor/notas" element={ <Private rota="professor"><NotasProfessor/></Private> } />
      <Route path="/professor/documentos" element={ <Private rota="professor"><DocumentosProfessor/></Private> } />
      <Route path="/professor/ajuda" element={ <Private rota="professor"><AjudaProfessor/></Private> } />
      <Route path="/professor/avisos" element={ <Private rota="professor"><AvisosProfessor/></Private> } />
      <Route path="/add-avisos-professor" element={ <Private rota="professor"><PostAvisosProfessor/></Private> } />
      <Route path="/professor/perfil" element={ <Private rota="professor"><PerfilProfessor/></Private> } />
      <Route path="/professor/turma" element={ <Private rota="professor"><TurmaProfessor/></Private> } />
      <Route path="/add-atividade-professor" element={ <Private rota="professor"><AddAtividadeProfessor/></Private> } />
      <Route path="/professor/atividades" element={ <Private rota="professor"><AtividadesProfessor/></Private> } />
      <Route path="/professor/detalhes-ativ" element={ <Private rota="professor"><AtivDetalheProfessor/></Private> } />
      <Route path="/professor/alunos-turma" element={ <Private rota="professor"><AlunosProfessor/></Private> } />
           

    
    </Routes>
  )
}

export default RoutesApp;