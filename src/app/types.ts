export type Location =
  | 'sypialnia'
  | 'salon'
  | 'łazienka'
  | 'kuchnia'
  | 'balkon'
  | 'całe mieszkanie';
export type Interval = '1 tydzień' | '2 tygodnie' | '1 miesiąc' | '3 miesiące' | '6 miesięcy';
export interface TodoItem {
  id: number;
  description: string;
  location: Location;
  interval: Interval;
  lastCleaned: Date | null;
}
