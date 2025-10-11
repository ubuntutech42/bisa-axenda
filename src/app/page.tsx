
import DashboardPage from './dashboard/page';

export default function HomePage() {
  // The logic to show landing vs dashboard is handled in AppContent based on user auth state.
  // This page will only be rendered for authenticated users within the main app layout.
  return <DashboardPage />;
}
