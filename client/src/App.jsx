import { BrowserRouter } from 'react-router-dom'
import RoutesApp from './routes/index';
import { ToastContainer, Zoom } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import AuthProvider from "./contexts/auth";



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer
            position="bottom-right"
            autoClose={3000}
            theme="colored"
            toastStyle={{
              borderRadius: "12px",
              fontFamily: "Poppins, sans-serif",
            }}
          />
            <ToastContainer
        containerId="gamificacao"
        position="top-center"
        autoClose={2200}
        limit={1}
        hideProgressBar
        closeOnClick={false}
        pauseOnHover={false}
        newestOnTop={false} 
        draggable={false}
        transition={Zoom}
        theme="colored"
        toastStyle={{
          borderRadius: "14px",
          fontFamily: "Poppins, sans-serif",
          fontWeight: 600,
          textAlign: "center",
          boxShadow: "0 0 20px rgba(255,255,255,0.2)",
        }}
      />

    
      <ToastContainer
        containerId="penalidade"
        position="bottom-left"
        autoClose={2200}
         limit={1}
        hideProgressBar
        closeOnClick={false}
        pauseOnHover={false}
        draggable={false}
        newestOnTop={false}
         transition={Zoom}
        theme="colored"
        toastStyle={{
          borderRadius: "14px",
          fontFamily: "Poppins, sans-serif",
        }}
      />

     
      <ToastContainer
        containerId="sistema"
        position="bottom-right"
        autoClose={2500}
        theme="colored"
        toastStyle={{
          borderRadius: "12px",
          fontFamily: "Poppins, sans-serif",
        }}
      />    
        <RoutesApp />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;