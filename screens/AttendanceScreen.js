import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Text,
  TextInput,
  Modal,
  Portal,
  Provider as PaperProvider,
  RadioButton,
  FAB
} from 'react-native-paper';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import DateTimePicker from '@react-native-community/datetimepicker';

const AttendanceScreen = () => {
  const [attendance, setAttendance] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [status, setStatus] = useState('Present');
  const [mealType, setMealType] = useState('Breakfast');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ATTENDANCE.ALL);
      if (response.data.success) {
        setAttendance(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!studentName || !className || !roomNumber) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const attendanceData = {
      studentName,
      className,
      roomNumber,
      status,
      mealType,
      date: date.toISOString()
    };

    try {
      await axios.post(API_ENDPOINTS.ATTENDANCE.MARK, attendanceData);
      Alert.alert('Success', 'Attendance marked successfully');
      setModalVisible(false);
      resetForm();
      fetchAttendance();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark attendance');
    }
  };

  const resetForm = () => {
    setStudentName('');
    setClassName('');
    setRoomNumber('');
    setStatus('Present');
    setMealType('Breakfast');
    setDate(new Date());
  };

  const renderAttendanceItem = ({ item }) => (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <View style={styles.attendanceHeader}>
          <Title style={styles.studentName}>{item.studentName}</Title>
          <Text style={[styles.status, 
            item.status === 'Present' ? styles.present : styles.absent
          ]}>
            {item.status}
          </Text>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Class:</Text>
            <Text>{item.className}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Room:</Text>
            <Text>{item.roomNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Meal:</Text>
            <Text>{item.mealType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Date:</Text>
            <Text>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <FlatList
          data={attendance}
          renderItem={renderAttendanceItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchAttendance}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No attendance records found</Text>
          }
        />

        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => {
              setModalVisible(false);
              resetForm();
            }}
            contentContainerStyle={styles.modal}
          >
            <Card>
              <Card.Content>
                <Title>Mark Attendance</Title>
                
                <TextInput
                  label="Student Name"
                  value={studentName}
                  onChangeText={setStudentName}
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label="Class"
                  value={className}
                  onChangeText={setClassName}
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label="Room Number"
                  value={roomNumber}
                  onChangeText={setRoomNumber}
                  mode="outlined"
                  style={styles.input}
                />
                
                <Text style={styles.sectionTitle}>Meal Type</Text>
                <RadioButton.Group onValueChange={setMealType} value={mealType}>
                  <View style={styles.radioGroup}>
                    <View style={styles.radioOption}>
                      <RadioButton value="Breakfast" />
                      <Text>Breakfast</Text>
                    </View>
                    <View style={styles.radioOption}>
                      <RadioButton value="Lunch" />
                      <Text>Lunch</Text>
                    </View>
                    <View style={styles.radioOption}>
                      <RadioButton value="Dinner" />
                      <Text>Dinner</Text>
                    </View>
                  </View>
                </RadioButton.Group>
                
                <Text style={styles.sectionTitle}>Status</Text>
                <RadioButton.Group onValueChange={setStatus} value={status}>
                  <View style={styles.radioGroup}>
                    <View style={styles.radioOption}>
                      <RadioButton value="Present" />
                      <Text>Present</Text>
                    </View>
                    <View style={styles.radioOption}>
                      <RadioButton value="Absent" />
                      <Text>Absent</Text>
                    </View>
                  </View>
                </RadioButton.Group>
                
                <View style={styles.dateContainer}>
                  <Text style={styles.dateLabel}>Date:</Text>
                  <Button
                    mode="outlined"
                    onPress={() => setShowDatePicker(true)}
                  >
                    {date.toLocaleDateString()}
                  </Button>
                </View>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setDate(selectedDate);
                      }
                    }}
                  />
                )}
                
                <View style={styles.modalButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setModalVisible(false);
                      resetForm();
                    }}
                    style={styles.button}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleMarkAttendance}
                    style={styles.button}
                  >
                    Mark Attendance
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>

        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => setModalVisible(true)}
        />
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 10,
  },
  card: {
    marginBottom: 10,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  studentName: {
    fontSize: 18,
  },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    fontWeight: 'bold',
  },
  present: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  absent: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  details: {
    marginTop: 5,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: 60,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  input: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateLabel: {
    marginRight: 10,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default AttendanceScreen;