import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import courseService, { CurriculumFrameworkModel, SemesterModel, MajorModel } from '../src/api/services/courseService';

// Define your stack parameter list
type RootStackParamList = {
  TrangChuScreen: undefined;
  ChuongTrinhKhung: undefined;
  ThongBao: undefined;
  // Other screens...
};

// Create a typed navigation prop
type ChuongTrinhKhungNavigationProp = StackNavigationProp<RootStackParamList, 'ChuongTrinhKhung'>;

const ChuongTrinhKhung = () => {
  // Use typed navigation
  const navigation = useNavigation<ChuongTrinhKhungNavigationProp>();
  const [expandedSemesters, setExpandedSemesters] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [curriculumData, setCurriculumData] = useState<CurriculumFrameworkModel | null>(null);
  const [majors, setMajors] = useState<MajorModel[]>([]);
  const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);

  // Handle back navigation
  const handleBackPress = () => {
    navigation.goBack();
  };

  // Add navigation to ThongBao screen
  const navigateToThongBao = () => {
    navigation.navigate('ThongBao');
  };

  // Load curriculum data and majors when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load list of majors
        const majorsData = await courseService.getMajors();
        setMajors(majorsData);
        
        // If there are majors, select the first one by default
        if (majorsData.length > 0) {
          setSelectedMajorId(majorsData[0].id);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading majors:', err);
        setError('Failed to load majors data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load curriculum when selected major changes
  useEffect(() => {
    const loadCurriculum = async () => {
      if (!selectedMajorId) return;
      
      try {
        setLoading(true);
        const data = await courseService.getCurriculumFramework(selectedMajorId);
        setCurriculumData(data);
        setError(null);
        
        // Open the first semester by default if there are any
        if (data.semesters.length > 0) {
          setExpandedSemesters([0]);
        }
      } catch (err) {
        console.error('Error loading curriculum:', err);
        setError('Failed to load curriculum data. Please try again later.');
        setCurriculumData(null);
      } finally {
        setLoading(false);
      }
    };

    loadCurriculum();
  }, [selectedMajorId]);

  const toggleSemester = (index: number) => {
    setExpandedSemesters((prev) => {
      // Check if semester is already expanded
      if (prev.includes(index)) {
        // If expanded, remove from array (close it)
        return prev.filter((i) => i !== index);
      } else {
        // If not expanded, add to array (open it)
        return [...prev, index];
      }
    });
  };

  // Handle major selection change
  const handleMajorChange = (majorId: number) => {
    setSelectedMajorId(majorId);
    // Reset expanded semesters when changing major
    setExpandedSemesters([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back button */}
        <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.headerTitle}>Chương trình khung</Text>

        {/* Notification button */}
        <TouchableOpacity onPress={navigateToThongBao} style={styles.iconButton}>
          <Icon name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#d9534f" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Main Title */}
          <Text style={styles.subtitle}>Chuyên ngành</Text>
          <Text style={styles.mainTitle}>
            {curriculumData?.major?.name || 'Chương trình đào tạo'}
          </Text>

          {/* Major Selection Dropdown (if there are multiple majors) */}
          {majors.length > 1 && (
            <View style={styles.majorSelection}>
              <Text style={styles.majorLabel}>Chọn ngành:</Text>
              <View style={styles.majorDropdown}>
                {majors.map((major) => (
                  <TouchableOpacity
                    key={major.id}
                    style={[
                      styles.majorItem,
                      selectedMajorId === major.id && styles.selectedMajorItem
                    ]}
                    onPress={() => handleMajorChange(major.id)}
                  >
                    <Text
                      style={[
                        styles.majorText,
                        selectedMajorId === major.id && styles.selectedMajorText
                      ]}
                    >
                      {major.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Detailed Information */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Ngành: </Text>
              {curriculumData?.major?.name || 'Không có thông tin'}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Chương trình: </Text>
              {curriculumData?.program?.name || 'Không có thông tin'}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Tổng số tín chỉ: </Text>
              {curriculumData?.totalCredits || 0}
            </Text>
          </View>

          {/* Semester List */}
          <View style={styles.semesterList}>
            {curriculumData?.semesters?.map((semester, index) => (
              <View key={semester.id}>
                {/* Semester */}
                <TouchableOpacity
                  style={[
                    styles.semesterItem,
                    expandedSemesters.includes(index) && styles.semesterItemExpanded,
                  ]}
                  onPress={() => toggleSemester(index)}
                >
                  <View style={styles.semesterLeft}>
                    <Icon
                      name={expandedSemesters.includes(index) ? 'chevron-up-outline' : 'chevron-down-outline'}
                      size={20}
                      color="#333"
                      style={styles.arrowIcon}
                    />
                    <Text style={styles.semesterText}>{semester.name}</Text>
                  </View>
                  <Text style={styles.semesterCredits}>{semester.credits} tín chỉ</Text>
                </TouchableOpacity>

                {/* Course List */}
                {expandedSemesters.includes(index) && (
                  <View style={styles.subjectList}>
                    {/* Column Headers */}
                    <View style={styles.tableHeader}>
                      <Text style={styles.headerName}>Tên học phần</Text>
                      <Text style={styles.headerCode}>Mã HP</Text>
                      <Text style={styles.headerCredits}>TC</Text>
                      <Text style={styles.headerStatus}>BB</Text>
                    </View>
                    
                    {/* Courses */}
                    {semester.courses?.map((course, subIndex) => (
                      <View key={course.id} style={styles.subjectItem}>
                        <Text style={styles.subjectName}>{course.title}</Text>
                        <Text style={styles.subjectCode}>{course.code}</Text>
                        <Text style={styles.subjectCredits}>{course.credits}</Text>
                        <View style={styles.subjectStatus}>
                          <Icon
                            name={course.is_required ? 'checkmark-circle' : 'close-circle'}
                            size={20}
                            color={course.is_required ? 'green' : 'red'}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
          
          {curriculumData?.semesters?.length === 0 && (
            <View style={styles.noDataContainer}>
              <Icon name="school-outline" size={50} color="#ccc" />
              <Text style={styles.noDataText}>Không tìm thấy dữ liệu chương trình khung</Text>
            </View>
          )}
        </ScrollView>
      )}
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 20,
    color: '#999',
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#666',
  },
  semesterList: {
    marginTop: 16,
  },
  semesterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  semesterItemExpanded: {
    backgroundColor: '#E0F7FF',
  },
  semesterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowIcon: {
    marginRight: 8,
  },
  semesterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  semesterCredits: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subjectList: {
    paddingTop: 8,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E0E7FF',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  headerName: {
    flex: 3,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    textAlign: 'left',
    paddingLeft: 10,
  },
  headerCode: {
    flex: 2,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#CCCCCC',
  },
  headerCredits: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#CCCCCC',
  },
  headerStatus: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#CCCCCC',
  },
  subjectItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
    backgroundColor: '#FFFFFF',
  },
  subjectName: {
    flex: 3,
    fontSize: 14,
    color: '#333',
    textAlign: 'left',
    paddingLeft: 10,
  },
  subjectCode: {
    flex: 2,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E7FF',
  },
  subjectCredits: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E7FF',
  },
  subjectStatus: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E7FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#d9534f',
    textAlign: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  majorSelection: {
    marginBottom: 20,
  },
  majorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  majorDropdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  majorItem: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 4,
  },
  selectedMajorItem: {
    backgroundColor: '#0066CC',
  },
  majorText: {
    fontSize: 14,
    color: '#333',
  },
  selectedMajorText: {
    color: '#fff',
  }
});

export default ChuongTrinhKhung;