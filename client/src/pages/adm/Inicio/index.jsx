import { Link } from "react-router-dom";
import logo from '../../../assets/logo2.png';
import './style.css';

import { BiSolidDish } from "react-icons/bi";
import { FaUserLock, FaBookReader } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { useContext } from "react";
import { AuthContext } from "../../../contexts/auth";

export default function Inicio() {
    const { logout } = useContext(AuthContext);

    return (
        <div className="fundo-admin">

            <div className="painel-admin">

                {/* CABEÇALHO */}
                <div className="titulo-admin">

                    <div className="logo-container">
                        <img src={logo} alt="Instituto Assistencial Dom Bosco" />
                    </div>

                    <div className="titulo-texto">
                        <span className="titulo-pequeno">
                            PAINEL ADMINISTRATIVO
                        </span>

                        <p>
                            Instituto Assistencial Dom Bosco
                        </p>

                        <span className="subtitulo">
                            Portal de gerenciamento
                        </span>
                    </div>

                </div>


                {/* CONTEÚDO */}
                <div className="conteudo-admin">

                    <div className="bemvindo-admin">

                        <h1>Bem-vindo!</h1>

                        <p className="descricao-admin">
                            Selecione uma opção para acessar o gerenciamento.
                        </p>


                        <div className="opcoes-admin">

                            <Link
                                to="/usuarios"
                                className="link-gestao"
                            >
                                <div className="icone-gestao">
                                    <FaBookReader />
                                </div>

                                <div className="texto-gestao">
                                    <strong>Gestão de Usuários</strong>
                                    <span>
                                        Gerencie os usuários do sistema
                                    </span>
                                </div>
                            </Link>


                            <Link
                                to="/inicio-refeicao2"
                                className="link-gestao"
                            >
                                <div className="icone-gestao">
                                    <BiSolidDish />
                                </div>

                                <div className="texto-gestao">
                                    <strong>Controle de Refeições</strong>
                                    <span>
                                        Controle as refeições do Instituto
                                    </span>
                                </div>
                            </Link>


                            <Link
                                to="/menu-gestao"
                                className="link-gestao"
                            >
                                <div className="icone-gestao">
                                    <FaUserLock />
                                </div>

                                <div className="texto-gestao">
                                    <strong>Gestão do Site</strong>
                                    <span>
                                        Gerencie o conteúdo do site institucional
                                    </span>
                                </div>
                            </Link>

                        </div>


                        {/* SAIR */}
                        <button
                            onClick={logout}
                            className="logout"
                        >
                            <IoIosLogOut />
                            <span>Sair do sistema</span>
                        </button>

                    </div>

                </div>


                {/* RODAPÉ */}
                <div className="rodape-admin">
                    <span>
                        Instituto Assistencial Dom Bosco
                    </span>

                    <span>
                        Portal do Administrador
                    </span>
                </div>

            </div>

        </div>
    );
}