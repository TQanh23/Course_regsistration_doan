declare module 'react-native-slideable-calendar-strip' {
  import { ComponentType } from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  interface CalendarStripProps {
    style?: ViewStyle;
    selectedDate?: Date;
    startingDate?: Date;
    minDate?: Date;
    maxDate?: Date;
    showMonth?: boolean;
    showDayName?: boolean;
    showDayNumber?: boolean;
    daySelectionAnimation?: {
      type: string;
      duration?: number;
      highlightColor?: string;
      animType?: string;
      animUpdateType?: string;
      animProperty?: string;
      animSpringDamping?: number;
    };
    dateNameStyle?: TextStyle;
    dateNumberStyle?: TextStyle;
    highlightDateNameStyle?: TextStyle;
    highlightDateNumberStyle?: TextStyle;
    dayContainerStyle?: ViewStyle;
    customDatesStyles?: Array<{
      startDate: Date;
      dateContainerStyle?: ViewStyle;
      dateNameStyle?: TextStyle;
      dateNumberStyle?: TextStyle;
    }>;
    onDateSelected?: (date: Date) => void;
  }

  const CalendarStrip: ComponentType<CalendarStripProps>;
  export default CalendarStrip;
} 