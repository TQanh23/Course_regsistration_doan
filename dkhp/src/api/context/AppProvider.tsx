import React from 'react';
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './NotificationContext';
import { StudentProvider } from './StudentContext';
import { DepartmentProvider } from './DepartmentContext';
import { ModuleProvider } from './ModuleContext';
import { RoomProvider } from './RoomContext';
import { RegistrationProvider } from './RegistrationContext';
import { RegistrationAnalyticsProvider } from './RegistrationAnalyticsContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <StudentProvider>
          <DepartmentProvider>
            <ModuleProvider>
              <RoomProvider>
                <RegistrationProvider>
                  <RegistrationAnalyticsProvider>
                    {children}
                  </RegistrationAnalyticsProvider>
                </RegistrationProvider>
              </RoomProvider>
            </ModuleProvider>
          </DepartmentProvider>
        </StudentProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};