import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './elyron/AppSidebar';
import { TopBar } from './elyron/TopBar';
import { AiTutor } from './elyron/AiTutor';

/**
 * Shell compartido. `portal` ('campus' | 'admin') controla si se muestra
 * el tutor IA (solo en el portal de consumo/campus).
 */
export const Layout = ({ portal = 'campus' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const showTutor = portal === 'campus';

  return (
    <div className="flex min-h-screen bg-canvas text-ink-900">
      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onOpenTutor={() => setTutorOpen(true)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
      {showTutor && <AiTutor open={tutorOpen} onOpenChange={setTutorOpen} />}
    </div>
  );
};
