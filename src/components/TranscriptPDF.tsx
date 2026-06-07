import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts for Vietnamese support via Google Fonts
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: '../../public/fonts/times-new-roman.ttf',
      fontWeight: 'normal',
    },
    {
      src: '../../public/fonts/times-new-roman-bold.ttf',
      fontWeight: 'bold',
    },
  ],
});

// StyleSheet creation for PDF document
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    padding: 40,
    fontSize: 11,
    lineHeight: 1.5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  headerLeft: {
    alignItems: 'flex-start',
    width: '45%',
  },
  headerRight: {
    alignItems: 'center',
    width: '55%',
  },
  boldText: {
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  profileCol: {
    width: '50%',
  },
  profileRow: {
    flexDirection: 'row',
    marginBottom: 5.5,
  },
  profileLabel: {
    width: 80,
  },
  profileValue: {
    flex: 1,
  },
  tableSection: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#000',
    marginBottom: 18,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    borderStyle: 'solid',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
    padding: 5,
    display: 'flex',
    justifyContent: 'center',
  },
  col1: { width: '8%', textAlign: 'center' },
  col2: { width: '15%', textAlign: 'center' },
  col3: { width: '37%', textAlign: 'left' },
  col4: { width: '10%', textAlign: 'center' },
  col5: { width: '15%', textAlign: 'center' },
  col6: { width: '15%', textAlign: 'center' },
  summaryContainer: {
    marginTop: 10,
  },
  summaryText: {
    marginBottom: 5,
  },
});

const ROWS_PER_TABLE_SECTION = 18;

const chunkCourses = (courses: Course[], chunkSize: number) => {
  const chunks: Course[][] = [];

  for (let index = 0; index < courses.length; index += chunkSize) {
    chunks.push(courses.slice(index, index + chunkSize));
  }

  return chunks;
};

export interface StudentInfo {
  fullName: string;
  dob: string;
  studentId: string;
  course: string;
  program: string;
  major: string;
}

export interface Course {
  no: number | string;
  id: string;
  title: string;
  credits: number | string;
  score10: number | string;
  score4: number | string;
}

export interface Summary {
  totalCredits: number | string;
  gpa10: number | string;
  gpa4: number | string;
}

export interface TranscriptPDFProps {
  data: {
    studentInfo: StudentInfo;
    courses: Course[];
    summary: Summary;
  };
}

export const TranscriptPDF: React.FC<TranscriptPDFProps> = ({ data }) => {
  const courseSections = chunkCourses(data.courses, ROWS_PER_TABLE_SECTION);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Text>ĐẠI HỌC QUỐC GIA TP.HCM</Text>
            <Text style={styles.boldText}>TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.boldText}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
            <Text style={styles.boldText}>Độc lập - Tự do - Hạnh phúc</Text>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>BẢNG ĐIỂM HỌC TẬP</Text>
        </View>

        {/* Student Profile Section */}
        <View style={styles.profileContainer}>
          <View style={styles.profileCol}>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Họ và tên:</Text>
              <Text style={styles.profileValue}>{data.studentInfo.fullName}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Ngày sinh:</Text>
              <Text style={styles.profileValue}>{data.studentInfo.dob}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Mã số SV:</Text>
              <Text style={styles.profileValue}>{data.studentInfo.studentId}</Text>
            </View>
          </View>
          <View style={styles.profileCol}>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Khóa học:</Text>
              <Text style={styles.profileValue}>{data.studentInfo.course}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Chương trình:</Text>
              <Text style={styles.profileValue}>{data.studentInfo.program}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Ngành học:</Text>
              <Text style={styles.profileValue}>{data.studentInfo.major}</Text>
            </View>
          </View>
        </View>

        {/* Data Table Section */}
        {courseSections.map((sectionCourses, sectionIndex) => (
          <View
            style={styles.tableSection}
            key={sectionIndex}
            break={sectionIndex > 0}
            wrap={false}
          >
            <View style={[styles.tableRow, styles.tableHeader]} wrap={false}>
              <View style={[styles.tableCell, styles.col1]}>
                <Text style={styles.boldText}>STT</Text>
              </View>
              <View style={[styles.tableCell, styles.col2]}>
                <Text style={styles.boldText}>Mã MH</Text>
              </View>
              <View style={[styles.tableCell, styles.col3]}>
                <Text style={styles.boldText}>Tên môn học</Text>
              </View>
              <View style={[styles.tableCell, styles.col4]}>
                <Text style={styles.boldText}>Số TC</Text>
              </View>
              <View style={[styles.tableCell, styles.col5]}>
                <Text style={styles.boldText}>Điểm hệ 10</Text>
              </View>
              <View style={[styles.tableCell, styles.col6]}>
                <Text style={styles.boldText}>Điểm hệ 4</Text>
              </View>
            </View>

            {sectionCourses.map((course, index) => (
              <View style={styles.tableRow} key={`${sectionIndex}-${index}`} wrap={false}>
                <View style={[styles.tableCell, styles.col1]}>
                  <Text>{course.no}</Text>
                </View>
                <View style={[styles.tableCell, styles.col2]}>
                  <Text>{course.id}</Text>
                </View>
                <View style={[styles.tableCell, styles.col3]}>
                  <Text>{course.title}</Text>
                </View>
                <View style={[styles.tableCell, styles.col4]}>
                  <Text>{course.credits}</Text>
                </View>
                <View style={[styles.tableCell, styles.col5]}>
                  <Text>{course.score10}</Text>
                </View>
                <View style={[styles.tableCell, styles.col6]}>
                  <Text>{course.score4}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Summary Section */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            Tổng số tín chỉ tích lũy: {data.summary.totalCredits}
          </Text>
          <Text style={styles.summaryText}>
            Điểm trung bình tích lũy (Hệ 10): {data.summary.gpa10}
          </Text>
          <Text style={styles.summaryText}>
            Điểm trung bình (Hệ 4): {data.summary.gpa4}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default TranscriptPDF;
