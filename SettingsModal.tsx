import React, { useState, useEffect } from 'react';
import { VibrationPattern } from './constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (message: string, contacts: string[], isSilent: boolean, pattern: VibrationPattern, textColor: string) => void;
  initialMessage: string;
  initialContacts: string[];
  initialIsSilentMode: boolean;
  initialVibrationPattern: VibrationPattern;
  initialTextColor: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialMessage, 
  initialContacts, 
  initialIsSilentMode,
  initialVibrationPattern,
  initialTextColor
}) => {
  const [message, setMessage] = useState(initialMessage);
  const [contacts, setContacts] = useState<string[]>(initialContacts);
  const [newContact, setNewContact] = useState('');
  const [isSilent, setIsSilent] = useState(initialIsSilentMode);
  const [pattern, setPattern] = useState<VibrationPattern>(initialVibrationPattern);
  const [textColor, setTextColor] = useState<string>(initialTextColor);


  useEffect(() => {
    if (isOpen) {
      setMessage(initialMessage);
      setContacts(initialContacts);
      setIsSilent(initialIsSilentMode);
      setPattern(initialVibrationPattern);
      setTextColor(initialTextColor);
    }
  }, [initialMessage, initialContacts, initialIsSilentMode, initialVibrationPattern, initialTextColor, isOpen]);

  if (!isOpen) return null;

  const handleAddContact = () => {
    if (newContact.trim() && !contacts.includes(newContact.trim())) {
      setContacts([...contacts, newContact.trim()]);
      setNewContact('');
    }
  };

  const handleRemoveContact = (contactToRemove: string) => {
    setContacts(contacts.filter(contact => contact !== contactToRemove));
  };

  const handleSave = () => {
    onSave(message, contacts, isSilent, pattern, textColor);
    onClose();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddContact();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">Alert Settings</h2>
        
        <div className="mb-6">
          <label htmlFor="customMessage" className="block text-sm font-medium text-gray-300 mb-2">Custom Message</label>
          <textarea
            id="customMessage"
            rows={4}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-red-500 focus:outline-none transition"
            placeholder="e.g., This is an emergency. I need help."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>

        <div className="mb-6">
            <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-300">Silent Mode</span>
                <div className="relative">
                    <input type="checkbox" className="sr-only" checked={isSilent} onChange={() => setIsSilent(!isSilent)} />
                    <div className="block bg-gray-600 w-12 h-6 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isSilent ? 'transform translate-x-6' : ''}`}></div>
                </div>
            </label>
            <p className="text-xs text-gray-400 mt-1">If enabled, the siren sound will be muted.</p>
        </div>

        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Vibration Pattern</label>
            <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer p-1">
                    <input
                        type="radio"
                        name="vibrationPattern"
                        value="SOS"
                        checked={pattern === 'SOS'}
                        onChange={() => setPattern('SOS')}
                        className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-sm">SOS</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-1">
                    <input
                        type="radio"
                        name="vibrationPattern"
                        value="CONTINUOUS"
                        checked={pattern === 'CONTINUOUS'}
                        onChange={() => setPattern('CONTINUOUS')}
                        className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-sm">Continuous Buzz</span>
                </label>
            </div>
        </div>

        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Display Text Color</label>
            <div className="flex gap-4">
                {['white', 'black', 'yellow'].map(color => (
                    <label key={color} className="flex items-center space-x-2 cursor-pointer p-1">
                        <input
                            type="radio"
                            name="textColor"
                            value={color}
                            checked={textColor === color}
                            onChange={() => setTextColor(color)}
                            className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 focus:ring-red-500 focus:ring-2"
                        />
                        <span className="text-sm capitalize">{color}</span>
                    </label>
                ))}
            </div>
             <p className="text-xs text-gray-400 mt-1">Color of the info text when signal is active.</p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="emergencyContacts" className="block text-sm font-medium text-gray-300 mb-2">Emergency Contacts</label>
          <div className="flex gap-2">
            <input
              type="tel"
              id="emergencyContacts"
              className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-red-500 focus:outline-none transition"
              placeholder="Enter phone number"
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleAddContact}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition"
              aria-label="Add Contact"
            >
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-6 max-h-32 overflow-y-auto pr-2">
          {contacts.length > 0 ? contacts.map((contact, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-700 p-2 rounded-md">
              <span className="break-all">{contact}</span>
              <button
                onClick={() => handleRemoveContact(contact)}
                className="text-gray-400 hover:text-white text-2xl leading-none ml-2 px-1"
                aria-label={`Remove ${contact}`}
              >
                &times;
              </button>
            </div>
          )) : <p className="text-gray-400 text-sm">No contacts added yet.</p>}
        </div>
        
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="py-2 px-4 text-gray-300 hover:text-white transition">Cancel</button>
          <button onClick={handleSave} className="py-2 px-6 bg-red-600 hover:bg-red-700 font-bold rounded-md transition">Save & Close</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;