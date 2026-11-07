import { useState } from 'react';
import { Building2, GraduationCap, School } from 'lucide-react';
import { LandlordsTable } from '../../components/admin/LandlordsTable';
import { StudentsTable } from '../../components/admin/StudentsTable';
import { UniversitiesPanel } from '../../components/admin/UniversitiesPanel';

type Tab = 'landlords' | 'students' | 'universities';

const TABS: { id: Tab; label: string; Icon: typeof Building2 }[] = [
  { id: 'landlords', label: 'Arrendadores', Icon: Building2 },
  { id: 'students', label: 'Estudiantes', Icon: GraduationCap },
  { id: 'universities', label: 'Universidades', Icon: School },
];

// UI 022 - admin panel: verify landlords (EP 036), list students (EP 037), manage universities (EP 038-039)
export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState<Tab>('landlords');

  return (
    <section className="space-y-6 py-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Panel de administrador</h1>
        <p className="mt-1 text-gray-600">Gestiona arrendadores, estudiantes y universidades.</p>
      </header>

      <div role="tablist" className="flex flex-wrap gap-2 border-b border-gray-200">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'landlords' && <LandlordsTable />}
      {activeTab === 'students' && <StudentsTable />}
      {activeTab === 'universities' && <UniversitiesPanel />}
    </section>
  );
}
