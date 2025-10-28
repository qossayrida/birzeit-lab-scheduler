import { LanguageProvider } from './context/LanguageContext';
import { useEffect, useState } from 'react';
import { Calendar, Users, Table } from 'lucide-react';
import { AppShell } from './components/AppShell';
import { FetchPanel } from './components/FetchPanel';
import { TAFormList } from './components/TAFormList';
import { LabTable } from './components/LabTable';
import { ScheduleGrid } from './components/ScheduleGrid';
import { TAView } from './components/TAView';
import { UnassignedPanel } from './components/UnassignedPanel';
import { Tabs } from './components/Tabs';
import { useStore } from './store/useStore';
import { initStorage } from './lib/storage';

function App() {
  const { initialize, isLoading } = useStore();
  const [activeTab, setActiveTab] = useState('setup');

  useEffect(() => {
    initStorage();
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'setup', label: 'Setup', icon: <Table className="w-4 h-4" /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
    { id: 'tas', label: 'TA View', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <LanguageProvider>
      <AppShell>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'setup' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FetchPanel />
              <TAFormList />
            </div>
            <LabTable />
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <UnassignedPanel />
            <ScheduleGrid />
          </div>
        )}

        {activeTab === 'tas' && (
          <div className="space-y-6">
            <UnassignedPanel />
            <TAView />
          </div>
        )}
      </AppShell>
    </LanguageProvider>
  );
}

export default App;
