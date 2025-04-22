import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl
} from 'react-native';
import { registrationService } from '../src/api/services/registrationService';
import { Ionicons } from '@expo/vector-icons';

// Define types for API data
type Registration = {
  id: number;
  student_id: number;
  course_id: number;
  term_id: number;
  registration_date: string;
  status: string;
  course: {
    id: number;
    course_code: string;
    title: string;
    credits: number;
    course_description?: string;
  };
  term?: {
    id: number;
    term_name: string;
  };
};

const DanhSachMonHocdangky = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [droppingCourse, setDroppingCourse] = useState<{[key: number]: boolean}>({});

  // Load registered courses when component mounts
  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Fetch all registrations for the current student
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await registrationService.getMyRegistrations();
      setRegistrations(response.data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      Alert.alert(
        'Error',
        'Failed to load your course registrations. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchRegistrations();
    } catch (error) {
      console.error('Error refreshing registrations:', error);
    }
    setRefreshing(false);
  };

  // Drop/cancel a course registration
  const dropCourse = async (registration: Registration) => {
    Alert.alert(
      'Drop Course',
      `Are you sure you want to drop ${registration.course.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Drop Course',
          style: 'destructive',
          onPress: async () => {
            try {
              setDroppingCourse(prev => ({ ...prev, [registration.id]: true }));
              await registrationService.dropCourse(registration.id);
              
              Alert.alert(
                'Success', 
                `You have successfully dropped ${registration.course.title}`
              );
              
              // Refresh the list
              fetchRegistrations();
            } catch (error) {
              console.error('Error dropping course:', error);
              let errorMessage = 'Failed to drop the course';
              
              const err = error as any;
              if (err?.response?.data?.message) {
                errorMessage = err.response.data.message;
              }
              
              Alert.alert('Error', errorMessage);
            } finally {
              setDroppingCourse(prev => ({ ...prev, [registration.id]: false }));
            }
          }
        }
      ]
    );
  };

  // Render a registration item
  const renderRegistrationItem = ({ item }: { item: Registration }) => {
    const isDropping = droppingCourse[item.id] || false;
    
    return (
      <View style={styles.courseItem}>
        <View style={styles.courseInfo}>
          <Text style={styles.courseCode}>{item.course.course_code}</Text>
          <Text style={styles.courseTitle}>{item.course.title}</Text>
          <Text style={styles.courseDetails}>
            {item.course.credits} credits | {item.term?.term_name || 'Current Term'}
          </Text>
          <Text style={styles.registrationDate}>
            Registered: {new Date(item.registration_date).toLocaleDateString()}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.dropButton}
          disabled={isDropping}
          onPress={() => dropCourse(item)}
        >
          {isDropping ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.dropButtonText}>Drop</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Registered Courses</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003366" />
          <Text style={styles.loadingText}>Loading registrations...</Text>
        </View>
      ) : registrations.length > 0 ? (
        <FlatList
          data={registrations}
          renderItem={renderRegistrationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#003366']}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="school-outline" size={60} color="#999" />
          <Text style={styles.emptyText}>You haven't registered for any courses yet</Text>
          <TouchableOpacity 
            style={styles.registerNowButton}
            onPress={() => {
              // Navigate to DangKyHocPhan screen
              // Requires navigation prop, which we would need to add
            }}
          >
            <Text style={styles.registerNowText}>Register Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  courseItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  courseInfo: {
    flex: 1,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  courseDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  registrationDate: {
    fontSize: 13,
    color: '#888',
  },
  dropButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  dropButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  registerNowButton: {
    backgroundColor: '#003366',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  registerNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DanhSachMonHocdangky;