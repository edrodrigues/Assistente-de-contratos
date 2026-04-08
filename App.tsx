
import React, { useState, useCallback, useEffect } from 'react';
import { Template, Section } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TemplateEditor from './components/TemplateEditor';
import TemplateSelectionScreen from './components/TemplateSelectionScreen';
import ContractFiller from './components/ContractFiller';
import ExportScreen from './components/ExportScreen';
import StartScreen from './components/StartScreen';
import { generateContractFromFiles } from './services/geminiService';


const WelcomeScreen = () => {
    const [promptCopied, setPromptCopied] = useState(false);

    const promptText = `Você é um especialista em criar modelos de documentos. Analise os exemplos de contratos preenchidos abaixo e crie um modelo genérico em formato Markdown.

Sua tarefa é identificar as partes que são variáveis (como nomes, datas, valores, descrições específicas) e substituí-las por placeholders no formato {{NOME_DA_VARIAVEL_EM_MAIUSCULAS}}.

O output deve ser APENAS o texto do modelo em Markdown, usando cabeçalhos de nível 1 (# TÍTULO DA CLÁUSULA) para cada cláusula. Não adicione nenhuma explicação extra.

[AQUI VOCÊ DEVE COLAR O TEXTO DE UM OU MAIS CONTRATOS JÁ PREENCHIDOS COMO EXEMPLO]`;

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(promptText);
        setPromptCopied(true);
    };

    useEffect(() => {
        if (promptCopied) {
        const timer = setTimeout(() => setPromptCopied(false), 2000);
        return () => clearTimeout(timer);
        }
    }, [promptCopied]);

    const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6 text-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624l.211.842.212-.842a3.375 3.375 0 00-2.455-2.456l-.842-.212.842-.212a3.375 3.375 0 002.455-2.455l.212-.842-.212.842a3.375 3.375 0 002.455 2.455l.842.212-.842.212a3.375 3.375 0 00-2.455 2.456z" /></svg>;
    const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>;
    const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;


    return (
        <div className="bg-base-100 rounded-2xl border border-gray-200 p-6 sm:p-8 h-full overflow-y-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-primary">Gerenciador de Modelos</h2>
                <p className="mt-2 text-md max-w-2xl mx-auto text-text-light">
                Crie, edite e gerencie seus modelos de contrato. Para começar, selecione um modelo existente na barra lateral ou crie um novo.
                </p>
            </div>

            <div className="bg-neutral p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                <SparklesIcon />
                <h3 className="text-xl font-bold text-primary">Como Criar um Modelo com IA (Ex: ChatGPT)</h3>
                </div>
                <p className="text-text-light mb-6">
                Você pode usar uma IA generativa para criar a base de seus modelos rapidamente. Siga os passos abaixo:
                </p>

                <div className="space-y-6">
                    {/* Step 1 */}
                    <div>
                        <h4 className="font-semibold text-text-dark mb-2">Passo 1: Forneça um Exemplo de Documento Preenchido</h4>
                        <p className="text-sm text-text-light mb-3">Copie o conteúdo de um contrato já finalizado. Isso dará à IA o contexto necessário sobre a estrutura e o vocabulário.</p>
                        <div className="bg-white p-4 rounded-md border text-sm text-gray-700 font-mono">
                        <p className="font-sans font-semibold text-gray-500 text-xs uppercase tracking-wider mb-2">EXEMPLO</p>
                        <code>
                            # CLÁUSULA PRIMEIRA - DO OBJETO<br/>
                            O presente Acordo de Cooperação tem por objeto o estabelecimento de mútua cooperação... visando ao desenvolvimento de <strong>Projeto de Pesquisa em IA para Análise de Dados Educacionais</strong>.
                            <br/><br/>
                            # CLÁUSULA TERCEIRA - DA VIGÊNCIA<br/>
                            O prazo de vigência deste instrumento será de <strong>24 meses</strong>, a contar da data de sua assinatura.
                        </code>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div>
                        <h4 className="font-semibold text-text-dark mb-2">Passo 2: Use um Prompt Efetivo para Gerar o Modelo</h4>
                        <p className="text-sm text-text-light mb-3">Use o prompt abaixo no ChatGPT (ou similar), colando o seu exemplo de contrato no local indicado.</p>
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-200 relative">
                        <pre className="text-sm text-blue-900 whitespace-pre-wrap font-mono">
                            <code>{promptText}</code>
                        </pre>
                        <button onClick={handleCopyPrompt} className="absolute top-3 right-3 bg-white hover:bg-blue-100 text-blue-800 font-semibold py-1 px-3 border border-blue-200 rounded-md text-sm flex items-center transition-colors">
                            {promptCopied ? <CheckIcon/> : <ClipboardIcon/>}
                            <span className="ml-2">{promptCopied ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                        </div>
                        <p className="text-xs text-text-light mt-2">A IA irá identificar as partes em negrito (e outras) e transformá-las em variáveis como <code>{"{{NOME_DO_PROJETO}}"}</code> e <code>{"{{PRAZO_EM_MESES}}"}</code>.</p>
                    </div>

                    {/* Step 3 */}
                    <div>
                        <h4 className="font-semibold text-text-dark mb-2">Passo 3: Importe o Modelo Gerado</h4>
                        <p className="text-sm text-text-light">
                        Salve a resposta da IA como um arquivo de texto com a extensão <code>.md</code>. Depois, clique em <strong>"+ Novo Modelo"</strong> na barra lateral e use a opção <strong>"Carregar Modelo"</strong> para importar seu novo arquivo.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Acordo de Cooperação Técnica',
      description: 'Modelo padrão para cooperação técnica sem transferência de recursos financeiros.',
      googleDocLink: '',
      sections: [
        { id: 's1', title: 'CLÁUSULA PRIMEIRA - DO OBJETO', content: 'O presente Acordo de Cooperação tem por objeto o estabelecimento de mútua cooperação entre os partícipes, visando ao desenvolvimento de {{NOME_DO_PROJETO}}.' },
        { id: 's2', title: 'CLÁUSULA SEGUNDA - DAS OBRIGAÇÕES', content: '{{DESCREVER_OBRIGACOES}}' },
        { id: 's3', title: 'CLÁUSULA TERCEIRA - DA VIGÊNCIA', content: 'O prazo de vigência deste instrumento será de {{PRAZO_EM_MESES}} meses, a contar da data de sua assinatura.' },
      ],
      guidancePrompt: `Instruções para preenchimento:\n1. {{NOME_DO_PROJETO}}: Insira o nome completo e descritivo do projeto. Exemplo: "Projeto de Pesquisa em Inteligência Artificial para Análise de Dados Educacionais".\n2. {{DESCREVER_OBRIGACOES}}: Detalhe as responsabilidades de cada parte (V-Lab e UFPE). Seja específico. Exemplo para V-Lab: "Fornecer acesso à sua plataforma de software e aos dados anonimizados." Exemplo para UFPE: "Disponibilizar pesquisadores e infraestrutura laboratorial."\n3. {{PRAZO_EM_MESES}}: Defina o prazo de vigência em meses. Padrão é 24 meses.`
    },
    {
      id: '2',
      name: 'Termo de Confidencialidade',
      description: 'Anexo para garantir o sigilo das informações trocadas durante o projeto.',
      googleDocLink: '',
      sections: [
        { id: 's1', title: 'CLÁUSULA ÚNICA - DO COMPROMISSO', content: 'Pelo presente instrumento, as partes V-LAB e UFPE, doravante denominadas PARTES, comprometem-se a manter em absoluto sigilo todas e quaisquer informações confidenciais a que tiverem acesso em decorrência do projeto {{NOME_DO_PROJETO}}.' }
      ],
      guidancePrompt: `Instruções para preenchimento:\n1. {{NOME_DO_PROJETO}}: Deve ser o mesmo nome do projeto usado no Acordo de Cooperação Técnica principal. Garanta consistência.`
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<Template | 'new' | null>(null);
  const [templateToFill, setTemplateToFill] = useState<Template | null>(null);
  const [activeView, setActiveView] = useState<'inicio' | 'modelos' | 'preencher' | 'exportar'>('modelos');
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    // Reseta os estados secundários ao trocar de aba principal para evitar inconsistências
    if (activeView !== 'modelos') {
      setSelectedTemplate(null);
    }
    if (activeView !== 'preencher') {
      setTemplateToFill(null);
    }
  }, [activeView]);

  const parseGeneratedContract = (text: string): Template => {
      const sections: Section[] = [];
      const sectionsRaw = text.split(/^# (.*$)/m).filter(s => s.trim() !== '');
      
      if (sectionsRaw.length > 1 && sectionsRaw.length % 2 === 0) {
        for (let i = 0; i < sectionsRaw.length; i += 2) {
          const title = sectionsRaw[i].trim();
          const content = (sectionsRaw[i + 1] || '').trim();
          sections.push({
            id: `gen-${i}`,
            title: title,
            content: content,
          });
        }
      } else {
        sections.push({
          id: 'gen-0',
          title: 'CONTRATO GERADO',
          content: text.trim(),
        });
      }

      return {
        id: `generated-${Date.now()}`,
        name: 'Contrato Gerado por IA',
        description: 'Este contrato foi gerado por IA com base nos documentos fornecidos.',
        sections: sections,
        guidancePrompt: 'Você é um assistente especialista em contratos. Revise e melhore o texto a seguir, mantendo a formalidade e a clareza jurídica.',
      };
  };

  const handleGenerateContract = async (files: { workPlan: string; executionTerm: string; budget: string; }) => {
      setIsGenerating(true);
      try {
          const contractText = await generateContractFromFiles(files.workPlan, files.executionTerm, files.budget);
          const generatedTemplate = parseGeneratedContract(contractText);
          setTemplateToFill(generatedTemplate);
          setActiveView('preencher');
      } catch (error) {
          console.error("Erro na geração do contrato:", error);
          alert("Ocorreu um erro ao gerar o contrato. Verifique o console para mais detalhes e tente novamente.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleSelectTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
  }, []);

  const handleCreateNew = useCallback(() => {
    setSelectedTemplate('new');
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (typeof selectedTemplate === 'object' && selectedTemplate?.id === id) {
        setSelectedTemplate(null);
    }
    if (templateToFill?.id === id) {
        setTemplateToFill(null);
    }
  }, [selectedTemplate, templateToFill]);

  const handleSave = useCallback((template: Template) => {
    setTemplates(prev => {
      const exists = prev.find(t => t.id === template.id);
      if (exists) {
        return prev.map(t => t.id === template.id ? template : t);
      } else {
        return [...prev, template];
      }
    });
    setSelectedTemplate(template);
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedTemplate(null);
  }, []);
  
  const getActiveTemplate = () => {
    if (selectedTemplate === 'new' || !selectedTemplate) return null;
    return selectedTemplate;
  }
  
  const handleSelectTemplateToFill = (template: Template) => {
    setTemplateToFill(template);
  };
  
  const handleBackToSelection = () => {
    setTemplateToFill(null);
    setActiveView('preencher');
  };

  const renderContent = () => {
    switch (activeView) {
        case 'inicio':
            return <StartScreen 
                onGenerate={handleGenerateContract}
                isGenerating={isGenerating}
            />;
        case 'modelos':
            return (
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar
                        templates={templates}
                        activeTemplateId={getActiveTemplate()?.id ?? null}
                        onSelectTemplate={handleSelectTemplate}
                        onCreateNew={handleCreateNew}
                        onDelete={handleDelete}
                    />
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-neutral">
                        {!selectedTemplate && <WelcomeScreen />}
                        {selectedTemplate === 'new' && (
                            <TemplateEditor
                                template={null}
                                onSave={handleSave}
                                onCancel={handleCancel}
                            />
                        )}
                        {typeof selectedTemplate === 'object' && selectedTemplate !== null && (
                            <TemplateEditor
                                template={selectedTemplate}
                                onSave={handleSave}
                                onCancel={handleCancel}
                            />
                        )}
                    </main>
                </div>
            );
        case 'preencher':
            return (
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {!templateToFill ? (
                        <TemplateSelectionScreen templates={templates} onSelect={handleSelectTemplateToFill} />
                    ) : (
                        <ContractFiller template={templateToFill} onBack={handleBackToSelection} onFinish={() => setActiveView('exportar')} />
                    )}
                </main>
            );
        case 'exportar':
             return (
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <ExportScreen templates={templates} />
                </main>
            );
        default:
            return null;
    }
};
  
  return (
    <div className="h-screen bg-neutral text-text-dark font-sans flex flex-col">
      <Header activeView={activeView} onSetView={setActiveView} />
      <div className="flex flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
