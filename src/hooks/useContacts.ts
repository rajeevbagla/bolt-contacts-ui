import { useState, useMemo, useEffect, useCallback } from 'react';
import { listContacts, createContact as apiCreateContact, updateContact as apiUpdateContact, deleteContact as apiDeleteContact, ContactListParams, ContactListResponse } from '../api';
import toast from 'react-hot-toast';
import { Contact, ContactFormData } from '../types/Contact';

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useContacts = (user: any = null) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [ordering, setOrdering] = useState('');

  const fetchContacts = useCallback(async (params: Partial<ContactListParams> = {}) => {
    if (!user) {
      setContacts([]);
      setTotalContacts(0);
      return;
    }
    
    setIsLoading(true);
    try {
      const response: ContactListResponse = await listContacts({
        page: currentPage,
        page_size: pageSize,
        search: debouncedSearchQuery || undefined,
        ordering: ordering || undefined,
        ...params
      });
      
      setContacts(response.results);
      setTotalContacts(response.count);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch contacts');
      setContacts([]);
      setTotalContacts(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchQuery, ordering, user]);

  // Fetch contacts when dependencies change
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchQuery]);

  const totalPages = Math.ceil(totalContacts / pageSize);

  const createContact = async (formData: ContactFormData): Promise<Contact> => {
    setIsLoading(true);
    
    try {
      const newContact = await apiCreateContact(formData);
      toast.success('Contact created successfully!');
      
      // Refresh the contacts list
      await fetchContacts({ page: 1 });
      setCurrentPage(1);
      
      return newContact;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create contact');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateContact = async (id: string, formData: ContactFormData): Promise<Contact> => {
    setIsLoading(true);
    
    try {
      const updatedContact = await apiUpdateContact(id, formData);
      toast.success('Contact updated successfully!');
      
      // Refresh the contacts list
      await fetchContacts();
      
      return updatedContact;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update contact');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContact = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      await apiDeleteContact(id);
      toast.success('Contact deleted successfully!');
      
      // Refresh the contacts list
      await fetchContacts();
      
      // Adjust pagination if current page is now empty
      if (contacts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      toast.error('Failed to delete contact');
    } finally {
      setIsLoading(false);
    }
  };

  const clearContacts = () => {
    setContacts([]);
    setTotalContacts(0);
    setCurrentPage(1);
    setSearchQuery('');
  };

  return {
    contacts,
    totalContacts,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    isLoading,
    createContact,
    updateContact,
    deleteContact,
    clearContacts,
    refreshContacts: () => fetchContacts()
  };
};