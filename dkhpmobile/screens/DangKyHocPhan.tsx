import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Picker } from '@react-native-picker/picker';
import courseService, { 
  CourseOfferingModel, 
  TermInfoModel, 
  CoursesResponseModel,
  AcademicTermModel
} from '../src/api/services/courseService';
import { registrationService } from '../src/api/services/registrationService';

// Define the navigation param list types
type RegistrationStackParamList = {
  DangKyHocPhanMain: undefined;
  ChuongTrinhKhung: undefined;
  ThongTinLop: undefined;
  ThongTinGiangVien: undefined;
  ThongBao: undefined;
};

type MainTabParamList = {
  'Trang Chủ': undefined;
  'Đăng Ký': undefined;
  'Lịch Học': undefined;
  'Đăng Ký Môn': undefined;
  'Cá Nhân': undefined;
};

// Composite navigation prop that can handle both stack and tab navigation
type DangKyHocPhanNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RegistrationStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

const DangKyHocPhan = () => {
  // Navigation
  const navigation = useNavigation<DangKyHocPhanNavigationProp>();
  
  // State variables
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [terms, setTerms] = useState<AcademicTermModel[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [coursesResponse, setCoursesResponse] = useState<CoursesResponseModel | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseOfferingModel | null>(null);
  const [registrationType, setRegistrationType] = useState<'NEW' | 'RETAKE' | 'IMPROVE'>('NEW');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  
  // Derived states
  const termInfo = coursesResponse?.term || null;
  const availableCourses = coursesResponse?.courses || [];
  const registrationActive = termInfo?.is_registration_active || false;

  // Load academic terms when component mounts
  useEffect(() => {
    loadTerms();
  }, []);

  // Load available courses when term selection changes
  useEffect(() => {
    if (selectedTermId) {
      loadAvailableCourses();
    }
  }, [selectedTermId, registrationType]);

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

  const loadAvailableCourses = async () => {
    if (!selectedTermId) return;

    try {
      setLoading(true);
      const response = await courseService.getAvailableCoursesBySemester(selectedTermId);
      setCoursesResponse(response);
      setSelectedCourse(null); // Reset selection when courses change
      setError(null);
    } catch (err) {
      console.error('Error loading available courses:', err);
      setError('Không thể tải dữ liệu học phần. Vui lòng thử lại sau.');
      setCoursesResponse(null);
    } finally {
      setLoading(false);
    }
  };

  // Hàm để quay lại màn hình chính
  const goBack = () => {
    navigation.goBack();
  };

  // Add function to navigate to ThongBao screen
  const navigateToThongBao = () => {
    navigation.navigate('ThongBao');
  };

  // Handle term selection change
  const handleTermChange = (termId: number) => {
    setSelectedTermId(termId);
    setDropdownVisible(false);
  };

  // Toggle course selection
  const toggleCourseSelection = (course: CourseOfferingModel) => {
    setSelectedCourse(prevSelected => 
      prevSelected && prevSelected.offering_id === course.offering_id ? null : course
    );
  };

  // Handle registration type change
  const handleRegistrationTypeChange = (type: 'NEW' | 'RETAKE' | 'IMPROVE') => {
    setRegistrationType(type);
    setSelectedCourse(null); // Reset selection when changing registration type
  };

  // Handle course registration
  const handleRegisterCourse = async () => {
    if (!selectedCourse || !selectedTermId) {
      Alert.alert('Thông báo', 'Vui lòng chọn một lớp học phần để đăng ký');
      return;
    }

    if (!registrationActive) {
      Alert.alert(
        'Thông báo',
        'Đăng ký học phần hiện đang đóng cho học kỳ này.',
        [{ text: 'Đồng ý' }]
      );
      return;
    }

    Alert.alert(
      'Xác nhận đăng ký',
      `Bạn có chắc chắn muốn đăng ký học phần "${selectedCourse.title}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng ký', 
          onPress: async () => {
            try {
              setLoading(true);
              const response = await registrationService.registerCourse(
                selectedCourse.course_id, 
                selectedCourse.term_id
              );
              Alert.alert('Thành công', `Đã đăng ký học phần "${selectedCourse.title}" thành công.`);
              
              // Refresh the course list after successful registration
              if (selectedTermId) {
                const updatedCourses = await courseService.getAvailableCoursesBySemester(selectedTermId);
                setCoursesResponse(updatedCourses);
              }
            } catch (err: any) {
              console.error('Error registering course:', err);
              
              let errorMsg = 'Đăng ký học phần thất bại. Vui lòng thử lại sau.';
              if (err?.response?.data?.message) {
                errorMsg = err.response.data.message;
                if (errorMsg.toLowerCase().includes('schedule conflict')) {
                  Alert.alert('Trùng lịch học', errorMsg);
                  return;
                }
                // Show specific alert if course is full
                if (errorMsg.toLowerCase().includes('course is full')) {
                  Alert.alert('Lớp đã đầy', 'Lớp học phần này đã đủ số lượng sinh viên. Vui lòng chọn lớp khác.');
                  return;
                }
              }
              Alert.alert('Lỗi', errorMsg);
            } finally {
              setLoading(false);
            }
          } 
        }
      ]
    );
  };

  // Pull-to-refresh functionality
  const onRefresh = async () => {
    if (!selectedTermId) return;
    
    try {
      setRefreshing(true);
      const updatedCourses = await courseService.getAvailableCoursesBySemester(selectedTermId);
      setCoursesResponse(updatedCourses);
      setError(null);
    } catch (err) {
      console.error('Error refreshing courses:', err);
      setError('Không thể tải dữ liệu học phần. Vui lòng thử lại sau.');
    } finally {
      setRefreshing(false);
    }
  };

  // Render schedule details for selected course
  const renderScheduleDetails = () => {
    if (!selectedCourse || !selectedCourse.schedule_details) return null;

    return (
      <View style={styles.classDetailsSection}>
        <Text style={styles.detailsSectionTitle}>Chi tiết lớp học phần</Text>
        
        <View style={styles.detailsRow}>
          <View style={styles.detailsColumn}>
            <Text style={styles.detailsHeader}>Thông tin lớp học</Text>
            <Text style={styles.detailText}>
              <Text style={{fontWeight: 'bold'}}>Mã lớp: </Text>
              {selectedCourse.course_code} - {selectedCourse.section_number}
            </Text>
            {selectedCourse.building && (
              <Text style={styles.detailText}>
                <Text style={{fontWeight: 'bold'}}>Dãy nhà: </Text>
                {selectedCourse.building}
              </Text>
            )}
            {selectedCourse.room_number && (
              <Text style={styles.detailText}>
                <Text style={{fontWeight: 'bold'}}>Phòng: </Text>
                {selectedCourse.room_number}
              </Text>
            )}
          </View>
          <View style={styles.detailsColumn}>
            <Text style={styles.detailsHeader}>Thông tin giảng viên, thời gian</Text>
            {selectedCourse.professor_name && (
              <Text style={styles.detailText}>
                <Text style={{fontWeight: 'bold'}}>GV: </Text>
                {selectedCourse.professor_name}
              </Text>
            )}
            <Text style={styles.detailText}>
              <Text style={{fontWeight: 'bold'}}>Lịch học: </Text>
              {selectedCourse.schedule_details}
            </Text>
          </View>
        </View>

        {/* Register Button */}
        <TouchableOpacity 
          style={[
            styles.registerButton,
            selectedCourse && styles.registerButtonActive
          ]}
          onPress={handleRegisterCourse}
          disabled={!selectedCourse || !registrationActive}
        >
          <Text style={[
            styles.registerButtonText,
            selectedCourse && styles.registerButtonTextActive
          ]}>ĐĂNG KÝ</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Filter courses based on registration type
  const filteredCourses = availableCourses.filter(course => {
    if (registrationType === 'NEW') {
      // Logic for courses available for new registration
      return !course.registration_status;
    } else if (registrationType === 'RETAKE') {
      // Logic for courses available for retake
      // This would typically need a failing grade indicator from the backend
      return false; // Placeholder - no retake courses in this example
    } else if (registrationType === 'IMPROVE') {
      // Logic for courses available for improvement
      // This would typically need a grade indicator from the backend
      return course.registration_status === 'completed';
    }
    return false;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0052CC" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={goBack}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đăng ký học phần</Text>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={navigateToThongBao}
          >
            <Icon name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.whiteSpace} />
      </View>

      {/* Semester Selector */}
      <View style={styles.semesterSelector}>
        <TouchableOpacity
          onPress={() => setDropdownVisible(!isDropdownVisible)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}
          disabled={loading}
        >
          <Text style={styles.semesterText}>
            {termInfo ? termInfo.term_name : 'Chọn học kỳ'}
          </Text>
          <Icon name={isDropdownVisible ? 'chevron-up' : 'chevron-down'} size={24} color="#000" />
        </TouchableOpacity>

        {isDropdownVisible && (
          <View style={styles.dropdown}>
            {terms.map((term) => (
              <TouchableOpacity
                key={term.id}
                onPress={() => handleTermChange(term.id)}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownText}>{term.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Registration Types */}
      <View style={styles.registrationTypes}>
        <TouchableOpacity 
          style={styles.typeButton}
          onPress={() => handleRegistrationTypeChange('NEW')}
        >
          <View style={[
            styles.radioButton,
            registrationType === 'NEW' && styles.radioSelected
          ]} />
          <Text style={[
            styles.typeText,
            registrationType === 'NEW' && styles.typeTextSelected
          ]}>HỌC MỚI</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.typeButton}
          onPress={() => handleRegistrationTypeChange('RETAKE')}
        >
          <View style={[
            styles.radioButton,
            registrationType === 'RETAKE' && styles.radioSelected
          ]} />
          <Text style={[
            styles.typeText,
            registrationType === 'RETAKE' && styles.typeTextSelected
          ]}>HỌC LẠI</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.typeButton}
          onPress={() => handleRegistrationTypeChange('IMPROVE')}
        >
          <View style={[
            styles.radioButton,
            registrationType === 'IMPROVE' && styles.radioSelected
          ]} />
          <Text style={[
            styles.typeText,
            registrationType === 'IMPROVE' && styles.typeTextSelected
          ]}>HỌC CẢI {'\n'} THIỆN</Text>
        </TouchableOpacity>
      </View>

      {/* Term Status Card */}
      {termInfo && (
        <View style={styles.termInfoContainer}>
          <View style={[styles.registrationStatus, 
            {backgroundColor: registrationActive ? '#e6f7e6' : '#ffeaea'}]}>
            <Icon 
              name={registrationActive ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={registrationActive ? "#4CAF50" : "#F44336"} 
            />
            <Text style={[styles.registrationStatusText, 
              {color: registrationActive ? "#4CAF50" : "#F44336"}]}>
              {registrationActive ? "Đăng ký đang mở" : "Đăng ký đã đóng"}
            </Text>
          </View>

          <View style={styles.termDetailRow}>
            <Text style={styles.termDetailLabel}>Thời gian học:</Text>
            <Text style={styles.termDetailValue}>{termInfo.period}</Text>
          </View>
          
          <View style={styles.termDetailRow}>
            <Text style={styles.termDetailLabel}>Đăng ký:</Text>
            <Text style={styles.termDetailValue}>{termInfo.registration_period}</Text>
          </View>
          
          <View style={styles.termDetailRow}>
            <Text style={styles.termDetailLabel}>Số lượng môn:</Text>
            <Text style={styles.termDetailValue}>{coursesResponse?.total_courses || 0}</Text>
          </View>        </View>
      )}      {/* Button to View Registered Courses */}
      <TouchableOpacity 
        style={styles.viewRegisteredCoursesButton}
        onPress={() => navigation.navigate('Đăng Ký Môn')}
      >
        <Icon name="list" size={18} color="#0052CC" style={styles.viewRegisteredCoursesIcon} />
        <Text style={styles.viewRegisteredCoursesText}>Xem các môn đã đăng ký</Text>
      </TouchableOpacity>

      {/* Loading Indicator */}
      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Course List */}
      <ScrollView 
        style={styles.courseList}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#1E88E5']} 
          />
        }
      >
        {/* Course Section Title */}
        <Text style={styles.listTitle}>Môn học phần đang chờ đăng ký</Text>
        
        {/* Course Table Header */}
        <View style={styles.tableHeader}>
          <View style={styles.radioColumnCell} />
          <Text style={[styles.headerCell, styles.indexColumnCell]}>STT</Text>
          <Text style={[styles.headerCell, styles.codeColumnCell]}>Mã HP</Text>
          <Text style={[styles.headerCell, styles.nameColumnCell]}>Tên môn học</Text>
          <Text style={[styles.headerCell, styles.creditColumnCell]}>TC</Text>
          <Text style={[styles.headerCell, styles.requiredColumnCell]}>Chỗ trống</Text>
          <Text style={[styles.headerCell, styles.prerequisiteColumnCell]}>Phòng học</Text>
        </View>

        {/* No Courses Message */}
        {!loading && filteredCourses.length === 0 && (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              {registrationType === 'RETAKE' 
                ? 'Không tìm thấy môn học để học lại' 
                : registrationType === 'IMPROVE'
                  ? 'Không tìm thấy môn học để cải thiện'
                  : 'Không tìm thấy môn học'}
            </Text>
          </View>
        )}

        {/* Course Items */}
        {filteredCourses.map((course, index) => (
          <TouchableOpacity 
            key={course.offering_id.toString()} 
            style={[
              styles.courseRow,
              selectedCourse?.offering_id === course.offering_id && styles.selectedRow
            ]}
            onPress={() => toggleCourseSelection(course)}
          >
            <View style={styles.radioColumnCell}>
              <View style={[
                styles.courseRadio,
                selectedCourse?.offering_id === course.offering_id && styles.courseRadioSelected
              ]} />
            </View>
            <Text style={[styles.cell, styles.indexColumnCell]}>{index + 1}</Text>
            <Text style={[styles.cell, styles.codeColumnCell]}>{course.course_code}</Text>
            <Text style={[styles.cell, styles.nameColumnCell]}>{course.title}</Text>
            <Text style={[styles.cell, styles.creditColumnCell]}>{course.credits}</Text>
            <Text style={[styles.cell, styles.requiredColumnCell]}>
              {course.available_seats}/{course.max_enrollment}
            </Text>
            <Text style={[styles.cell, styles.prerequisiteColumnCell]}>
              {course.room_number || ''}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Course Details Section */}
        {selectedCourse && renderScheduleDetails()}

        {/* Prerequisites Section - if the selected course has any */}
        {selectedCourse && selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0 && (
          <View style={styles.prerequisitesContainer}>
            <Text style={styles.detailsSectionTitle}>Học phần tiên quyết</Text>
            <View style={styles.prerequisitesList}>
              {selectedCourse.prerequisites.map((prereq, index) => (
                <View key={prereq.prerequisite_id} style={styles.prerequisiteItem}>
                  <Text style={styles.prerequisiteText}>
                    {index + 1}. {prereq.course_code} - {prereq.title} ({prereq.credits} tín chỉ)
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Extra space at bottom for better scrolling experience */}
        <View style={{height: 60}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#0066CC',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  notificationButton: {
    padding: 4,
    width: 40,
    alignItems: 'flex-end',
  },
  whiteSpace: {
    height: 20,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  semesterSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    margin: 16,
    borderRadius: 8,
  },
  semesterText: {
    fontSize: 16,
    fontWeight: '500',
  },
  registrationTypes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  typeButton: {
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    marginBottom: 8,
  },
  radioSelected: {
    borderColor: '#0052CC',
    backgroundColor: '#0052CC',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  typeTextSelected: {
    color: '#0052CC',
  },
  termInfoContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  termDetailRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  termDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 120,
  },
  termDetailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  registrationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  registrationStatusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  courseList: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F0F5FF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CCDDFF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#0052CC',
  },
  courseRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  selectedRow: {
    backgroundColor: '#F0F7FF',
  },
  cell: {
    fontSize: 14,
    color: '#333',
  },
  radioColumnCell: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexColumnCell: {
    width: 40,
    textAlign: 'center',
  },
  codeColumnCell: {
    width: 80,
  },
  nameColumnCell: {
    flex: 3,
  },
  creditColumnCell: {
    width: 30,
    textAlign: 'center',
  },
  requiredColumnCell: {
    width: 70,
    textAlign: 'center',
  },
  prerequisiteColumnCell: {
    flex: 1,
  },
  courseRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#0052CC',
  },
  courseRadioSelected: {
    backgroundColor: '#0052CC',
  },
  classDetailsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0052CC',
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailsColumn: {
    flex: 1,
    paddingHorizontal: 8,
  },
  detailsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#0052CC',
    marginBottom: 4,
  },
  registerButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  registerButtonActive: {
    backgroundColor: '#0052CC',
  },
  registerButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  registerButtonTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 4,
  },
  errorText: {
    color: '#d32f2f',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  noDataText: {
    color: '#666',
    fontStyle: 'italic',
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownText: {
    fontSize: 16,
  },
  prerequisitesContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  prerequisitesList: {
    marginTop: 8,
  },
  prerequisiteItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  prerequisiteText: {
    color: '#0052CC',
  },
  viewRegisteredCoursesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1F5FE',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B3E5FC',
  },
  viewRegisteredCoursesIcon: {
    marginRight: 8,
  },
  viewRegisteredCoursesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0052CC',
  },
});

export default DangKyHocPhan;
