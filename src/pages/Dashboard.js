import { Sidebar } from '../components/organisms/Sidebar.js';
import { MainDashboardLayout } from '../components/organisms/MainDashboardLayout.js';
import { UserModal } from '../components/organisms/UserModal.js';
import { AdminModal } from '../components/organisms/AdminModal.js';
import { DeleteDataModal } from '../components/organisms/DeleteDataModal.js';

export const DashboardTemplate = () => `
  <div class="min-h-screen relative z-10 w-full flex bg-bg text-text selection:bg-cyan/30">
    <!-- SIDEBAR ORGANISM -->
    ${Sidebar()}
    
    <!-- MAIN DASHBOARD ORGANISM -->
    ${MainDashboardLayout()}

    <!-- MODALS -->
    ${AdminModal()}
    ${DeleteDataModal()}
    ${UserModal()}
  </div>
`;
