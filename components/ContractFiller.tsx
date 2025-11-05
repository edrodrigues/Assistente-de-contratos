
import React, { useState, useEffect, useMemo } from 'react';
import { Template, ClientInfo } from '../types';
import { getContractSuggestion } from '../services/geminiService';

interface ContractFillerProps {
  template: Template;
  onBack: () => void;
  onFinish: () => void;
}

const AssistedEditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        <path d="M20 14.5l-2.5-1-1 2.5 2.5 1 1-2.5z"/>
        <path d="M15 5.5l-2.5-1-1 2.5 2.5 1 1-2.5z"/>
    </svg>
);

const WandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><path d="M15 4V2m0 14v-2m-7.5 5.5L6 18l-1.5 1.5M19.5 5.5L21 4l-1.5-1.5M3 12h2m14 0h2M6.34 17.66l-1.41-1.41M19.07 4.93l1.41 1.41"/><circle cx="12" cy="12" r="10"/><path d="M12 2v2m0 16v2m-8-9H2m20 0h-2m-2.5-6.5L18 6l-1.5-1.5M6 18l-1.5 1.5L6 21"/></svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><polyline points="15 18 9 12 15 6"></polyline></svg>
);

const ExternalLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
);

const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);


const ContractFiller: React.FC<ContractFillerProps> = ({ template, onBack, onFinish }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionContents, setSectionContents] = useState<Record<string, string>>({});
  const [clientInfo, setClientInfo] = useState<ClientInfo>({ name: '', site: '', cnpj: '' });
  const [suggestion, setSuggestion] = useState('');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);

  // Carrega o rascunho do localStorage na montagem ou na troca de template
  useEffect(() => {
    const initialContents = template.sections.reduce((acc, section) => {
        acc[section.id] = section.content;
        return acc;
    }, {} as Record<string, string>);

    try {
        const savedData = localStorage.getItem(`contract_instance_${template.id}`);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Checa pelo novo formato para manter retrocompatibilidade
            if (parsedData.sectionContents && parsedData.clientInfo) {
                setSectionContents(parsedData.sectionContents);
                setClientInfo(parsedData.clientInfo);
            } else { // Formato antigo
                setSectionContents(parsedData);
                setClientInfo({ name: '', site: '', cnpj: '' });
            }
        } else {
            setSectionContents(initialContents);
            setClientInfo({ name: '', site: '', cnpj: '' });
        }
    } catch (error) {
        console.error("Erro ao carregar rascunho salvo:", error);
        setSectionContents(initialContents);
        setClientInfo({ name: '', site: '', cnpj: '' });
    }
  }, [template.id, template.sections]);

  // Salva automaticamente o rascunho no localStorage sempre que o conteúdo muda
  useEffect(() => {
    if (Object.keys(sectionContents).length > 0 || clientInfo.name || clientInfo.site || clientInfo.cnpj) {
      try {
        const dataToSave = { clientInfo, sectionContents };
        localStorage.setItem(`contract_instance_${template.id}`, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Erro ao salvar rascunho automaticamente:", error);
      }
    }
  }, [sectionContents, clientInfo, template.id]);


  const fullContractText = useMemo(() => {
    return template.sections.map(sec => `${sec.title}\n${sectionContents[sec.id] || ''}`).join('\n\n');
  }, [template.sections, sectionContents]);
  
  const handleGetSuggestion = async () => {
      const currentSection = template.sections[currentSectionIndex];
      const task = `Preciso de uma sugestão para preencher o conteúdo da seguinte cláusula: "${currentSection.title}". Leve em consideração o restante do contrato já preenchido.`;
      
      setIsLoadingSuggestion(true);
      setSuggestion('');
      try {
          const result = await getContractSuggestion(template.guidancePrompt, fullContractText, task, clientInfo);
          setSuggestion(result);
      } catch (error) {
          setSuggestion('Ocorreu um erro ao buscar a sugestão.');
      } finally {
          setIsLoadingSuggestion(false);
      }
  };

  const insertSuggestion = () => {
      if (suggestion) {
          const currentSection = template.sections[currentSectionIndex];
          handleSectionContentChange(currentSection.id, suggestion);
          setSuggestion('');
      }
  }

  const handleAskAssistant = async () => {
    if (!assistantQuery.trim()) return;
    
    setIsAssistantLoading(true);
    setAssistantResponse('');
    try {
        const result = await getContractSuggestion(template.guidancePrompt, fullContractText, assistantQuery, clientInfo);
        setAssistantResponse(result);
    } catch (error) {
        setAssistantResponse('Ocorreu um erro ao consultar o assistente.');
    } finally {
        setIsAssistantLoading(false);
    }
  };

  const promptSuggestions = [
    "Revisar clareza e objetividade",
    "Sugerir uma linguagem mais formal",
    "Quais os riscos desta cláusula?",
    "Verificar se falta alguma informação importante"
  ];

  const handleSuggestionClick = (prompt: string) => {
    setAssistantQuery(prompt);
  };
  
  const handleSectionContentChange = (sectionId: string, content: string) => {
    setSectionContents(prev => ({ ...prev, [sectionId]: content }));
  };
  
  const handleClientInfoChange = (field: keyof ClientInfo, value: string) => {
    setClientInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentSectionIndex < template.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };
  
  const currentSection = template.sections[currentSectionIndex];
  const totalSections = template.sections.length;

  return (
    <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AssistedEditIcon />
              <h2 className="text-2xl font-bold text-primary">Preencher Contrato: <span className="font-semibold">{template.name}</span></h2>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => template.googleDocLink && window.open(template.googleDocLink, '_blank', 'noopener,noreferrer')}
                    disabled={!template.googleDocLink}
                    className="flex items-center text-sm bg-white hover:bg-neutral border border-gray-300 text-text-dark font-semibold py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    title={template.googleDocLink ? "Abre o modelo original em uma nova aba" : "Nenhum link de Google Doc associado a este modelo"}
                >
                    <ExternalLinkIcon />
                    Abrir modelo vazio em Google Doc
                </button>
                <button onClick={onBack} className="flex items-center text-sm bg-gray-200 hover:bg-gray-300 text-text-dark font-semibold py-2 px-3 rounded-lg transition-colors">
                    <BackIcon /> Voltar para Seleção
                </button>
            </div>
        </div>

        <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="flex items-center gap-3 mb-4">
                <UserIcon />
                <h3 className="text-xl font-bold text-primary">Identificação do Cliente</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="client-name" className="block text-sm font-medium text-text-dark mb-1">Nome</label>
                    <input type="text" id="client-name" value={clientInfo.name} onChange={e => handleClientInfoChange('name', e.target.value)} placeholder="Nome da empresa ou pessoa" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="client-site" className="block text-sm font-medium text-text-dark mb-1">Site</label>
                    <input type="text" id="client-site" value={clientInfo.site} onChange={e => handleClientInfoChange('site', e.target.value)} placeholder="www.exemplo.com.br" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="client-cnpj" className="block text-sm font-medium text-text-dark mb-1">CNPJ</label>
                    <input type="text" id="client-cnpj" value={clientInfo.cnpj} onChange={e => handleClientInfoChange('cnpj', e.target.value)} placeholder="00.000.000/0001-00" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Principal: Editor do Contrato */}
            <div className="lg:col-span-2 bg-base-100 p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-primary">{currentSection.title}</h3>
                    <span className="text-sm font-medium text-text-light">Cláusula {currentSectionIndex + 1} de {totalSections}</span>
                </div>
                <textarea 
                    key={currentSection.id}
                    value={sectionContents[currentSection.id] || ''} 
                    onChange={(e) => handleSectionContentChange(currentSection.id, e.target.value)} 
                    rows={20}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm font-mono flex-grow"
                    placeholder="Preencha o conteúdo desta cláusula..."
                />
                <div className="space-y-3 pt-4">
                    <button onClick={handleGetSuggestion} disabled={isLoadingSuggestion || !template.guidancePrompt} className="w-full flex items-center justify-center bg-primary hover:bg-accent disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300">
                    {isLoadingSuggestion ? <Spinner /> : <><WandIcon /> Sugerir preenchimento para esta cláusula</>}
                    </button>
                    {suggestion && (
                    <div className="border-l-4 border-secondary bg-green-50 p-4 rounded-r-lg">
                        <p className="font-semibold text-accent">Sugestão:</p>
                        <p className="text-sm text-text-dark whitespace-pre-wrap">{suggestion}</p>
                        <div className="mt-3 flex justify-end">
                            <button onClick={insertSuggestion} className="text-sm bg-secondary hover:bg-accent text-white font-semibold py-1 px-3 rounded-md transition-colors">
                                Inserir
                            </button>
                        </div>
                    </div>
                    )}
                </div>
                <div className="flex justify-between items-center pt-6 mt-auto">
                    <button onClick={handlePrev} disabled={currentSectionIndex === 0} className="bg-gray-200 hover:bg-gray-300 text-text-dark font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        ‹ Anterior
                    </button>
                    
                    {currentSectionIndex < totalSections - 1 ? (
                        <button onClick={handleNext} className="bg-secondary hover:bg-accent text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors">
                            Próximo ›
                        </button>
                    ) : (
                        <button onClick={onFinish} className="bg-accent hover:bg-primary text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors">
                            Finalizar
                        </button>
                    )}
                </div>
            </div>

            {/* Coluna Lateral: Assistente Gemini */}
            <div className="lg:col-span-1 bg-base-100 p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col space-y-4">
                <h3 className="text-xl font-bold text-primary">Assistente Gemini</h3>
                <div>
                    <label htmlFor="assistant-query" className="block text-sm font-medium text-text-dark mb-1">
                        Faça uma pergunta sobre o contrato
                    </label>
                    <textarea
                    id="assistant-query"
                    value={assistantQuery}
                    onChange={(e) => setAssistantQuery(e.target.value)}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                    placeholder="Ex: 'Qual o prazo legal padrão para este tipo de acordo?'"
                    />
                </div>
                 <div>
                    <label className="block text-xs font-medium text-text-light mb-2">Experimente perguntar:</label>
                    <div className="flex flex-wrap gap-2">
                        {promptSuggestions.map((prompt, index) => (
                            <button key={index} onClick={() => handleSuggestionClick(prompt)} className="bg-neutral text-accent border border-accent hover:bg-green-100 text-xs font-medium py-1 px-2 rounded-full transition-colors">
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
                <button 
                    onClick={handleAskAssistant} 
                    disabled={isAssistantLoading || !assistantQuery.trim()} 
                    className="w-full flex items-center justify-center bg-secondary hover:bg-accent disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
                >
                    {isAssistantLoading ? <Spinner/> : 'Perguntar ao Assistente'}
                </button>
                {assistantResponse && (
                    <div className="border-l-4 border-secondary bg-neutral p-4 rounded-r-lg flex-grow overflow-y-auto mt-2">
                    <p className="font-semibold text-primary">Resposta:</p>
                    <p className="text-sm text-text-dark whitespace-pre-wrap">{assistantResponse}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ContractFiller;