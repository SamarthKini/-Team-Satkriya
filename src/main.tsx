import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <BrowserRouter>   
      <AuthProvider>  
        <App />
      </AuthProvider>
    </BrowserRouter>
  // </StrictMode>,
)
