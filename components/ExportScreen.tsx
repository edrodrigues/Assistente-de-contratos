import React, { useState, useEffect } from 'react';
import { Template, ClientInfo } from '../types';

interface ContractInstance {
  template: Template;
  content: Record<string, string>;
  clientInfo: ClientInfo;
}

interface ExportScreenProps {
  templates: Template[];
}

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

const TitleDownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

const PreviewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.443-5.41a1.012 1.012 0 011.531 0l4.443 5.41a1.012 1.012 0 010 .639l-4.443 5.41a1.012 1.012 0 01-1.531 0l-4.443-5.41z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const ContractPreviewModal: React.FC<{ instance: ContractInstance, onClose: () => void, onExportMD: () => void, onExportWord: () => void }> = ({ instance, onClose, onExportMD, onExportWord }) => {
    const getProcessedContent = (text: string) => {
        if (!text) return '';
        const clientReplacedText = instance.clientInfo ?
            text.replace(/{{CLIENTE_NOME}}/g, instance.clientInfo.name || '{{CLIENTE_NOME}}')
                .replace(/{{CLIENTE_SITE}}/g, instance.clientInfo.site || '{{CLIENTE_SITE}}')
                .replace(/{{CLIENTE_CNPJ}}/g, instance.clientInfo.cnpj || '{{CLIENTE_CNPJ}}')
            : text;
        
        const parts = clientReplacedText.split(/({{.*?}})/g);
        return parts.map((part, index) => {
            if (part.match(/{{.*?}}/)) {
                return <span key={index} className="bg-yellow-200 text-yellow-800 font-mono rounded px-1">{part}</span>;
            }
            return part;
        });
    };

    return (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl leading-6 font-bold text-primary flex items-center" id="modal-title">
                                <PreviewIcon />
                                Visualização do Contrato
                            </h3>
                            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors">
                                <CloseIcon />
                            </button>
                        </div>
                        <p className="text-md text-text-light mt-1">{instance.template.name}</p>
                    </div>
                    
                    <div className="px-6 py-4 h-[60vh] overflow-y-auto border-t border-b bg-gray-50">
                        <div className="space-y-6 text-sm">
                            {instance.template.sections.map((section, index) => (
                                <div key={section.id || index}>
                                    <h2 className="text-md font-semibold text-primary mb-2 uppercase tracking-wide">{section.title}</h2>
                                    <p className="text-text-dark whitespace-pre-wrap leading-relaxed">
                                        {getProcessedContent(instance.content[section.id] || '')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-gray-100 px-4 py-4 sm:px-6 flex justify-end items-center space-x-3">
                        <button 
                            onClick={onExportMD}
                            className="flex items-center bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                        >
                            <DownloadIcon /> Exportar MD
                        </button>
                        <button 
                            onClick={onExportWord}
                            className="flex items-center bg-secondary hover:bg-accent text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                        >
                            <DownloadIcon /> Exportar Word
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ExportScreen: React.FC<ExportScreenProps> = ({ templates }) => {
  const [instances, setInstances] = useState<ContractInstance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<ContractInstance | null>(null);

  useEffect(() => {
    const loadedInstances: ContractInstance[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('contract_instance_')) {
        const templateId = key.replace('contract_instance_', '');
        const template = templates.find(t => t.id === templateId);
        if (template) {
          const rawData = localStorage.getItem(key);
          if (rawData) {
            const parsedData = JSON.parse(rawData);
            const content = parsedData.sectionContents || parsedData;
            const clientInfo = parsedData.clientInfo || { name: '', site: '', cnpj: '' };
            loadedInstances.push({ template, content, clientInfo });
          }
        }
      }
    }
    setInstances(loadedInstances);
  }, [templates]);

  const createAndDownloadFile = (filename: string, content: Blob) => {
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const applyReplacements = (text: string, clientInfo: ClientInfo) => {
    if (!text || !clientInfo) return text || '';
    return text
        .replace(/{{CLIENTE_NOME}}/g, clientInfo.name || '')
        .replace(/{{CLIENTE_SITE}}/g, clientInfo.site || '')
        .replace(/{{CLIENTE_CNPJ}}/g, clientInfo.cnpj || '');
  };

  const handleExportMD = (instance: ContractInstance) => {
    const { template, content, clientInfo } = instance;
    const markdownString = template.sections
      .map(sec => {
        const sectionContent = applyReplacements(content[sec.id] || '', clientInfo);
        return `# ${sec.title}\n\n${sectionContent}`
      })
      .join('\n\n---\n\n');
    
    const blob = new Blob([markdownString], { type: 'text/markdown' });
    createAndDownloadFile(`${template.name}.md`, blob);
  };

  const handleExportWord = (instance: ContractInstance) => {
    const docx = (window as any).docx;

    if (!docx) {
        alert("A biblioteca de exportação para Word (docx) não foi carregada.");
        return;
    }

    const { template, content, clientInfo } = instance;
    
    const docChildren = template.sections.flatMap(section => {
        const replacedContent = applyReplacements(content[section.id] || '', clientInfo);
        return [
            new docx.Paragraph({
                text: section.title,
                heading: docx.HeadingLevel.HEADING_1,
                style: "headerStyle"
            }),
            new docx.Paragraph({
                text: replacedContent,
                style: "normalStyle"
            }),
            new docx.Paragraph({ text: "" })
        ];
    });

    const doc = new docx.Document({
        styles: {
            paragraphStyles: [{
                id: "headerStyle", name: "Header Style", basedOn: "Normal", next: "Normal",
                run: { bold: true, size: 28, color: "004d40" },
                paragraph: { spacing: { after: 120 } },
            }, {
                id: "normalStyle", name: "Normal Style", basedOn: "Normal",
                run: { size: 22 },
            }]
        },
        sections: [{ children: docChildren }],
    });

    docx.Packer.toBlob(doc).then((blob: Blob) => {
        createAndDownloadFile(`${template.name}.docx`, blob);
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3">
          <TitleDownloadIcon />
          <h1 className="text-3xl font-bold text-primary">Gerar e Exportar Contratos</h1>
        </div>
        <p className="mt-3 text-lg text-text-light">Visualize seus contratos preenchidos e exporte o documento final.</p>
      </div>
      {instances.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {instances.map((instance) => (
            <div
              key={instance.template.id}
              className="bg-base-100 p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="text-lg font-bold text-primary">{instance.template.name}</h3>
                <p className="mt-1 text-sm text-text-light">
                    {instance.clientInfo?.name ? `Preenchido para: ${instance.clientInfo.name}` : 'Contrato preenchido.'}
                </p>
              </div>
              <button
                onClick={() => setSelectedInstance(instance)}
                className="mt-4 w-full bg-secondary hover:bg-accent text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
              >
                Visualizar e Exportar
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-base-100 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold text-primary">Nenhum Contrato Encontrado</h2>
            <p className="mt-2 text-text-light">
                Seu progresso de preenchimento de contratos aparecerá aqui.
            </p>
        </div>
      )}
      
      {selectedInstance && (
        <ContractPreviewModal
          instance={selectedInstance}
          onClose={() => setSelectedInstance(null)}
          onExportMD={() => handleExportMD(selectedInstance)}
          onExportWord={() => handleExportWord(selectedInstance)}
        />
      )}
    </div>
  );
};

export default ExportScreen;
