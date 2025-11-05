
import React, { useState } from 'react';
import { Template } from '../types';
import Modal from './Modal';

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);


interface SidebarProps {
  templates: Template[];
  activeTemplateId: string | null;
  onSelectTemplate: (template: Template) => void;
  onCreateNew: () => void;
  onDelete: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ templates, activeTemplateId, onSelectTemplate, onCreateNew, onDelete }) => {
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Previne que o onSelectTemplate seja disparado
        setShowDeleteModal(id);
    };
    
    const confirmDelete = () => {
        if (showDeleteModal) {
            onDelete(showDeleteModal);
            setShowDeleteModal(null);
        }
    };

    return (
        <aside className="w-72 bg-base-100 border-r border-gray-200 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-200">
                <button
                    onClick={onCreateNew}
                    className="w-full flex items-center justify-center bg-secondary hover:bg-accent text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
                >
                    <PlusIcon />
                    Novo Modelo
                </button>
            </div>
            <nav className="flex-1 overflow-y-auto">
                <ul className="py-2">
                    {templates.map(template => (
                        <li key={template.id} className="px-2">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onSelectTemplate(template); }}
                                className={`group flex justify-between items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                    activeTemplateId === template.id 
                                    ? 'bg-secondary text-white' 
                                    : 'text-text-dark hover:bg-neutral'
                                }`}
                            >
                                <span className="truncate flex-1 pr-2">{template.name}</span>
                                <button 
                                    onClick={(e) => handleDeleteClick(e, template.id)} 
                                    className={`p-1 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity ${
                                        activeTemplateId === template.id 
                                        ? 'text-white hover:bg-white/20' 
                                        : 'text-text-light hover:bg-red-100 hover:text-danger'
                                    }`} 
                                    aria-label="Deletar"
                                >
                                    <TrashIcon />
                                </button>
                            </a>
                        </li>
                    ))}
                    {templates.length === 0 && (
                        <li className="p-4 text-center text-sm text-text-light">
                            Nenhum modelo. Crie um novo.
                        </li>
                    )}
                </ul>
            </nav>
            {showDeleteModal && (
                <Modal
                    title="Confirmar Exclusão"
                    message="Você tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita."
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteModal(null)}
                    confirmText="Excluir"
                    confirmColor="red"
                />
            )}
        </aside>
    );
};

export default Sidebar;