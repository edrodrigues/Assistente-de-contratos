
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ClientInfo } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY do Gemini não encontrada. Verifique as variáveis de ambiente.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateContractFromFiles = async (workPlan: string, executionTerm: string, budget: string): Promise<string> => {
    const fullPrompt = `
      Você é um especialista em direito administrativo brasileiro, encarregado de redigir um Acordo de Cooperação Técnica.

      Com base nos seguintes documentos fornecidos, gere uma minuta completa e formal do contrato. A sua resposta DEVE ser formatada em Markdown, usando um cabeçalho de Nível 1 (ex: # TÍTULO DA CLÁUSULA) para o título de cada cláusula do contrato. Não inclua texto ou explicações antes da primeira cláusula.

      **1. PLANO DE TRABALHO:**
      ---
      ${workPlan}
      ---

      **2. TERMO DE EXECUÇÃO:**
      ---
      ${executionTerm}
      ---

      **3. PLANILHAS DE ORÇAMENTO:**
      ---
      ${budget}
      ---

      O contrato gerado deve ser bem estruturado, com cláusulas claras cobrindo o objeto, as obrigações das partes, o cronograma, os custos envolvidos (com base no orçamento), a vigência, a propriedade intelectual, e as condições de rescisão. A linguagem deve ser formal e juridicamente adequada para um documento oficial no Brasil.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
        });

        const text = response.text;
        if (!text) {
            throw new Error("O modelo de IA não retornou texto. Tente novamente.");
        }

        return text;
    } catch (error) {
        console.error("Erro ao gerar contrato com Gemini:", error);
        throw new Error("Falha ao gerar o contrato.");
    }
};

export const getContractSuggestion = async (guidancePrompt: string, fullContractText: string, userTask: string, clientInfo?: ClientInfo): Promise<string> => {
    try {
        const clientInfoText = (clientInfo && (clientInfo.name || clientInfo.site || clientInfo.cnpj)) ? `

**DADOS DO CLIENTE (para referência):**
---
Nome: ${clientInfo.name || 'Não informado'}
Site: ${clientInfo.site || 'Não informado'}
CNPJ: ${clientInfo.cnpj || 'Não informado'}
---` : '';

        const fullPrompt = `Você é um assistente especialista em contratos administrativos de cooperação entre a V-Lab e a UFPE.${clientInfoText}

        Use as informações do cliente e, se necessário, a busca na web para obter informações atualizadas e precisas para contextualizar sua resposta.

        **PADRÃO E EXEMPLOS (REGRAS):**
        ---
        ${guidancePrompt}
        ---

        **CONTRATO ATUAL (rascunho):**
        ---
        ${fullContractText}
        ---

        **TAREFA DO USUÁRIO:**
        ---
        ${userTask}
        ---

        Sua resposta deve ser apenas o texto sugerido para a tarefa do usuário, seguindo estritamente as regras fornecidas. Não inclua introduções, explicações ou formatação extra.`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        return response.text ?? 'Desculpe, não consegui gerar uma sugestão no momento.';
    } catch (error) {
        console.error("Erro ao gerar sugestão do Gemini:", error);
        return "Desculpe, não consegui gerar uma sugestão no momento.";
    }
};
