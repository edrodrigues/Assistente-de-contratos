import React from 'react';

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
);

type View = 'inicio' | 'modelos' | 'preencher' | 'exportar';

interface HeaderProps {
  activeView: View;
  onSetView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, onSetView }) => {
  const getTabClass = (view: View) => {
    return `py-4 px-1 text-base font-medium transition-colors duration-300 focus:outline-none border-b-2 ${
      activeView === view
        ? 'border-secondary text-primary'
        : 'border-transparent text-text-light hover:text-primary'
    }`;
  };

  return (
    <header className="bg-base-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:p-8">
        <div className="flex justify-between items-center h-20">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            <FileTextIcon />
            <h1 className="text-xl font-bold text-primary tracking-tight">
              Assistente de Contratos
            </h1>
          </div>

          {/* Navigation Tabs Section */}
          <nav className="flex space-x-8">
            <button onClick={() => onSetView('inicio')} className={getTabClass('inicio')}>
              Comece aqui
            </button>
            <button onClick={() => onSetView('preencher')} className={getTabClass('preencher')}>
              Criar e Revisar
            </button>
            <button onClick={() => onSetView('modelos')} className={getTabClass('modelos')}>
              Gerenciar Modelos
            </button>
            <button onClick={() => onSetView('exportar')} className={getTabClass('exportar')}>
              Gerar e Exportar
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
