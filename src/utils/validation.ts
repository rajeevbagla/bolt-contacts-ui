import { ContactFormData, ValidationErrors } from '../types/Contact';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\d{6,15}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
};

export const validateContactForm = (data: ContactFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.phone.trim()) {
    errors.phone = 'Phone is required';
  } else if (!validatePhone(data.phone)) {
    errors.phone = 'Phone must be 6-15 digits only';
  }

  if (!data.company.trim()) {
    errors.company = 'Company is required';
  }

  return errors;
};