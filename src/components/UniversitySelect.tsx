import { useUniversities } from '../hooks/useUniversities';

interface UniversitySelectProps {
  value: number | '';
  onChange: (id: number | '') => void;
}

export function UniversitySelect({ value, onChange }: UniversitySelectProps) {
  const { universities, loading, error } = useUniversities();

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      disabled={loading}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
    >
      <option value="">{loading ? 'Cargando universidades...' : 'Selecciona tu universidad'}</option>
      {universities.map((u) => (
        <option key={u.id} value={u.id}>
          {u.nombre}
        </option>
      ))}
    </select>
  );
}