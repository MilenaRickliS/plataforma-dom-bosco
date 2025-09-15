import { BrowserRouter } from 'react-router-dom'
import RoutesApp from './routes/index';
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import AuthProvider from "./contexts/auth";



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer autoClose={3000} />        
        <RoutesApp />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;