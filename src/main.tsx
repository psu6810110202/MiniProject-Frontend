import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './contexts/LanguageContext.tsx'
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <ProductProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ProductProvider>
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
);
