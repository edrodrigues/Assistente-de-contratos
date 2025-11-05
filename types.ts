
export interface Section {
  id: string;
  title: string;
  content: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  googleDocLink?: string;
  sections: Section[];
  guidancePrompt: string; // Instructions and examples for Gemini
}

export interface ClientInfo {
  name: string;
  site: string;
  cnpj: string;
}
