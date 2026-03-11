import { Sidebar } from '../components/organisms/Sidebar.js';
import { MainDashboardLayout } from '../components/organisms/MainDashboardLayout.js';

export const DashboardTemplate = () => `
  <div class="min-h-screen relative z-10 w-full flex bg-bg text-text selection:bg-cyan/30">
    <!-- SIDEBAR ORGANISM -->
    ${Sidebar()}
    
    <!-- MAIN DASHBOARD ORGANISM -->
    ${MainDashboardLayout()}
  </div>
`;
