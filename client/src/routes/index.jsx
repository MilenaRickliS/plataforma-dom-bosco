import { Routes, Route } from 'react-router-dom'

import Login from '../pages/Login';
import Inicio from '../pages/site/Inicio';
import Sobre from '../pages/site/Sobre';
import Galeria from '../pages/site/Galeria';
import Educacao from '../pages/site/Educacao';
import CursosDetalhes from '../pages/site/CursosDetalhes';
import Contato from '../pages/site/Contato';

import Private from './private';


import InicioAluno from '../pages/portal_aluno/Inicio';
import AgendaAluno from '../pages/portal_aluno/Agenda';
import VideosAluno from '../pages/portal_aluno/Videos';
import VideosDetalhesAluno from '../pages/portal_aluno/VideosDetalhes';
import AjudaAluno from '../pages/portal_aluno/Ajuda';
import PerfilAluno from '../pages/portal_aluno/Perfil';

import InicioAdm from '../pages/adm/Inicio';
import Usuarios from '../pages/adm/portais/Usuarios';

import InicioProfessor from '../pages/portal_professor/Inicio';
import AgendaProfessor from '../pages/portal_professor/Agenda';
import VideosProfessor from '../pages/portal_professor/Videos';
import VideosDetalhesProfessor from '../pages/portal_professor/DetalhesVideo';
import AddVideos from '../pages/portal_professor/AddVideos';
import EditarVideo from '../pages/portal_professor/EditarVideo';
import AjudaProfessor from '../pages/portal_professor/Ajuda';
import PerfilProfessor from '../pages/portal_professor/Perfil';


import Dashboard2 from '../pages/adm/refeicao/Inicio2';
import RelatoriosRefeicoes from '../pages/adm/refeicao/Relatorios';
import CardapioNutricional from '../pages/adm/refeicao/CardapioNutricional';


import MenuGestao from '../pages/adm/site/Menu';
import GaleriaGestao from '../pages/adm/site/Galeria';
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
      <Route path="/contato" element={<Contato/>}/>  

      <Route path="/inicio-adm" element={ <Private rota="admin"><InicioAdm/></Private> } />
      <Route path="/usuarios" element={ <Private rota="admin"><Usuarios/></Private> } />
      
      
      <Route path="/inicio-refeicao2" element={ <Private rota="admin"><Dashboard2/></Private> } />
      <Route path="/relatorios-refeicao" element={ <Private rota="admin"><RelatoriosRefeicoes/></Private> } />      
      <Route path="/cardapio-nutricional" element={ <Private rota="admin"><CardapioNutricional/></Private> } />
      

      <Route path="/menu-gestao" element={ <Private rota="admin"><MenuGestao/></Private> } />
      <Route path="/galeria-gestao" element={ <Private rota="admin"><GaleriaGestao/></Private> } />
      <Route path="/cursos-gestao" element={ <Private rota="admin"><CursosGestao/></Private> } />
      <Route path="/criar-curso" element={ <Private rota="admin"><CriarCurso/></Private> } />
      <Route path="/editar-curso/:id" element={<EditarCurso />} />
      <Route path="/detalhes-curso-gestao/:id" element={<DetalhesCurso />} />


      <Route path="/aluno/inicio" element={ <Private rota="aluno"><InicioAluno/></Private> } />
      <Route path="/aluno/agenda" element={ <Private rota="aluno"><AgendaAluno/></Private> } />
      <Route path="/aluno/videos" element={ <Private rota="aluno"><VideosAluno/></Private> } />
      <Route path="/aluno/videos/:id" element={ <Private rota="aluno"><VideosDetalhesAluno/></Private> } />
      <Route path="/aluno/ajuda" element={ <Private rota="aluno"><AjudaAluno/></Private> } />
      <Route path="/aluno/perfil" element={ <Private rota="aluno"><PerfilAluno/></Private> } />    
      

      <Route path="/professor/inicio" element={ <Private rota="professor"><InicioProfessor/></Private> } />
      <Route path="/professor/agenda" element={ <Private rota="professor"><AgendaProfessor/></Private> } />
      <Route path="/professor/videos" element={ <Private rota="professor"><VideosProfessor/></Private> } />
      <Route path="/professor/videos/:id" element={ <Private rota="professor"><VideosDetalhesProfessor/></Private> } />
      <Route path="/professor/editar-video/:id" element={<Private rota="professor"><EditarVideo/></Private>} />
      <Route path="/add-videos-professor" element={ <Private rota="professor"><AddVideos/></Private> } />
      <Route path="/professor/ajuda" element={ <Private rota="professor"><AjudaProfessor/></Private> } />
      <Route path="/professor/perfil" element={ <Private rota="professor"><PerfilProfessor/></Private> } />
      
    
    </Routes>
  )
}

export default RoutesApp;