import React, { useState, useCallback } from 'react';

const UploadIcon = () => (
    // FIX: Removed duplicate viewBox attribute which was causing a JSX error.
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 text-secondary">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);


const DocIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary mb-3"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>;
const TedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary mb-3"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>;
const SheetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary mb-3"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M8 13h1v4"></path><path d="M12 13h4"></path><path d="M12 17h4"></path><path d="M8 17h1"></path></svg>;
const GenerateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m14.5 9-5 5"></path><path d="m9.5 9 5 5"></path></svg>;
const Spinner = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>;


interface FileInputCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    acceptedFiles: string;
    onFileChange: (content: string) => void;
    fileName: string | null;
}

const FileInputCard: React.FC<FileInputCardProps> = ({ icon, title, description, acceptedFiles, onFileChange, fileName }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target?.result as string;
                if (fileContent) {
                    onFileChange(fileContent);
                }
            };
            reader.readAsText(file);
        }
        // Limpa o input para permitir o re-upload do mesmo arquivo
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };
    
    return (
        <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-gray-200 text-center flex flex-col items-center">
            {icon}
            <h3 className="text-lg font-bold text-primary">{title}</h3>
            <p className="text-sm text-text-light mt-2 mb-4 flex-grow">{description}</p>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={acceptedFiles}
                onChange={handleFileSelect}
            />
            <button
                onClick={handleButtonClick}
                className={`w-full flex items-center justify-center font-semibold py-2 px-4 rounded-lg transition-colors duration-300 ${
                    fileName
                        ? 'bg-green-100 text-secondary border border-secondary'
                        : 'bg-primary hover:bg-accent text-white'
                }`}
            >
                {fileName ? <><CheckIcon /> {fileName}</> : <><UploadIcon /> Carregar Arquivo</>}
            </button>
        </div>
    );
};


interface StartScreenProps {
  onGenerate: (files: { workPlan: string; executionTerm: string; budget: string; }) => void;
  isGenerating: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onGenerate, isGenerating }) => {
    const [files, setFiles] = useState<{ workPlan: string | null; executionTerm: string | null; budget: string | null; }>({
        workPlan: null,
        executionTerm: null,
        budget: null,
    });
    const [fileNames, setFileNames] = useState<{ workPlan: string | null; executionTerm: string | null; budget: string | null; }>({
        workPlan: null,
        executionTerm: null,
        budget: null,
    });
    
    const handleFileChange = useCallback((fileType: 'workPlan' | 'executionTerm' | 'budget', content: string) => {
        const inputElement = document.querySelector(`input[type="file"][accept*="${
            {workPlan: '.txt', executionTerm: '.doc', budget: '.xlsx'}[fileType]
        }"]`) as HTMLInputElement;
        
        const file = inputElement?.files?.[0];

        setFiles(prev => ({ ...prev, [fileType]: content }));
        if(file) {
           setFileNames(prev => ({...prev, [fileType]: file.name}));
        }
    }, []);

    const handleGenerate = () => {
        if (files.workPlan && files.executionTerm && files.budget) {
            onGenerate({
                workPlan: files.workPlan,
                executionTerm: files.executionTerm,
                budget: files.budget,
            });
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <GenerateIcon />
                    <h1 className="text-3xl font-bold text-primary">Gerador de Contratos por IA</h1>
                </div>
                <p className="mt-2 text-lg text-text-light max-w-3xl mx-auto">
                    Faça o upload dos documentos base para que a inteligência artificial possa gerar uma minuta inicial do seu contrato de cooperação.
                </p>
                 <p className="mt-4 text-sm text-text-light max-w-3xl mx-auto">
                    Para criar esses documentos geradores, consulte o <a href="https://docs.google.com/document/d/1mqQLij8NaT1c16LoNzyZYrYZHSvj_MpHuGWfqVYIqmE/edit?tab=t.0" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Playbook de Contratos do V-Lab</a>.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <FileInputCard
                    icon={<DocIcon />}
                    title="Plano de Trabalho"
                    description="O documento que detalha os objetivos, metas e etapas do projeto. Pode ser um arquivo de texto ou PDF."
                    acceptedFiles=".txt,.pdf,.md"
                    onFileChange={(content) => handleFileChange('workPlan', content)}
                    fileName={fileNames.workPlan}
                />
                <FileInputCard
                    icon={<TedIcon />}
                    title="Termo de Execução Descentralizada (TED)"
                    description="Documento para a gestão e acompanhamento do projeto, descrevendo o que se pretende alcançar com a descentralização dos créditos orçamentários. Inserir em WORD."
                    acceptedFiles=".doc,.docx"
                    onFileChange={(content) => handleFileChange('executionTerm', content)}
                    fileName={fileNames.executionTerm}
                />
                <FileInputCard
                    icon={<SheetIcon />}
                    title="Planilhas de Orçamento"
                    description="Contém os detalhes financeiros, custos e alocação de recursos. Planilhas de EXCEL são aceitas."
                    acceptedFiles=".xlsx,.xls"
                    onFileChange={(content) => handleFileChange('budget', content)}
                    fileName={fileNames.budget}
                />
            </div>

            <button
                onClick={handleGenerate}
                disabled={!files.workPlan || !files.executionTerm || !files.budget || isGenerating}
                className="w-full flex items-center justify-center bg-secondary hover:bg-accent disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg shadow-lg text-lg transition-all duration-300 transform hover:scale-105"
            >
                {isGenerating ? <Spinner /> : 'Gerar Contrato'}
            </button>

            {isGenerating && (
                <p className="text-center mt-4 text-text-light animate-pulse">
                    Analisando documentos e gerando contrato... Isso pode levar um momento.
                </p>
            )}
        </div>
    );
};

export default StartScreen;
