import { ReactNode } from 'react'
import { AuthProvider } from './api/AuthContext'
import './App.css'

interface AppProps {
  children: ReactNode;
}

function App({ children }: AppProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

export default App
