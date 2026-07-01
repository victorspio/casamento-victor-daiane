import './index.css';
import { Routes, Route } from 'react-router-dom';
import { WeddingProvider } from './context/WeddingContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ConvidadosPage } from './pages/ConvidadosPage';
import { TarefasPage } from './pages/TarefasPage';
import { FinanceiroPage } from './pages/FinanceiroPage';
import { FornecedoresPage } from './pages/FornecedoresPage';

import { RsvpPage } from './pages/RsvpPage';

function App() {
  return (
    <WeddingProvider>
      <Routes>
        {/* Rota do Convidado (Sem cabeçalho/admin) */}
        <Route path="/rsvp/:guestId" element={<RsvpPage />} />
        <Route path="/rsvp/invite/:inviteId" element={<RsvpPage />} />

        {/* Rotas do Painel Admin (Com Layout) */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/"              element={<Dashboard />} />
                <Route path="/convidados"    element={<ConvidadosPage />} />
                <Route path="/tarefas"       element={<TarefasPage />} />
                <Route path="/financeiro"    element={<FinanceiroPage />} />
                <Route path="/fornecedores"  element={<FornecedoresPage />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </WeddingProvider>
  );
}

export default App;
