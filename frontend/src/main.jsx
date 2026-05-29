import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import store from './store/store.js'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { CurrencyProvider } from './context/CurrencyContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <App />
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
