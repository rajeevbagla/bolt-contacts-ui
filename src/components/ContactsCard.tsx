import React, { useState } from 'react';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Contact, ContactFormData } from '../types/Contact';
import { ContactTable } from './ContactTable';
import { ContactModal } from './ContactModal';
import { Pagination } from './Pagination';

interface ContactsCardProps {
  user: any;
  contactsHook: ReturnType<typeof import('../hooks/useContacts').useContacts>;
}

export const ContactsCard: React.FC<ContactsCardProps> = ({ user, contactsHook }) => {
  const {
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
    clearContacts
  } = contactsHook;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const handleAddContact = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleSaveContact = async (formData: ContactFormData) => {
    if (editingContact) {
      await updateContact(editingContact.id, formData);
    } else {
      await createContact(formData);
    }
    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleDeleteContact = async (id: string) => {
    const contact = contacts.find(c => c.id === id);
    const confirmMessage = contact 
      ? `Are you sure you want to delete "${contact.name}"? This action cannot be undone.`
      : 'Are you sure you want to delete this contact?';
      
    if (window.confirm(confirmMessage)) {
      await deleteContact(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  };

  // Clear contacts when user logs out
  React.useEffect(() => {
    if (!user) {
      clearContacts();
    }
  }, [user, clearContacts]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search name/email/phone..."
              />
            </div>
            <button
              onClick={handleAddContact}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="relative">
          <ContactTable
            contacts={contacts}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            isLoading={isLoading}
          />
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalContacts={totalContacts}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1); // Reset to first page when changing page size
          }}
        />

        {/* Modal */}
        <ContactModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveContact}
          contact={editingContact}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};