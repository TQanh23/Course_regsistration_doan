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
import { Picker } from '@react-native-picker/picker';
import { courseService } from '../src/api/services/courseService';
import { registrationService } from '../src/api/services/registrationService';
import { Ionicons } from '@expo/vector-icons';

// Define type for a course
type Course = {
  id: number;
  course_code: string;
  title: string;
  course_description?: string;
  credits: number;
  category_name?: string;
  max_capacity: number;
  current_enrollment?: number;
  term_id?: number;
  term_name?: string;
};

// Define type for academic term
type Term = {
  id: number;
  term_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

const DangKyHocPhan = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registering, setRegistering] = useState<{[key: number]: boolean}>({});

  // Load available terms when component mounts
  useEffect(() => {
    fetchTerms();
  }, []);

  // Load courses when a term is selected
  useEffect(() => {
    if (selectedTerm) {
      fetchCourses(selectedTerm);
    }
  }, [selectedTerm]);

  // Fetch list of academic terms
  const fetchTerms = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllTerms();
      setTerms(response.data);
      
      // Select the active term by default
      const activeTerm = response.data.find((term: Term) => term.is_active);
      if (activeTerm) {
        setSelectedTerm(activeTerm.id);
      } else if (response.data.length > 0) {
        setSelectedTerm(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
      Alert.alert('Error', 'Failed to load academic terms');
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses for the selected term
  const fetchCourses = async (termId: number) => {
    try {
      setLoading(true);
      const response = await courseService.getCoursesByTerm(termId);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      Alert.alert('Error', 'Failed to load courses for the selected term');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedTerm) {
      try {
        await fetchCourses(selectedTerm);
      } catch (error) {
        console.error('Error refreshing courses:', error);
      }
    }
    setRefreshing(false);
  };

  // Register for a course
  const registerForCourse = async (course: Course) => {
    if (!selectedTerm) return;
    
    try {
      setRegistering(prev => ({ ...prev, [course.id]: true }));
      await registrationService.registerCourse(course.id, selectedTerm);
      
      Alert.alert(
        'Success', 
        `You have successfully registered for ${course.title}`
      );
      
      // Refresh the course list to show updated enrollment
      fetchCourses(selectedTerm);
    } catch (error: any) {
      console.error('Error registering for course:', error);
      let errorMessage = 'Failed to register for the course';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setRegistering(prev => ({ ...prev, [course.id]: false }));
    }
  };

  // Render a course item in the list
  const renderCourseItem = ({ item }: { item: Course }) => {
    const isAvailable = !item.current_enrollment || item.current_enrollment < item.max_capacity;
    const isRegistering = registering[item.id] || false;
    
    return (
      <View style={styles.courseItem}>
        <View style={styles.courseInfo}>
          <Text style={styles.courseCode}>{item.course_code}</Text>
          <Text style={styles.courseTitle}>{item.title}</Text>
          <Text style={styles.courseDetails}>
            {item.credits} credits | {item.category_name || 'General'}
          </Text>
          <Text style={styles.enrollment}>
            Enrollment: {item.current_enrollment || 0}/{item.max_capacity}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.registerButton,
            !isAvailable && styles.registerButtonDisabled
          ]}
          disabled={!isAvailable || isRegistering}
          onPress={() => registerForCourse(item)}
        >
          {isRegistering ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>
              {isAvailable ? 'Register' : 'Full'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Course Registration</Text>
      
      {/* Term selector */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Select Term:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedTerm}
            onValueChange={(itemValue) => setSelectedTerm(itemValue)}
            style={styles.picker}
            enabled={!loading}
          >
            {terms.map((term) => (
              <Picker.Item 
                key={term.id} 
                label={term.term_name} 
                value={term.id} 
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Course list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003366" />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      ) : courses.length > 0 ? (
        <FlatList
          data={courses}
          renderItem={renderCourseItem}
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
          <Ionicons name="alert-circle-outline" size={60} color="#999" />
          <Text style={styles.emptyText}>No courses available for this term</Text>
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
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
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
  enrollment: {
    fontSize: 14,
    color: '#444',
  },
  registerButton: {
    backgroundColor: '#003366',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  registerButtonDisabled: {
    backgroundColor: '#bbb',
  },
  registerButtonText: {
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
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default DangKyHocPhan;
