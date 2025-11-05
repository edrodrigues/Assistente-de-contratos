
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

const ExportScreen: React.FC<ExportScreenProps> = ({ templates }) => {
  const [instances, setInstances] = useState<ContractInstance[]>([]);

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
    // A biblioteca 'docx' é carregada via tag <script> no index.html,
    // então ela fica disponível globalmente no objeto `window`.
    const docx = (window as any).docx;

    if (!docx) {
        alert("A biblioteca de exportação para Word (docx) não foi carregada. Verifique a conexão com a internet ou o console de erros.");
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
            new docx.Paragraph({ text: "" }) // Adiciona um espaço
        ];
    });

    const doc = new docx.Document({
        styles: {
            paragraphStyles: [{
                id: "headerStyle",
                name: "Header Style",
                basedOn: "Normal",
                next: "Normal",
                run: {
                    bold: true,
                    size: 28, // 14pt
                    color: "004d40",
                },
                paragraph: {
                    spacing: { after: 120 }, // 6pt
                },
            },
            {
                id: "normalStyle",
                name: "Normal Style",
                basedOn: "Normal",
                run: {
                    size: 22, // 11pt
                },
            }
            ]
        },
        sections: [{
            children: docChildren,
        }],
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
          <h1 className="text-3xl font-bold text-primary">Exportar Contratos</h1>
        </div>
        <p className="mt-3 text-lg text-text-light">Visualize seus rascunhos e exporte o documento final.</p>
      </div>
      {instances.length > 0 ? (
        <div className="space-y-4">
          {instances.map((instance) => (
            <div
              key={instance.template.id}
              className="bg-base-100 p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <h3 className="text-lg font-bold text-primary">{instance.template.name}</h3>
                <p className="mt-1 text-sm text-text-light">Rascunho em preenchimento.</p>
              </div>
              <div className="flex space-x-3 flex-shrink-0">
                <button 
                  onClick={() => handleExportMD(instance)}
                  className="flex items-center bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  <DownloadIcon />
                  MD
                </button>
                <button 
                  onClick={() => handleExportWord(instance)}
                  className="flex items-center bg-secondary hover:bg-accent text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                 <DownloadIcon />
                  Word
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-base-100 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold text-primary">Nenhum Rascunho Encontrado</h2>
            <p className="mt-2 text-text-light">
                Comece a preencher um documento na aba <span className="font-semibold text-secondary">'Preencher'</span>. Seu progresso aparecerá aqui.
            </p>
        </div>
      )}
    </div>
  );
};

export default ExportScreen;