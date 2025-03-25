declare module 'react-native-calendar-strip' {
  import { ComponentType } from 'react';
  import { StyleProp, ViewStyle, TextStyle } from 'react-native';

  export interface CalendarStripProps {
    style?: StyleProp<ViewStyle>;
    innerStyle?: StyleProp<ViewStyle>;
    calendarColor?: string;
    startingDate?: Date;
    selectedDate?: Date;
    onDateSelected?: (date: Date) => void;
    showMonth?: boolean;
    showDayName?: boolean;
    showDayNumber?: boolean;
    scrollable?: boolean;
    iconContainer?: StyleProp<ViewStyle>;
    calendarHeaderStyle?: StyleProp<ViewStyle>;
    calendarHeaderFormat?: string;
    dateNameStyle?: StyleProp<TextStyle>;
    dateNumberStyle?: StyleProp<TextStyle>;
    highlightDateNameStyle?: StyleProp<TextStyle>;
    highlightDateNumberStyle?: StyleProp<TextStyle>;
    styleWeekend?: boolean;
    daySelectionAnimation?: {
      type: string;
      duration?: number;
      borderWidth?: number;
      borderHighlightColor?: string;
      highlightColor?: string;
      animType?: string;
      animUpdateType?: string;
      animProperty?: string;
      animSpringDamping?: number;
    };
    customDatesStyles?: Array<{
      startDate: Date;
      dateContainerStyle?: StyleProp<ViewStyle>;
      dateNameStyle?: StyleProp<TextStyle>;
      dateNumberStyle?: StyleProp<TextStyle>;
    }>;
    dayComponentHeight?: number;
    upperCaseDays?: boolean;
  }

  const CalendarStrip: ComponentType<CalendarStripProps>;
  export default CalendarStrip;
} 