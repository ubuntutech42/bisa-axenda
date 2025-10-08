import { Header } from '@/components/layout/Header';
import { EventCalendar } from '@/components/calendar/EventCalendar';

export default function CalendarPage() {
  return (
    <div>
      <Header title="Ancestral Calendar" />
      <EventCalendar />
    </div>
  );
}
