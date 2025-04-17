import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Logs de inicialização
console.log("Iniciando aplicação - main.tsx carregado");
console.log("URL da página:", window.location.href);
console.log("Host atual:", window.location.host);
console.log("Ambiente:", import.meta.env.MODE);

// Manipulação de erros global
window.addEventListener('unhandledrejection', (event) => {
  console.error('Promessa não tratada rejeitada:', event.reason);
});

// Inicializar app
try {
  const rootElement = document.getElementById("root");
  console.log("Elemento raiz encontrado:", !!rootElement);
  
  if (rootElement) {
    createRoot(rootElement).render(<App />);
    console.log("App renderizado com sucesso");
  } else {
    console.error("Elemento raiz não encontrado!");
  }
} catch (error) {
  console.error("Erro ao renderizar App:", error);
}
