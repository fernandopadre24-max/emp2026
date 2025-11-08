import React from 'react';
import { Client } from '../types';
import { UserIcon, PhoneIcon, MapPinIcon, HashtagIcon, PencilIcon, TrashIcon, PlusIcon } from './icons/Icons';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
  onNewClient: () => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onEdit, onDelete, onNewClient }) => {
  return (
    <>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Clientes</h1>
        <button
          onClick={onNewClient}
          className="flex items-center space-x-2 bg-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-secondary-hover transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Novo Cliente</span>
        </button>
      </div>
      {clients.length === 0 ? (
        <div className="text-center py-16 bg-surface-100 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-text-primary">Nenhum cliente cadastrado</h3>
          <p className="text-text-secondary mt-2">Clique em "Novo Cliente" para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => (
            <div key={client.id} className="bg-surface-100 rounded-xl shadow-lg p-6 space-y-4 transition-all hover:shadow-xl hover:-translate-y-1 relative group">
              <div className="absolute top-4 right-4 flex space-x-2 z-10">
                <button onClick={() => onEdit(client)} className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors" title="Editar Cliente">
                  <PencilIcon className="w-4 h-4 text-blue-600" />
                </button>
                <button onClick={() => onDelete(client.id)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" title="Excluir Cliente">
                  <TrashIcon className="w-4 h-4 text-red-600" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-indigo-500 text-white">
                  <UserIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{client.name}</h3>
                  <p className="text-sm text-text-secondary">ID: {client.id.substring(0, 10)}...</p>
                </div>
              </div>
              <div className="space-y-2 border-t border-surface-300 pt-4">
                <div className="flex items-center text-sm text-text-secondary">
                  <HashtagIcon className="w-5 h-5 mr-3 text-gray-400 shrink-0" />
                  <span>{client.cpf}</span>
                </div>
                <div className="flex items-center text-sm text-text-secondary">
                  <PhoneIcon className="w-5 h-5 mr-3 text-gray-400 shrink-0" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center text-sm text-text-secondary">
                  <MapPinIcon className="w-5 h-5 mr-3 text-gray-400 shrink-0" />
                  <span>{client.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ClientList;