
import React from 'react';
import { Template } from '../types';

interface TemplateSelectionScreenProps {
  templates: Template[];
  onSelect: (template: Template) => void;
}

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-secondary group-hover:text-accent transition-colors">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
);

const AssistedEditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        <path d="M20 14.5l-2.5-1-1 2.5 2.5 1 1-2.5z"/>
        <path d="M15 5.5l-2.5-1-1 2.5 2.5 1 1-2.5z"/>
    </svg>
);

const TemplateSelectionScreen: React.FC<TemplateSelectionScreenProps> = ({ templates, onSelect }) => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3">
          <AssistedEditIcon />
          <h1 className="text-3xl font-bold text-primary">Preencher Contrato</h1>
        </div>
        <p className="mt-3 text-lg text-text-light">Selecione um dos modelos abaixo para começar a preencher.</p>
      </div>
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="group bg-base-100 p-6 rounded-xl shadow-sm border border-gray-200 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 flex items-center gap-6"
            >
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center">
                <FileTextIcon />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary group-hover:text-accent transition-colors">{template.name}</h3>
                <p className="mt-1 text-sm text-text-light line-clamp-2">{template.description}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-base-100 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold text-primary">Nenhum Modelo Encontrado</h2>
            <p className="mt-2 text-text-light">
                Parece que não há modelos de contrato. Vá para a aba <span className="font-semibold text-secondary">'Modelos'</span> para criar seu primeiro.
            </p>
        </div>
      )}
    </div>
  );
};

export default TemplateSelectionScreen;
