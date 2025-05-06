import { AuthProvider } from './api/AuthContext'
import './App.css'

function App({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

export default App
