import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; // Thêm import này

const App = () => {
  const navigation = useNavigation(); // Thêm đoạn này để lấy navigation object
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [registrationType, setRegistrationType] = useState<'NEW' | 'RETAKE' | 'IMPROVE'>('RETAKE');

  // Hàm để quay lại màn hình chính
  const goBack = () => {
    navigation.goBack();
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourse(currentSelected => 
      currentSelected === courseId ? null : courseId
    );
  };

  // Kiểm tra xem có môn học nào được chọn không
  const isAnyCourseSelected = selectedCourse !== null;

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
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.whiteSpace} />

      </View>

      {/* Semester Selector */}
      <View style={styles.semesterSelector}>
        <Text style={styles.semesterText}>HK2 2024 - 2025</Text>
        <Icon name="chevron-down" size={24} color="#000" />
      </View>

      {/* Registration Types */}
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
            <TouchableOpacity 
              style={[
                styles.registerButton,
                isAnyCourseSelected && styles.registerButtonActive
              ]}
            >
              <Text style={[
                styles.registerButtonText,
                isAnyCourseSelected && styles.registerButtonTextActive
              ]}>ĐĂNG KÝ</Text>
            </TouchableOpacity>
          </View>
        </View>
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

export default App;
