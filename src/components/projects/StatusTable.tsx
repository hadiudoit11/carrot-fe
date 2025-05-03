import React, { useState } from 'react';
import { TrashIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

interface StatusType {
  name: string;
  type: string;
  color: string;
}

interface StatusTableProps {
  defaultStatuses: StatusType[];
  onChange: (statuses: StatusType[]) => void;
}

export default function StatusTable({ defaultStatuses, onChange }: StatusTableProps) {
  const [statuses, setStatuses] = useState<StatusType[]>([...defaultStatuses]);

  const handleNameChange = (index: number, newName: string) => {
    const updatedStatuses = [...statuses];
    updatedStatuses[index] = { ...updatedStatuses[index], name: newName };
    setStatuses(updatedStatuses);
    onChange(updatedStatuses);
  };

  const handleTypeChange = (index: number, newType: string) => {
    const updatedStatuses = [...statuses];
    const selectedStatus = defaultStatuses.find(status => status.type === newType);
    
    if (selectedStatus) {
      updatedStatuses[index] = { 
        ...updatedStatuses[index], 
        type: newType,
        color: selectedStatus.color 
      };
      setStatuses(updatedStatuses);
      onChange(updatedStatuses);
    }
  };

  const handleRemoveStatus = (index: number) => {
    if (statuses.length <= 1) return; // Prevent removing the last status
    
    const updatedStatuses = statuses.filter((_, i) => i !== index);
    setStatuses(updatedStatuses);
    onChange(updatedStatuses);
  };

  const handleAddStatus = () => {
    // Add a new status with default values
    const newStatus = { ...defaultStatuses[0] }; // Clone the first default status
    const updatedStatuses = [...statuses, newStatus];
    setStatuses(updatedStatuses);
    onChange(updatedStatuses);
  };

  return (
    <div className="overflow-x-auto font-secondary">
      <div className="bg-form-bg-secondary rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-form-border-light">
          <thead>
            <tr className="bg-form-bg-secondary">
              <th className="px-6 py-3 text-left text-xs font-medium text-form-text-secondary uppercase tracking-wider font-primary">
                Status Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-form-text-secondary uppercase tracking-wider font-primary">
                Status Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-form-text-secondary uppercase tracking-wider font-primary w-16">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-form-bg-main divide-y divide-form-border-light">
            {statuses.map((status, index) => (
              <tr key={index} className="hover:bg-form-bg-hover transition-colors">
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-3 flex-shrink-0" 
                      style={{ backgroundColor: status.color }}
                    ></span>
                    <input
                      type="text"
                      value={status.name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      className="form-input"
                    />
                  </div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  <select
                    value={status.type}
                    onChange={(e) => handleTypeChange(index, e.target.value)}
                    className="form-select"
                  >
                    {defaultStatuses.map((option) => (
                      <option key={option.type} value={option.type}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveStatus(index)}
                    className="text-form-button-danger-bg hover:text-form-button-danger-hover transition-colors disabled:opacity-50"
                    disabled={statuses.length <= 1}
                    aria-label="Remove status"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4">
        <button
          type="button"
          onClick={handleAddStatus}
          className="flex items-center text-form-button-primary-bg hover:text-form-button-primary-hover font-primary px-2 py-1 rounded text-sm focus:outline-none transition-colors"
        >
          <PlusCircleIcon className="h-5 w-5 mr-1" />
          Add Status
        </button>
      </div>
    </div>
  );
}