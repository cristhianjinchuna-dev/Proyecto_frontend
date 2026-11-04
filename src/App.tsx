import { useState } from 'react';
import { UniversidadSelect } from './components/UniversidadSelect';
function App() {
  const [universidadId, setUniversidadId] = useState<number | ''>('');

  return (
    <main className="mx-auto mt-10 max-w-md space-y-4 p-4">
      <h1 className="text-2xl font-bold">Prueba EP 001</h1>
      <UniversidadSelect value={universidadId} onChange={setUniversidadId} />
      <p className="text-gray-600">ID seleccionado: {universidadId || 'ninguno'}</p>
    </main>
  );
}

export default App;