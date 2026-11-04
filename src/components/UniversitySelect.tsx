import { useUniversities } from '../hooks/useUniversities';

interface UniversitySelectProps {
  id?: string;
  value: number | '';
  onChange: (universityId: number | '') => void;
  invalid?: boolean;
}

export function UniversitySelect({ id, value, onChange, invalid = false }: UniversitySelectProps) {
  const { universities, loading, error } = useUniversities();

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <select
      id={id}
      value={value}
      aria-invalid={invalid}
      onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      disabled={loading}
      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
        invalid ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
      }`}
    >
      <option value="">{loading ? 'Cargando universidades...' : 'Selecciona tu universidad'}</option>
      {universities.map((university) => (
        <option key={university.id} value={university.id}>
          {university.nombre}
        </option>
      ))}
    </select>
  );
}