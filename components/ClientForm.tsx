import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { formatCPF, formatPhone } from '../utils/formatters';

interface ClientFormProps {
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (client: Client) => void;
  clientToEdit: Client | null;
  closeModal: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ addClient, updateClient, clientToEdit, closeModal }) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name);
      setCpf(clientToEdit.cpf);
      setPhone(clientToEdit.phone);
      setAddress(clientToEdit.address);
    }
  }, [clientToEdit]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length <= 11) {
      setCpf(rawValue);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
     if (rawValue.length <= 11) {
      setPhone(rawValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cpf.trim() || !phone.trim() || !address.trim()) {
        alert("Por favor, preencha todos os campos.");
        return;
    }
    const clientData = { name, cpf, phone, address };
    
    if (clientToEdit) {
      updateClient({ ...clientData, id: clientToEdit.id });
    } else {
      addClient(clientData);
    }
    
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
        <input type="text" value={formatCPF(cpf)} onChange={handleCpfChange} className={inputStyles} placeholder="000.000.000-00" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Telefone</label>
        <input type="tel" value={formatPhone(phone)} onChange={handlePhoneChange} className={inputStyles} placeholder="(00) 00000-0000" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Endereço</label>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputStyles} required />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-md hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">{clientToEdit ? 'Atualizar Cliente' : 'Salvar Cliente'}</button>
      </div>
    </form>
  );
};

export default ClientForm;