import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/global.css'

import "@radix-ui/themes/styles.css";
import { ThemeProvider } from "@/components/theme-provider"

import { BrowserRouter } from "react-router";
import { Toaster } from 'sonner'
import AppRoutes from './AppRoutes.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster richColors />
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppRoutes />
      </ThemeProvider>
    </BrowserRouter>  
  </StrictMode>,
)
