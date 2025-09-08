import React, { useState } from 'react';
import { PlusIcon } from './icons';

interface AddPersonFormProps {
  onAddPerson: (name: string) => void;
}

const AddPersonForm: React.FC<AddPersonFormProps> = ({ onAddPerson }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddPerson(name.trim());
      setName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <div>
        <label htmlFor="person-name" className="sr-only">Person's Name</label>
        <input
          id="person-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter person's name"
          className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
          autoFocus
        />
       </div>
       <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-amber-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          <PlusIcon />
          Add Person
        </button>
    </form>
  );
};

export default AddPersonForm;