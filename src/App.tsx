import { useState } from 'react';
import { UniversitySelect } from './components/UniversitySelect';
function App() {
const [universityId, setUniversityId] = useState<number | ''>('');

  return (
    <main className="mx-auto mt-10 max-w-md space-y-4 p-4">
      <h1 className="text-2xl font-bold">Prueba EP 001</h1>
      <UniversitySelect value={universityId} onChange={setUniversityId} />
      <p className="text-gray-600">ID seleccionado: {universityId || 'ninguno'}</p>
    </main>
  );
}

export default App;