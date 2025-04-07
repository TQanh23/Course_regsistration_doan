import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the navigation param list type
type RootStackParamList = {
  TrangChuScreen: undefined;
  DangKyHocPhan: undefined;
  ThongBao: undefined;
  // Add other screens as needed
};

// Define the navigation prop type for this screen
type DangKyHocPhanNavigationProp = StackNavigationProp<RootStackParamList, 'DangKyHocPhan'>;

const App = () => {
  // Use typed navigation
  const navigation = useNavigation<DangKyHocPhanNavigationProp>();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [registrationType, setRegistrationType] = useState<'NEW' | 'RETAKE' | 'IMPROVE'>('NEW');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('HK2 2024 - 2025');

  // Hàm để quay lại màn hình chính
  const goBack = () => {
    navigation.goBack();
  };

  // Add function to navigate to ThongBao screen
  const navigateToThongBao = () => {
    navigation.navigate('ThongBao');
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourse(currentSelected => 
      currentSelected === courseId ? null : courseId
    );
    // Reset lựa chọn lớp học khi thay đổi môn học
    setSelectedClass(null);
  };

  const toggleClassSelection = (classId: string) => {
    setSelectedClass(currentSelected => 
      currentSelected === classId ? null : classId
    );
  };

  // Kiểm tra xem có môn học nào được chọn không
  const isAnyCourseSelected = selectedCourse !== null;

  const classDetails = {
    '46880403': [
      {
        schedule: 'LT - Thứ 4 (T4 → T6)',
        location: 'Cơ sở chính',
        building: 'T2-H1',
        room: '212.H1',
        teacher: 'Trần Văn Thọ',
        time: '19/03/2025 - 16/04/2025',
      },
      {
        schedule: 'LT - Thứ 4 (T4 → T6)',
        location: 'Cơ sở chính',
        building: 'T5-H1',
        room: '506.H1',
        teacher: 'Trần Văn Thọ',
        time: '23/04/2025 - 07/05/2025',
      },
      {
        schedule: 'LT - Thứ 6 (T1 → T3)',
        location: 'Cơ sở chính',
        building: 'T2-H1',
        room: '212.H1',
        teacher: 'Trần Văn Thọ',
        time: '21/03/2025 - 21/03/2025',
      },
    ],
  };

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
            onPress={navigateToThongBao} // Add the navigation handler here
          >
            <Icon name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.whiteSpace} />

      </View>

      {/* Semester Selector */}
      <View style={styles.semesterSelector}>
        <TouchableOpacity
          onPress={() => setDropdownVisible(!isDropdownVisible)} // Toggle dropdown
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}
        >
          <Text style={styles.semesterText}>{selectedSemester}</Text>
          <Icon name={isDropdownVisible ? 'chevron-up' : 'chevron-down'} size={24} color="#000" />
        </TouchableOpacity>

        {isDropdownVisible && (
          <View style={styles.dropdown}>
            <TouchableOpacity
              onPress={() => {
                Alert.alert("Thông báo", "Đợt này sinh viên không được đăng ký!");
                setDropdownVisible(false); // Đóng dropdown
              }}
              style={styles.dropdownItem}
            >
              <Text style={styles.dropdownText}>HK1 2024 - 2025</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSelectedSemester('HK2 2024 - 2025');
                setDropdownVisible(false); // Đóng dropdown
              }}
              style={styles.dropdownItem}
            >
              <Text style={styles.dropdownText}>HK2 2024 - 2025</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Registration Types */}
<<<<<<< HEAD
      {selectedSemester === 'HK2 2024 - 2025' ? (
        <>
          <View style={styles.registrationTypes}>
=======
      <View style={styles.registrationTypes}>
        <TouchableOpacity 
          style={styles.typeButton}
          onPress={() => setRegistrationType('NEW')}
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
          onPress={() => setRegistrationType('RETAKE')}
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
          onPress={() => setRegistrationType('IMPROVE')}
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

      {/* Chuyển ScrollView lên trên phần tiêu đề để bao gồm cả tiêu đề */}
      <ScrollView style={styles.courseList}>
        {/* Đưa tiêu đề vào trong ScrollView */}
        <Text style={styles.listTitle}>Môn học phần đang chờ đăng ký</Text>
        

        {/* Course List Section */}
        <View>
          <View style={styles.tableHeader}>
            <View style={styles.radioCell} />
            <Text style={styles.headerCell}>STT</Text>
            <Text style={styles.headerCell}>Mã HP</Text>
            <Text style={[styles.headerCell, styles.nameCell]}>Tên môn học</Text>
            <Text style={styles.headerCell}>TC</Text>
            <Text style={styles.headerCell}>Bắt buộc</Text>
            <Text style={[styles.headerCell, styles.prerequisiteCell]}>Điều kiện tiên quyết</Text>
          </View>

          {/* Course Items */}
          {[
            { id: '430101', name: 'Giáo dục thể chất 1', credits: 1, required: false, prerequisite: '' },
            { id: '430102', name: 'Giáo dục thể chất 2', credits: 1, required: false, prerequisite: '' },
            { id: '430103', name: 'Giáo dục thể chất 3', credits: 1, required: false, prerequisite: '' },
            { id: '608821', name: 'Thực tập tốt nghiệp', credits: 3, required: true, prerequisite: '' },
            { id: '608822', name: 'Đồ án tốt nghiệp', credits: 7, required: true, prerequisite: '' },
          ].map((course, index) => (
            <View key={course.id} style={styles.courseRow}>
              <TouchableOpacity 
                style={styles.radioCell}
                onPress={() => toggleCourseSelection(course.id)}
              >
                <View style={[
                  styles.courseRadio,
                  selectedCourse === course.id && styles.courseRadioSelected
                ]} />
              </TouchableOpacity>
              <Text style={styles.cell}>{index + 1}</Text>
              <Text style={styles.cell}>{course.id}</Text>
              <Text style={[styles.cell, styles.nameCell]}>{course.name}</Text>
              <Text style={styles.cell}>{course.credits}</Text>
              <View style={styles.cell}>
                <Icon 
                  name={course.required ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={course.required ? "#4CAF50" : "#F44336"} 
                />
              </View>
              <Text style={[styles.cell, styles.prerequisiteCell]}>{course.prerequisite}</Text>
            </View>
          ))}
        </View>

        {/* Class Registration Section */}
        <View style={styles.classSection}>
          <Text style={styles.sectionTitle}>Lớp học phần chờ đăng ký</Text>
          
          {/* No Conflict Message */}
          <View style={styles.noConflictContainer}>
            <TouchableOpacity style={styles.checkboxContainer}>
              <View style={styles.checkbox} />
            </TouchableOpacity>
            <Text style={styles.noConflictText}>Hiển thị lớp học phần không trùng lịch</Text>
          </View>

          {/* Class List Header */}
          <View style={styles.classListHeader}>
            <Text style={styles.classHeaderCell}>STT</Text>
            <Text style={[styles.classHeaderCell, styles.classInfoCell]}>Thông tin lớp học phần</Text>
            <Text style={styles.classHeaderCell}>Đã đăng ký</Text>
          </View>

          {/* Class Details Section */}
          <View style={styles.classDetailsSection}>
            <Text style={styles.detailsSectionTitle}>Chi tiết lớp học phần</Text>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailsColumn}>
                <Text style={styles.detailsHeader}>Thông tin lớp học</Text>
              </View>
              <View style={styles.detailsColumn}>
                <Text style={styles.detailsHeader}>Thông tin giảng viên, thời gian</Text>
              </View>
            </View>

            {/* Register Button */}
>>>>>>> a167de500bf61c9ceec4c662f3fa79d4ac5c5653
            <TouchableOpacity 
              style={styles.typeButton}
              onPress={() => {
                setRegistrationType('NEW');
                setSelectedCourse(null); // Reset lựa chọn môn học
                setSelectedClass(null);  // Reset lựa chọn lớp học
              }}
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
              onPress={() => {
                setRegistrationType('RETAKE');
                setSelectedCourse(null); // Reset lựa chọn môn học
                setSelectedClass(null);  // Reset lựa chọn lớp học
              }}
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
              onPress={() => {
                setRegistrationType('IMPROVE');
                setSelectedCourse(null); // Reset lựa chọn môn học
                setSelectedClass(null);  // Reset lựa chọn lớp học
              }}
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

<<<<<<< HEAD
          {/* Chuyển ScrollView lên trên phần tiêu đề để bao gồm cả tiêu đề */}
          <ScrollView style={styles.courseList}>
            {/* Đưa tiêu đề vào trong ScrollView */}
            {registrationType === 'NEW' && (
              <>
                <Text style={styles.listTitle}>Môn học phần đang chờ đăng ký</Text>
                
                {/* Course List Section */}
                <View>
                  <View style={styles.tableHeader}>
                    <View style={styles.radioColumnCell} />
                    <Text style={[styles.headerCell, styles.indexColumnCell]}>STT</Text>
                    <Text style={[styles.headerCell, styles.codeColumnCell]}>Mã HP</Text>
                    <Text style={[styles.headerCell, styles.nameColumnCell]}>Tên môn học</Text>
                    <Text style={[styles.headerCell, styles.creditColumnCell]}>TC</Text>
                    <Text style={[styles.headerCell, styles.requiredColumnCell]}>Bắt buộc</Text>
                    <Text style={[styles.headerCell, styles.prerequisiteColumnCell]}>Điều kiện tiên quyết</Text>
                  </View>
=======
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
    marginBottom: 24,
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
  },
  typeTextSelected: {
    color: '#0052CC',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8, // Thêm marginTop để có khoảng cách với phần trên
  },
  courseList: {
    flex: 1,
    // Không cần paddingTop nếu đã có marginTop trong listTitle

  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
  },
  courseRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    fontSize: 14,
  },
  nameCell: {
    flex: 2,
  },
  prerequisiteCell: {
    flex: 1.5,
  },
  radioCell: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  classSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noConflictContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxContainer: {
    marginRight: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#0052CC',
    borderRadius: 4,
  },
  noConflictText: {
    color: '#F44336',
    fontSize: 14,
  },
  classListHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  classHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
  },
  classInfoCell: {
    flex: 3,
  },
  classDetailsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
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
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  registerButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
    width: '100%',
  },
  registerButtonActive: {
    backgroundColor: '#0052CC',  // Màu xanh biển khi có môn học được chọn
  },
  registerButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  registerButtonTextActive: {
    color: '#FFFFFF',  // Màu chữ trắng khi nút active
  },
});
>>>>>>> a167de500bf61c9ceec4c662f3fa79d4ac5c5653

                  {/* Course Items */}
                  {[
                    { id: '430101', name: 'Giáo dục thể chất 1', credits: 1, required: false, prerequisite: '' },
                    { id: '430102', name: 'Giáo dục thể chất 2', credits: 1, required: false, prerequisite: '' },
                    { id: '430103', name: 'Giáo dục thể chất 3', credits: 1, required: false, prerequisite: '' },
                    { id: '608821', name: 'Thực tập tốt nghiệp', credits: 3, required: true, prerequisite: '' },
                    { id: '608822', name: 'Đồ án tốt nghiệp', credits: 7, required: true, prerequisite: '' },
                  ].map((course, index) => (
                    <View key={course.id} style={[
                      styles.courseRow,
                      selectedCourse === course.id && styles.selectedRow
                    ]}>
                      <TouchableOpacity 
                        style={styles.radioColumnCell}
                        onPress={() => toggleCourseSelection(course.id)}
                      >
                        <View style={[
                          styles.courseRadio,
                          selectedCourse === course.id && styles.courseRadioSelected
                        ]} />
                      </TouchableOpacity>
                      <Text style={[styles.cell, styles.indexColumnCell]}>{index + 1}</Text>
                      <Text style={[styles.cell, styles.codeColumnCell]}>{course.id}</Text>
                      <Text style={[styles.cell, styles.nameColumnCell]}>{course.name}</Text>
                      <Text style={[styles.cell, styles.creditColumnCell]}>{course.credits}</Text>
                      <View style={styles.requiredColumnCell}>
                        <Icon 
                          name={course.required ? "checkmark-circle" : "close-circle"} 
                          size={20} 
                          color={course.required ? "#4CAF50" : "#F44336"} 
                        />
                      </View>
                      <Text style={[styles.cell, styles.prerequisiteColumnCell]}>{course.prerequisite}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {registrationType === 'RETAKE' && (
              <>
                <Text style={styles.listTitle}>Môn học phần đang chờ đăng ký</Text>
                
                {/* No Data Message */}
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>Không tìm thấy môn học</Text>
                </View>
              </>
            )}

            {registrationType === 'IMPROVE' && (
              <>
                <Text style={styles.listTitle}>Môn học phần đang chờ đăng ký</Text>
                
                {/* Course List Section */}
                <View>
                  <View style={styles.tableHeader}>
                    <View style={styles.radioColumnCell} />
                    <Text style={[styles.headerCell, styles.indexColumnCell]}>STT</Text>
                    <Text style={[styles.headerCell, styles.codeColumnCell]}>Mã HP</Text>
                    <Text style={[styles.headerCell, styles.nameColumnCell]}>Tên môn học</Text>
                    <Text style={[styles.headerCell, styles.creditColumnCell]}>TC</Text>
                    <Text style={[styles.headerCell, styles.requiredColumnCell]}>Bắt buộc</Text>
                    <Text style={[styles.headerCell, styles.prerequisiteColumnCell]}>Điều kiện tiên quyết</Text>
                  </View>

                  {/* Course Items */}
                  {[
                    { id: '398803', name: 'Giải tích ứng dụng kỹ thuật', credits: 3, required: true, prerequisite: '' },
                    { id: '480114', name: 'Giáo dục Quốc phòng 4', credits: 2, required: true, prerequisite: '' },
                    { id: '538803', name: 'Kiến trúc máy tính', credits: 3, required: true, prerequisite: '' },
                    { id: '468804', name: 'Mạng máy tính', credits: 3, required: true, prerequisite: '' },
                  ].map((course, index) => (
                    <View key={course.id} style={[
                      styles.courseRow,
                      selectedCourse === course.id && styles.selectedRow
                    ]}>
                      <TouchableOpacity 
                        style={styles.radioColumnCell}
                        onPress={() => toggleCourseSelection(course.id)}
                      >
                        <View style={[
                          styles.courseRadio,
                          selectedCourse === course.id && styles.courseRadioSelected
                        ]} />
                      </TouchableOpacity>
                      <Text style={[styles.cell, styles.indexColumnCell]}>{index + 1}</Text>
                      <Text style={[styles.cell, styles.codeColumnCell]}>{course.id}</Text>
                      <Text style={[styles.cell, styles.nameColumnCell]}>{course.name}</Text>
                      <Text style={[styles.cell, styles.creditColumnCell]}>{course.credits}</Text>
                      <View style={styles.requiredColumnCell}>
                        <Icon 
                          name={course.required ? "checkmark-circle" : "close-circle"} 
                          size={20} 
                          color={course.required ? "#4CAF50" : "#F44336"} 
                        />
                      </View>
                      <Text style={[styles.cell, styles.prerequisiteColumnCell]}>{course.prerequisite}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Class Registration Section */}
            <View style={styles.classSection}>
              <Text style={styles.sectionTitle}>Lớp học phần chờ đăng ký</Text>
              
              {/* No Conflict Message */}
              <View style={styles.noConflictContainer}>
                <TouchableOpacity style={styles.checkboxContainer}>
                  <View style={styles.checkbox} />
                </TouchableOpacity>
                <Text style={[styles.noConflictText, { color: 'red', fontWeight: 'bold' }]}>
                  Hiển thị lớp học phần không trùng lịch
                </Text>
              </View>

              {/* Class List Header */}
              <View style={styles.classListHeader}>
                <View style={styles.radioColumnCell} />
                <Text style={[styles.classHeaderCell, styles.indexColumnCell]}>STT</Text>
                <Text style={[styles.classHeaderCell, styles.classInfoColumnCell]}>Thông tin lớp học phần</Text>
                <Text style={[styles.classHeaderCell, styles.requiredColumnCell]}>Đã đăng ký</Text>
              </View>

              {/* Class Details Section */}
              {selectedCourse === '468804' && (
                <View>
                  {[
                    { id: '46880401', name: 'Mạng máy tính', status: 'Đang lên kế hoạch', registered: '49/50', classCode: '68CS1' },
                    { id: '46880402', name: 'Mạng máy tính', status: 'Đang lên kế hoạch', registered: '41/50', classCode: '68CS2' },
                    { id: '46880403', name: 'Mạng máy tính', status: 'Đang lên kế hoạch', registered: '50/60', classCode: '68CS3' },
                  ].map((classItem, index) => (
                    <View key={classItem.id} style={[
                      styles.classRow,
                      selectedClass === classItem.id && styles.selectedRow
                    ]}>
                      <TouchableOpacity 
                        style={styles.radioColumnCell}
                        onPress={() => toggleClassSelection(classItem.id)}
                      >
                        <View style={[
                          styles.courseRadio,
                          selectedClass === classItem.id && styles.courseRadioSelected
                        ]} />
                      </TouchableOpacity>
                      <Text style={[styles.cell, styles.indexColumnCell]}>{index + 1}</Text>
                      <View style={styles.classInfoColumnCell}>
                        <Text style={styles.classTitle}>{classItem.name}</Text>
                        <View style={styles.classStatusRow}>
                          <Text style={styles.classStatusLabel}>Trạng thái: </Text>
                          <Text style={styles.classStatusValue}>{classItem.status}</Text>
                        </View>
                        <Text style={styles.classCode}>Mã lớp: {classItem.id} - {classItem.classCode}</Text>
                      </View>
                      <Text style={[styles.classRegisteredCell]}>{classItem.registered}</Text>
                    </View>
                  ))}
                </View>
              )}

                <View style={styles.classDetailsSection}>
                  <Text style={styles.detailsSectionTitle}>Chi tiết lớp học phần</Text>
                  
                  <View style={styles.detailsRow}>
                    <View style={styles.detailsColumn}>
                      <Text style={styles.detailsHeader}>Thông tin lớp học</Text>
                    </View>
                    <View style={styles.detailsColumn}>
                      <Text style={styles.detailsHeader}>Thông tin giảng viên, thời gian</Text>
                    </View>
                  </View>

                  {/* Render class details dynamically */}
                  {selectedClass && selectedClass in classDetails && classDetails[selectedClass as keyof typeof classDetails].map((detail, index) => (
                    <View key={index} style={styles.detailsRow}>
                      <View style={styles.detailsColumn}>
                        <Text style={{ color: '#0052CC' }}>Lịch học: <Text style={{ fontWeight: 'bold' }}>{detail.schedule}</Text></Text>
                        <Text style={{ color: '#0052CC' }}>Cơ sở: <Text style={{ fontWeight: 'bold' }}>{detail.location}</Text></Text>
                        <Text style={{ color: '#0052CC' }}>Dãy nhà: <Text style={{ fontWeight: 'bold' }}>{detail.building}</Text></Text>
                        <Text style={{ color: '#0052CC' }}>Phòng: <Text style={{ fontWeight: 'bold' }}>{detail.room}</Text></Text>
                      </View>
                      <View style={styles.detailsColumn}>
                        <Text style={{ color: '#0052CC' }}>
                          <Text style={{ fontWeight: 'bold' }}>GV: </Text>
                          <Text style={{ fontWeight: 'bold' }}>{detail.teacher}</Text>
                        </Text>
                        <Text style={{ color: '#0052CC' }}>Thời gian: <Text style={{ fontWeight: 'bold' }}>{detail.time}</Text></Text>
                      </View>
                    </View>
                  ))}

                  {/* Register Button */}
                  <TouchableOpacity 
                    style={[
                      styles.registerButton,
                      selectedClass && styles.registerButtonActive // Chỉ kích hoạt khi selectedClass không null
                    ]}
                    disabled={!selectedClass} // Vô hiệu hóa nút nếu chưa chọn lớp
                  >
                    <Text style={[
                      styles.registerButtonText,
                      selectedClass && styles.registerButtonTextActive // Đổi màu chữ khi nút hoạt động
                    ]}>ĐĂNG KÝ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={[styles.noDataText, {fontSize: 18, marginTop: 30, textAlign: 'center'}]}>
              Đợt này sinh viên không được đăng ký!
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  };

  const styles = StyleSheet.create({
    cellContainer: {
      // View-specific styles only
    },
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    iconCell: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 60,
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
      marginBottom: 24,
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
    },
    typeTextSelected: {
      color: '#0052CC',
    },
    listTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginHorizontal: 16,
      marginBottom: 16,
      marginTop: 8, // Thêm marginTop để có khoảng cách với phần trên
    },
    courseList: {
      flex: 1,
      // Không cần paddingTop nếu đã có marginTop trong listTitle
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#F0F5FF',
      paddingVertical: 12,
      paddingHorizontal: 8,
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
    nameCell: {
      flex: 3,
    },
    prerequisiteCell: {
      flex: 1.5,
    },
    radioCell: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
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
    classSection: {
      marginTop: 24,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    noConflictContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    checkboxContainer: {
      marginRight: 8,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: '#0052CC',
      borderRadius: 4,
    },
    noConflictText: {
      color: '#F44336',
      fontSize: 14,
    },
    classListHeader: {
      flexDirection: 'row',
      backgroundColor: '#F0F5FF',
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#CCDDFF',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      alignItems: 'center',
    },
    classHeaderCell: {
      fontWeight: 'bold',
      fontSize: 14,
      color: '#0052CC',
    },
    classRow: {
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
      alignItems: 'center',
    },
    classInfoColumnCell: {
      flex: 3,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    classRegisteredCell: {
      width: 70,
      textAlign: 'center',
      color: '#0052CC',
      fontWeight: 'bold',
      fontSize: 14,
    },
    classTitle: {
      fontWeight: 'bold',
      fontSize: 16,
      color: '#0052CC',
      marginBottom: 4,
    },
    classStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    classStatusLabel: {
      color: '#0052CC',
      fontSize: 14,
    },
    classStatusValue: {
      color: 'red',
      fontWeight: 'bold',
      fontSize: 14,
    },
    classCode: {
      color: '#0052CC',
      fontSize: 14,
    },
    classDetailsSection: {
      marginTop: 24,
      paddingHorizontal: 16,
    },
    detailsSectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 16,
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
      fontWeight: '500',
      color: '#000',
      marginBottom: 8,
    },
    registerButton: {
      backgroundColor: '#F0F0F0',
      paddingVertical: 12,
      borderRadius: 4,
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 32,
      width: '100%',
    },
    registerButtonActive: {
      backgroundColor: '#0052CC',  // Màu xanh biển khi có môn học được chọn
    },
    registerButtonText: {
      color: '#666666',
      fontSize: 16,
      fontWeight: '500',
    },
    registerButtonTextActive: {
      color: '#FFFFFF',  // Màu chữ trắng khi nút active
    },
    noDataContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
    },
    noDataText: {
      fontSize: 16,
      color: '#666',
      fontStyle: 'italic',
    },
    dropdown: {
      position: 'absolute',
      top: 50, // Điều chỉnh vị trí dropdown
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      zIndex: 1000,
      elevation: 5, // Đổ bóng trên Android
    },
    dropdownItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    dropdownText: {
      fontSize: 16,
      color: '#000',
    },
    radioColumnCell: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    indexColumnCell: {
      width: 40,
      textAlign: 'center',
      justifyContent: 'center',
    },
    codeColumnCell: {
      width: 80,
    },
    nameColumnCell: {
      flex: 3,
    },
    creditColumnCell: {
      width: 40,
      textAlign: 'center',
    },
    requiredColumnCell: {
      width: 60,
      alignItems: 'center',
    },
    prerequisiteColumnCell: {
      flex: 1.5,
    },
  });

  export default App;
