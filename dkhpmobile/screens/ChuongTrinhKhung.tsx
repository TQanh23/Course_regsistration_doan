import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

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
  const [expandedSemester, setExpandedSemester] = useState<number | null>(null); // Trạng thái mở/đóng của học kỳ
  const [expandedSemesters, setExpandedSemesters] = useState<number[]>([]); // Mảng các học kỳ đang mở

  // Handle back navigation
  const handleBackPress = () => {
    navigation.goBack();
  };

  // Add navigation to ThongBao screen
  const navigateToThongBao = () => {
    navigation.navigate('ThongBao');
  };

  const semesters = [
    {
      name: 'Học kì 1',
      credits: 17,
      subjects: [
        { name: 'Đại số tuyến tính kỹ thuật', code: '398801', credits: 3, status: true },
        { name: 'Giáo dục quốc phòng 1', code: '480111', credits: 3, status: true },
        { name: 'Giáo dục quốc phòng 2', code: '480112', credits: 2, status: true },
        { name: 'Giáo dục quốc phòng 3', code: '480113', credits: 1, status: true },
        { name: 'Giáo dục quốc phòng 4', code: '480114', credits: 2, status: true },
        { name: 'Nhập môn lập trình', code: '538801', credits: 3, status: true },
        { name: 'Tham quan, thực tập', code: '608805', credits: 1, status: true },
        { name: 'Tiếng Anh cơ bản 1', code: '448803', credits: 2, status: true },
        { name: 'Nhập môn giải tích kỹ thuật', code: '398802', credits: 3, status: true },
        { name: 'Giới thiệu ngành Khoa học máy tính', code: '608800', credits: 1, status: true },
        { name: 'Vật lý kỹ thuật 1', code: '258811', credits: 1, status: true },
        { name: 'Thực hành vật lý kỹ thuật 1', code: '258803', credits: 1, status: true },
      ],
    },
    {
      name: 'Học kì 2',
      credits: 22,
      subjects: [
        { name: 'Thực hành vật lý kỹ thuật 2', code: '258804', credits: 1, status: true },
        { name: 'Vật lý kỹ thuật 2', code: '258812', credits: 2, status: true },
        { name: 'Giải tích ứng dụng kỹ thuật', code: '398803', credits: 3, status: true },
        { name: 'Triết học Mác - Lênin', code: '428801', credits: 3, status: true },
        { name: 'Giáo dục thể chất 1', code: '430101', credits: 1, status: true },
        { name: 'Giáo dục thể chất 2', code: '430102', credits: 1, status: true },
        { name: 'Giáo dục thể chất 3', code: '430103', credits: 1, status: true },
        { name: 'Tiếng Anh cơ bản 2', code: '448804', credits: 2, status: true },
        { name: 'Lập trình C++', code: '468802', credits: 3, status: true },
        { name: 'Pháp luật đại cương', code: '518801', credits: 2, status: true },
        { name: 'Lập trình dành cho kỹ thuật', code: '608803', credits: 3, status: true },
        { name: 'Lập trình nâng cao', code: '608804', credits: 3, status: true },
      ],
    },
    { 
        name: 'Học kì 3', 
        credits: 22,
        subjects: [
            { name: 'Kinh tế kỹ thuật', code: '368802', credits: 2, status: true },
            { name: 'Xác suất thống kê kỹ thuật', code: '408801', credits: 2, status: true },
            { name: 'Toán rời rạc', code: '408804', credits: 3, status: true },
            { name: 'Kinh tế chính trị Mác - Lênin', code: '428802', credits: 2, status: true },
            { name: 'Tiếng Anh TOEIC 1', code: '448805', credits: 2, status: true },
            { name: 'Cấu trúc dữ liệu và thuật toán', code: '478801', credits: 3, status: true },
            { name: 'Lập trình Web', code: '478802', credits: 3, status: true },
            { name: 'Kiến trúc máy tính', code: '538803', credits: 3, status: true },
            { name: 'Nguyên lý hệ điều hành', code: '538804', credits: 2, status: true },
          ],
     },
    { name: 'Học kì 4', 
        credits: 21,
        subjects: [
            { name: 'Đại số hiện đại ứng dụng', code: '408809', credits: 2, status: true },
            { name: 'Các mô hình tính toán', code: '408810', credits: 2, status: true },
            { name: 'Mạng máy tính', code: '468804', credits: 3, status: true },
            { name: 'Chủ nghĩa xã hội khoa học', code: '428803', credits: 2, status: true },
            { name: 'Tiếng Anh TOEIC 2', code: '448806', credits: 2, status: true },
            { name: 'Hệ cơ sở dữ liệu', code: '478803', credits: 3, status: true },
            { name: 'Phân tích và thiết kế thuật toán', code: '608806', credits: 3, status: true },
            { name: 'Nhập môn trí tuệ nhân tạo', code: '608825', credits: 3, status: true },
            { name: 'Đồ án hệ cơ sở dữ liệu', code: '478804', credits: 1, status: true },
          ], },
    { name: 'Học kì 5', 
        credits: 19,
        subjects: [
            { name: 'Lịch sử Đảng cộng sản Việt Nam', code: '418801', credits: 2, status: true },
            { name: 'Công nghệ phần mềm', code: '478805', credits: 3, status: true },
            { name: 'Đồ án công nghệ phần mềm', code: '478807', credits: 1, status: true },
            { name: 'Học máy', code: '608807', credits: 3, status: true },
            { name: 'Nguyên lý ngôn ngữ lập trình', code: '608808', credits: 3, status: true },
            { name: 'Xử lý ảnh', code: '608809', credits: 3, status: true },
            { name: 'Đồ án Xử lý ảnh', code: '608810', credits: 1, status: true },
            { name: 'Nhập môn dữ liệu lớn', code: '608813', credits: 3, status: true },
          ],
     },
    { name: 'Học kì 6', 
        credits: 19,
        subjects: [
            { name: 'Tư tưởng Hồ Chí Minh', code: '418802', credits: 2, status: true },
            { name: 'Xử lý ngôn ngữ tự nhiên', code: '608811', credits: 3},
            { name: 'Đồ án Thị giác máy tính', code: '608815', credits: 1},
            { name: 'Thị giác máy tính', code: '608814', credits: 3},
            { name: 'Khai phá dữ liệu', code: '608816', credits: 3},
            { name: 'Phát triển ứng dụng đa nền tảng', code: '608818', credits: 3, status: true },
            { name: 'Đồ án Phát triển ứng dụng đa nền tảng', code: '608819', credits: 1},
            { name: 'Phát triển ứng dụng phía máy chủ', code: '608820', credits: 3},
          ],
    },
    { name: 'Học kì 7', 
        credits: 10,
        subjects: [
            { name: 'Thực tập tốt nghiệp', code: '608821', credits: 3},
            { name: 'Đồ án tốt nghiệp', code: '608822', credits: 7},
          ],
     },
  ];

  const toggleSemester = (index: number) => {
    setExpandedSemesters((prev) => {
      // Kiểm tra nếu học kỳ đã mở
      if (prev.includes(index)) {
        // Nếu đã mở, loại bỏ khỏi mảng (đóng lại)
        return prev.filter((i) => i !== index);
      } else {
        // Nếu chưa mở, thêm vào mảng (mở ra)
        return [...prev, index];
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Nút quay lại */}
        <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Tiêu đề */}
        <Text style={styles.headerTitle}>Chương trình khung</Text>

        {/* Nút thông báo */}
        <TouchableOpacity onPress={navigateToThongBao} style={styles.iconButton}>
          <Icon name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Nội dung */}
      <ScrollView style={styles.content}>
        {/* Tiêu đề chính */}
        <Text style={styles.subtitle}>Chuyên ngành</Text>
        <Text style={styles.mainTitle}>Khoa học máy tính</Text>

        {/* Thông tin chi tiết */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Ngành: </Text>Khoa học máy tính
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Hệ đào tạo: </Text>Đại học-B7
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Loại đào tạo: </Text>Chính quy - CDIO
          </Text>
        </View>

        {/* Danh sách học kỳ */}
        <View style={styles.semesterList}>
          {semesters.map((semester, index) => (
            <View key={index}>
              {/* Học kỳ */}
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

              {/* Danh sách môn học */}
              {expandedSemesters.includes(index) && (
                <View style={styles.subjectList}>
                  {/* Tiêu đề cột */}
                  <View style={styles.tableHeader}>
                    <Text style={styles.headerName}>Tên học phần</Text>
                    <Text style={styles.headerCode}>Mã HP</Text>
                    <Text style={styles.headerCredits}>TC</Text>
                    <Text style={styles.headerStatus}>TT</Text>
                  </View>
                  
                  {/* Các môn học */}
                  {semester.subjects?.map((subject, subIndex) => (
                    <View key={subIndex} style={styles.subjectItem}>
                      <Text style={styles.subjectName}>{subject.name}</Text>
                      <Text style={styles.subjectCode}>{subject.code}</Text>
                      <Text style={styles.subjectCredits}>{subject.credits}</Text>
                      <View style={styles.subjectStatus}>
                        {subject.status !== undefined && (
                          <Icon
                            name={subject.status ? 'checkmark-circle' : 'close-circle'}
                            size={20}
                            color={subject.status ? 'green' : 'red'}
                          />
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
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
    flexDirection: 'row', // Hiển thị mũi tên và tên học kỳ trên cùng một dòng
    alignItems: 'center',
  },
  arrowIcon: {
    marginRight: 8, // Khoảng cách giữa mũi tên và tên học kỳ
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
  }
});

export default ChuongTrinhKhung;