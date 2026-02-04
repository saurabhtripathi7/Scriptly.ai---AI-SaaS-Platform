import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import ScrollToHash from './components/ScrollToHash.jsx'
import { Toaster } from 'react-hot-toast'
import ScrollToTop from "./components/ScrollToTop";


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <ScrollToTop />
      <ScrollToHash />
      <App />
    </BrowserRouter>
  </ClerkProvider>,
)