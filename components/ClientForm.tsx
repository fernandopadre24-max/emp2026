import React, { useState } from 'react';
import { Client } from '../types';

interface ClientFormProps {
  addClient: (client: Omit<Client, 'id'>) => void;
  closeModal: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ addClient, closeModal }) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cpf.trim() || !phone.trim() || !address.trim()) {
        alert("Por favor, preencha todos os campos.");
        return;
    }
    addClient({ name, cpf, phone, address });
    closeModal();
  };
  
  const inputStyles = "w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-surface-100 text-text-primary";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Nome Completo</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">CPF</label>
        <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} className={inputStyles} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Telefone</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputStyles} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Endereço</label>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputStyles} required />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-md hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">Salvar Cliente</button>
      </div>
    </form>
  );
};

export default ClientForm;
