import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Template, Section } from '../types';

interface TemplateEditorProps {
  template: Template | null;
  onSave: (template: Template) => void;
  onCancel: () => void;
}

const TemplateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="M8 12h8"></path><path d="M8 16h4"></path>
    </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [googleDocLink, setGoogleDocLink] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [markdownContent, setMarkdownContent] = useState('');
  const [guidancePrompt, setGuidancePrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setGoogleDocLink(template.googleDocLink || '');
      setSections(template.sections);
      setGuidancePrompt(template.guidancePrompt);

      const combinedContent = template.sections
        .map(s => `# ${s.title}\n\n${s.content}`)
        .join('\n\n');
      setMarkdownContent(combinedContent);

    } else {
      setName('');
      setDescription('');
      setGoogleDocLink('');
      const initialContent = '# CLÁUSULA PRIMEIRA - DO OBJETO\n\nO presente Acordo de Cooperação tem por objeto o estabelecimento de mútua cooperação entre os partícipes, visando ao desenvolvimento de {{NOME_DO_PROJETO}}.';
      setMarkdownContent(initialContent);
      setGuidancePrompt('');
    }
  }, [template]);

  useEffect(() => {
    // Parser de Markdown para atualizar as seções e a visualização em tempo real
    const sectionsRaw = markdownContent.split(/^# (.*$)/m).filter(s => s.trim() !== '');
      
    const newSections: Section[] = [];
    if (sectionsRaw.length > 1 && sectionsRaw.length % 2 === 0) {
      for (let i = 0; i < sectionsRaw.length; i += 2) {
        const title = sectionsRaw[i].trim();
        const content = (sectionsRaw[i + 1] || '').trim();
        newSections.push({
          id: `parsed-${i}-${title}`,
          title: title,
          content: content,
        });
      }
    } else if (markdownContent.trim()) {
      newSections.push({
        id: 'parsed-single',
        title: 'CONTEÚDO DO CONTRATO',
        content: markdownContent.trim(),
      });
    }
    setSections(newSections);
  }, [markdownContent]);


  const handleSave = () => {
    const newTemplate: Template = {
      id: template?.id || new Date().toISOString(),
      name,
      description,
      googleDocLink,
      sections,
      guidancePrompt,
    };
    onSave(newTemplate);
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target?.result as string;
      if (!fileContent) return;

      setMarkdownContent(fileContent);
      
      const fileNameWithoutExt = file.name.replace(/\.md$/i, '');
      setName(fileNameWithoutExt);
      setDescription(`Modelo importado do arquivo '${file.name}'.`);
      setGuidancePrompt('');
      setGoogleDocLink('');
    };
    reader.onerror = () => {
        console.error("Erro ao ler o arquivo.");
    };
    reader.readAsText(file);

    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };
  
  const renderLabel = (text: string, htmlFor?: string) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-text-dark mb-1">{text}</label>
  );
  
  const renderContentWithVariables = (content: string) => {
    if (!content) {
        return <span className="text-gray-400">[Conteúdo da cláusula aqui...]</span>;
    }
    const parts = content.split(/({{.*?}})/g);
    return parts.map((part, index) => {
        if (part.match(/{{.*?}}/)) {
            return <span key={index} className="bg-secondary/20 text-accent font-semibold rounded px-1 py-0.5">{part}</span>;
        }
        return part;
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-24">
        {/* Editor Column */}
        <div className="flex flex-col gap-6">
          {/* Card de Upload de Modelo */}
          <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-primary mb-3">Importar Modelo de Arquivo Markdown (.md)</h3>
              <p className="text-sm text-text-light mb-4">
                  Faça o upload de um arquivo <code>.md</code> para configurar um novo modelo automaticamente. O sistema usará os cabeçalhos de nível 1 (<code># Título</code>) como títulos das cláusulas.
              </p>
              <div className="flex items-center">
                  <label htmlFor="file-upload" className="inline-flex items-center bg-primary hover:bg-accent text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 cursor-pointer">
                      <UploadIcon />
                      Carregar Modelo
                  </label>
                  <input
                      id="file-upload"
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".md,.markdown"
                      onChange={handleFileUpload}
                  />
              </div>
          </div>

          {/* Card de Edição */}
          <div className="bg-base-100 rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <TemplateIcon />
                    <h2 className="text-2xl font-bold text-primary">{template ? 'Editar Modelo' : 'Criar Novo Modelo'}</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        {renderLabel('Nome do Modelo', 'template-name')}
                        <input id="template-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" />
                    </div>
                    <div>
                        {renderLabel('Descrição', 'template-description')}
                        <input id="template-description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" />
                    </div>
                    <div>
                        {renderLabel('Link do Modelo em Google Doc (Opcional)', 'template-link')}
                        <input id="template-link" type="text" placeholder="https://docs.google.com/document/d/..." value={googleDocLink} onChange={(e) => setGoogleDocLink(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" />
                    </div>
                </div>

                <hr className="my-6"/>

                <h3 className="text-lg font-semibold text-text-dark mb-2">Cláusulas do Contrato (em Markdown)</h3>
                <p className="text-sm text-text-light mb-4">
                    Cole o conteúdo do contrato abaixo. Use <code># Título da Cláusula</code> para separar as seções. As variáveis devem estar no formato <code>{"{{NOME_DA_VARIAVEL}}"}</code>.
                </p>
                <textarea 
                    value={markdownContent} 
                    onChange={(e) => setMarkdownContent(e.target.value)} 
                    rows={20} 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm font-mono"
                    placeholder="Cole o conteúdo do contrato aqui..."
                />
                
                <hr className="my-6"/>

                <div>
                    {renderLabel('Instruções para o Gemini (padrões e exemplos)', 'gemini-prompt')}
                    <textarea id="gemini-prompt" value={guidancePrompt} onChange={(e) => setGuidancePrompt(e.target.value)} rows={6} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm font-mono" placeholder="Ex: 1. {{NOME_DO_PROJETO}}: Insira o nome completo. 2. {{PRAZO_EM_MESES}}: Defina o prazo em meses."></textarea>
                </div>
            </div>
          </div>
        </div>

        {/* Preview Column */}
        <div className="hidden lg:block">
            <div className="sticky top-8">
                <h3 className="text-xl font-bold text-primary mb-4">Visualização em Tempo Real</h3>
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 h-[calc(100vh-12rem)] overflow-y-auto text-sm">
                    <h1 className="text-2xl font-bold text-text-dark mb-2 border-b pb-2">{name || "Nome do Modelo"}</h1>
                    <p className="text-text-light italic mb-6">{description || "Descrição do modelo..."}</p>
                    
                    <div className="space-y-6">
                        {sections.map((section, index) => (
                            <div key={section.id || index}>
                                <h2 className="text-lg font-semibold text-primary mb-2 uppercase tracking-wide">{section.title || "Título da Cláusula"}</h2>
                                <p className="text-text-dark whitespace-pre-wrap leading-relaxed">
                                    {renderContentWithVariables(section.content)}
                                </p>
                            </div>
                        ))}
                        {sections.length === 0 && <p className="text-gray-400">Nenhuma cláusula adicionada ou conteúdo inválido.</p>}
                    </div>
                </div>
            </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-base-100/80 backdrop-blur-sm border-t border-gray-200 flex justify-end space-x-3">
          <button onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-text-dark font-bold py-2 px-4 rounded-lg transition-colors duration-300">Cancelar</button>
          <button onClick={handleSave} className="bg-secondary hover:bg-accent text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300">Salvar Modelo</button>
      </div>
    </>
  );
};

export default TemplateEditor;