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

// import InicioAluno from '../pages/portal_aluno/Inicio';
// import AgendaAluno from '../pages/portal_aluno/Agenda';
// import VideosAluno from '../pages/portal_aluno/Videos';
// import VideosDetalhesAluno from '../pages/portal_aluno/VideosDetalhes';
// import NotasAluno from '../pages/portal_aluno/Notas';
// import DocumentosAluno from '../pages/portal_aluno/Documentos';
// import AjudaAluno from '../pages/portal_aluno/Ajuda';
// import AvisosAluno from '../pages/portal_aluno/Avisos';
// import PerfilAluno from '../pages/portal_aluno/Perfil';
// import TurmaAluno from '../pages/portal_aluno/Turma';
// import AtividadesAluno from '../pages/portal_aluno/Atividades';
// import AtivDetalheAluno from '../pages/portal_aluno/AtivDetalhe';
// import AlunosAluno from '../pages/portal_aluno/Alunos';

import InicioAdm from '../pages/adm/Inicio';

// import InicioProfessor from '../pages/adm/portal_professor/Inicio';
// import AgendaProfessor from '../pages/adm/portal_professor/Agenda';
// import VideosProfessor from '../pages/adm/portal_professor/Videos';
// import VideosDetalhesProfessor from '../pages/adm/portal_professor/DetalhesVideo';
// import AddVideos from '../pages/adm/portal_professor/AddVideos';
// import NotasProfessor from '../pages/adm/portal_professor/Notas';
// import DocumentosProfessor from '../pages/adm/portal_professor/Documentos';
// import AjudaProfessor from '../pages/adm/portal_professor/Ajuda';
// import AvisosProfessor from '../pages/adm/portal_professor/Avisos';
// import PostAvisosProfessor from '../pages/adm/portal_professor/PostAvisos';
// import PerfilProfessor from '../pages/adm/portal_professor/Perfil';
// import TurmaProfessor from '../pages/adm/portal_professor/Turma';
// import AddAtividadeProfessor from '../pages/adm/portal_professor/AddAtividade';
// import AtividadesProfessor from '../pages/adm/portal_professor/Atividades';
// import AtivDetalheProfessor from '../pages/adm/portal_professor/AtivDetalhes';
// import AlunosProfessor from '../pages/adm/portal_professor/Alunos';
// import ChamadaProfessor from '../pages/adm/portal_professor/Chamada';
// import TodasChamadasProfessor from '../pages/adm/portal_professor/TodasChamadas';

import InicioRefeicao from '../pages/adm/refeicao/Inicio';
import AdicionarRefeicao from '../pages/adm/refeicao/Adicionar';
import UploadRefeicao from '../pages/adm/refeicao/Upload';
import RelatoriosRefeicao from '../pages/adm/refeicao/Relatorios';
import RegistrosRefeicao from '../pages/adm/refeicao/Registros';

import MenuGestao from '../pages/adm/site/Menu';
import GaleriaGestao from '../pages/adm/site/Galeria';
import EventosGestao from '../pages/adm/site/Eventos';
import CriarEventoGestao from '../pages/adm/site/CriarEvento';
import ProjetosCursosGestao from '../pages/adm/site/ProjetosCursos';
import CriarProjetosCursosGestao from '../pages/adm/site/CriarProjetosCursos';
import ComunidadeGestao from '../pages/adm/site/Comunidade';
import CriarProjetosGestao from '../pages/adm/site/CriarProjetos';
import CursosGestao from '../pages/adm/site/Cursos';
import CursosDetalhesGestao from '../pages/adm/site/CursosDetalhes';


function RoutesApp(){
  return(
    <Routes>
      <Route path="/login" element={ <Login/> } />  
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

      <Route path="/inicio-adm" element={ <Private rota="admin"><InicioAdm/></Private> } />

      <Route path="/inicio-refeicao" element={ <Private rota="admin"><InicioRefeicao/></Private> } />
      <Route path="/adicionar-refeicao" element={ <Private rota="admin"><AdicionarRefeicao/></Private> } />
      <Route path="/upload-refeicao" element={ <Private rota="admin"><UploadRefeicao/></Private> } />
      <Route path="/relatorios-refeicao" element={ <Private rota="admin"><RelatoriosRefeicao/></Private> } />
      <Route path="/registros-refeicao" element={ <Private rota="admin"><RegistrosRefeicao/></Private> } />

      <Route path="/menu-gestao" element={ <Private rota="admin"><MenuGestao/></Private> } />
      <Route path="/galeria-gestao" element={ <Private rota="admin"><GaleriaGestao/></Private> } />
      <Route path="/eventos-gestao" element={ <Private rota="admin"><EventosGestao/></Private> } />
      <Route path="/criar-evento-gestao" element={ <Private rota="admin"><CriarEventoGestao/></Private> } />
      <Route path="/projetos-de-cursos-gestao" element={ <Private rota="admin"><ProjetosCursosGestao/></Private> } />
      <Route path="/criar-projetos-de-cursos-gestao" element={ <Private rota="admin"><CriarProjetosCursosGestao/></Private> } />
      <Route path="/comunidade-gestao" element={ <Private rota="admin"><ComunidadeGestao/></Private> } />
      <Route path="/criar-projeto-gestao" element={ <Private rota="admin"><CriarProjetosGestao/></Private> } />
      <Route path="/cursos-gestao" element={ <Private rota="admin"><CursosGestao/></Private> } />
      <Route path="/detalhes-curso-gestao" element={ <Private rota="admin"><CursosDetalhesGestao/></Private> } />
      
      {/* 
        
      
      <Route path="/inicio-aluno" element={ <Private rota="aluno"><InicioAluno/></Private> } />
      <Route path="/agenda-aluno" element={ <Private rota="aluno"><AgendaAluno/></Private> } />
      <Route path="/videos-aluno" element={ <Private rota="aluno"><VideosAluno/></Private> } />
      <Route path="/video-aluno" element={ <Private rota="aluno"><VideosDetalhesAluno/></Private> } />
      <Route path="/notas-aluno" element={ <Private rota="aluno"><NotasAluno/></Private> } />
      <Route path="/documentos-aluno" element={ <Private rota="aluno"><DocumentosAluno/></Private> } />
      <Route path="/ajuda-aluno" element={ <Private rota="aluno"><AjudaAluno/></Private> } />
      <Route path="/avisos-aluno" element={ <Private rota="aluno"><AvisosAluno/></Private> } />
      <Route path="/perfil-aluno" element={ <Private rota="aluno"><PerfilAluno/></Private> } />
      <Route path="/turma-aluno" element={ <Private rota="aluno"><TurmaAluno/></Private> } />
      <Route path="/atividades-aluno" element={ <Private rota="aluno"><AtividadesAluno/></Private> } />
      <Route path="/detalhes-ativ-aluno" element={ <Private rota="aluno"><AtivDetalheAluno/></Private> } />
      <Route path="/alunos" element={ <Private rota="aluno"><AlunosAluno/></Private> } />

      <Route path="/inicio-professor" element={ <Private rota="professor"><InicioProfessor/></Private> } />
      <Route path="/agenda-professor" element={ <Private rota="professor"><AgendaProfessor/></Private> } />
      <Route path="/videos-professor" element={ <Private rota="professor"><VideosProfessor/></Private> } />
      <Route path="/detalhes-videos-professor" element={ <Private rota="professor"><VideosDetalhesProfessor/></Private> } />
      <Route path="/add-videos-professor" element={ <Private rota="professor"><AddVideos/></Private> } />
      <Route path="/notas-professor" element={ <Private rota="professor"><NotasProfessor/></Private> } />
      <Route path="/documentos-professor" element={ <Private rota="professor"><DocumentosProfessor/></Private> } />
      <Route path="/ajuda-professor" element={ <Private rota="professor"><AjudaProfessor/></Private> } />
      <Route path="/avisos-professor" element={ <Private rota="professor"><AvisosProfessor/></Private> } />
      <Route path="/add-avisos-professor" element={ <Private rota="professor"><PostAvisosProfessor/></Private> } />
      <Route path="/perfil-professor" element={ <Private rota="professor"><PerfilProfessor/></Private> } />
      <Route path="/turma-professor" element={ <Private rota="professor"><TurmaProfessor/></Private> } />
      <Route path="/add-atividade-professor" element={ <Private rota="professor"><AddAtividadeProfessor/></Private> } />
      <Route path="/atividades-professor" element={ <Private rota="professor"><AtividadesProfessor/></Private> } />
      <Route path="/ativ-detalhes-professor" element={ <Private rota="professor"><AtivDetalheProfessor/></Private> } />
      <Route path="/alunos-professor" element={ <Private rota="professor"><AlunosProfessor/></Private> } />
      <Route path="/chamada-professor" element={ <Private rota="professor"><ChamadaProfessor/></Private> } />
      <Route path="/todas-chamadas-professor" element={ <Private rota="professor"><TodasChamadasProfessor/></Private> } />

     */}
    
    </Routes>
  )
}

export default RoutesApp;