export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
  created: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
}

export interface User {
  username: string;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
}