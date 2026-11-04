import type { RegisterRole } from '../../types/auth';

const OPTIONS: { value: RegisterRole; label: string }[] = [
  { value: 'ESTUDIANTE', label: 'Soy estudiante' },
  { value: 'ARRENDADOR', label: 'Soy arrendador' },
];

interface RoleSelectorProps {
  value: RegisterRole;
  onChange: (role: RegisterRole) => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Tipo de cuenta" className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              selected ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}