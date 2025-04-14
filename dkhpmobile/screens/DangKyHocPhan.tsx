import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../src/api/context/AuthContext';
import courseService, { CourseOfferingModel, AcademicTermModel } from '../src/api/services/courseService';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DangKyHocPhan = () => {
  // Authentication context for user token
  const { user, isAuthenticated } = useAuth();

  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terms, setTerms] = useState<AcademicTermModel[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [availableCourses, setAvailableCourses] = useState<CourseOfferingModel[]>([]);
  const [registrationType, setRegistrationType] = useState('NEW'); // NEW, RETAKE, IMPROVE

  // Load academic terms when component mounts
  useEffect(() => {
    const loadTerms = async () => {
      try {
        setLoading(true);
        const termsData = await courseService.getActiveTerms();
        setTerms(termsData);
        // Set the first term as selected by default if available
        if (termsData.length > 0) {
          setSelectedTermId(termsData[0].id);
        }
      } catch (err) {
        console.error('Error loading terms:', err);
        setError('Không thể tải dữ liệu học kỳ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadTerms();
  }, []);

  // Load available courses when term selection changes
  useEffect(() => {
    const loadAvailableCourses = async () => {
      if (!selectedTermId) return;

      try {
        setLoading(true);
        // Use the new getAvailableCoursesBySemester function instead
        const coursesData = await courseService.getAvailableCoursesBySemester(selectedTermId);
        setAvailableCourses(coursesData);
        setError(null);
      } catch (err) {
        console.error('Error loading available courses:', err);
        setError('Không thể tải dữ liệu học phần. Vui lòng thử lại sau.');
        setAvailableCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadAvailableCourses();
  }, [selectedTermId]);

  // Handle term selection change
  const handleTermChange = (termId: number) => {
    setSelectedTermId(termId);
  };

  // Handle registration type change
  const handleRegistrationTypeChange = (type: string) => {
    setRegistrationType(type);
  };

  // Handle course registration
  const handleRegisterCourse = (course: CourseOfferingModel) => {
    Alert.alert(
      'Xác nhận đăng ký',
      `Bạn có chắc chắn muốn đăng ký học phần "${course.title}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng ký', 
          onPress: () => {
            // TODO: Connect to registration API
            Alert.alert('Thành công', `Đã đăng ký học phần "${course.title}" thành công.`);
          } 
        }
      ]
    );
  };

  // Render course item
  const renderCourseItem = ({ item }: { item: CourseOfferingModel }) => (
    <View style={styles.courseCard}>
      <View style={styles.courseHeader}>
        <Text style={styles.courseCode}>{item.code}</Text>
        <Text style={styles.courseSeats}>Còn {item.available_seats} chỗ</Text>
      </View>
      <Text style={styles.courseTitle}>{item.title}</Text>
      <View style={styles.courseInfo}>
        <Text style={styles.courseInfoText}>Số tín chỉ: {item.credits}</Text>
        <Text style={styles.courseInfoText}>Lớp: {item.section_number}</Text>
      </View>
      {item.professor_name && (
        <Text style={styles.courseInfoText}>Giảng viên: {item.professor_name}</Text>
      )}
      {item.building && item.room_number && (
        <Text style={styles.courseInfoText}>Phòng: {item.building}-{item.room_number}</Text>
      )}
      <TouchableOpacity 
        style={styles.registerButton}
        onPress={() => handleRegisterCourse(item)}
      >
        <Text style={styles.registerButtonText}>Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Đăng ký học phần</Text>

      {/* Term Selection */}
      <View style={styles.selectionContainer}>
        <Text style={styles.label}>Học kỳ:</Text>
        {terms.length > 0 ? (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedTermId || ''}
              onValueChange={(itemValue) => handleTermChange(Number(itemValue))}
              style={styles.picker}
              enabled={!loading}
            >
              {terms.map((term) => (
                <Picker.Item key={term.id} label={term.name} value={term.id} />
              ))}
            </Picker>
          </View>
        ) : (
          <Text style={styles.noDataText}>Không có học kỳ nào</Text>
        )}
      </View>

      {/* Registration Type */}
      <View style={styles.selectionContainer}>
        <Text style={styles.label}>Loại đăng ký:</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, registrationType === 'NEW' && styles.typeButtonActive]}
            onPress={() => handleRegistrationTypeChange('NEW')}
          >
            <Text style={[styles.typeButtonText, registrationType === 'NEW' && styles.typeButtonTextActive]}>
              Đăng ký mới
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, registrationType === 'RETAKE' && styles.typeButtonActive]}
            onPress={() => handleRegistrationTypeChange('RETAKE')}
          >
            <Text style={[styles.typeButtonText, registrationType === 'RETAKE' && styles.typeButtonTextActive]}>
              Học lại
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, registrationType === 'IMPROVE' && styles.typeButtonActive]}
            onPress={() => handleRegistrationTypeChange('IMPROVE')}
          >
            <Text style={[styles.typeButtonText, registrationType === 'IMPROVE' && styles.typeButtonTextActive]}>
              Cải thiện
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Available Courses */}
      <View style={styles.coursesContainer}>
        <Text style={styles.sectionTitle}>Danh sách học phần có thể đăng ký</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#0066CC" style={styles.loadingIndicator} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error" size={24} color="#d9534f" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : availableCourses.length === 0 ? (
          <Text style={styles.noDataText}>Không tìm thấy học phần nào</Text>
        ) : (
          <FlatList
            data={availableCourses}
            renderItem={renderCourseItem}
            keyExtractor={(item) => item.offering_id.toString()}
            contentContainerStyle={styles.coursesList}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectionContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  typeButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  coursesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fadbd8',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: {
    color: '#d9534f',
    marginLeft: 10,
    flex: 1,
  },
  noDataText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
    fontStyle: 'italic',
  },
  coursesList: {
    paddingBottom: 20,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  courseSeats: {
    fontSize: 14,
    color: '#28a745',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0066CC',
  },
  courseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  courseInfoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  registerButton: {
    backgroundColor: '#28a745',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default DangKyHocPhan;
