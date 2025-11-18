
import LandingLayout from "@/app/landing/layout";
import LandingPage from "@/app/landing/page";

export default function HomePage() {
  // This page will now directly render the landing page content.
  // The AppContent component will handle redirects for authenticated users if they land here.
  return (
    <LandingLayout>
        <LandingPage/>
    </LandingLayout>
  );
}
