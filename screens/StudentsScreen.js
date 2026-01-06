import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  FlatList,
  Clipboard,
  ToastAndroid
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  TextInput,
  Modal,
  Portal,
  Provider as PaperProvider,
  FAB,
  Avatar,
  Divider,
  IconButton,
  Snackbar
} from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const StudentsScreen = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [newStudentInfo, setNewStudentInfo] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [className, setClassName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/all`);
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const generateStudentId = () => {
    // Generate a unique student ID: YYYYMMDD + random 4 digits
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${year}${month}${day}${random}`;
  };

  const handleAddStudent = async () => {
    if (!name || !email || !className || !roomNumber) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const studentId = generateStudentId();
    const studentData = {
      name,
      studentId,
      email,
      className,
      roomNumber
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/students/add`, studentData);
      if (response.data.success) {
        const newStudent = response.data.data;
        setNewStudentInfo({
          name: newStudent.name,
          studentId: newStudent.studentId,
          email: newStudent.email,
          className: newStudent.className,
          roomNumber: newStudent.roomNumber,
          password: 'student123'
        });
        
        setModalVisible(false);
        setSuccessModalVisible(true);
        resetForm();
        fetchStudents();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add student');
    }
  };

  const copyToClipboard = (text, label) => {
    Clipboard.setString(text);
    setSnackbarMessage(`${label} copied to clipboard!`);
    setSnackbarVisible(true);
    
    // Show toast on Android
    if (Platform.OS === 'android') {
      ToastAndroid.show(`${label} copied!`, ToastAndroid.SHORT);
    }
  };

  const handleDeleteStudent = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this student?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/students/delete/${id}`);
              Alert.alert('Success', 'Student deleted successfully');
              fetchStudents();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete student');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setClassName('');
    setRoomNumber('');
  };

  const renderStudentItem = ({ item }) => (
    <Card style={styles.studentCard} mode="outlined">
      <Card.Content>
        <View style={styles.studentHeader}>
          <Avatar.Text 
            size={50} 
            label={item.name.split(' ').map(n => n[0]).join('')}
            style={styles.avatar}
          />
          <View style={styles.studentBasicInfo}>
            <Title style={styles.studentName}>{item.name}</Title>
            <View style={styles.studentIdContainer}>
              <Text style={styles.studentIdLabel}>Student ID: </Text>
              <Text style={styles.studentIdValue}>{item.studentId}</Text>
              <IconButton
                icon="content-copy"
                size={16}
                onPress={() => copyToClipboard(item.studentId, 'Student ID')}
                style={styles.copyButton}
              />
            </View>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.studentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{item.email}</Text>
            <IconButton
              icon="content-copy"
              size={14}
              onPress={() => copyToClipboard(item.email, 'Email')}
              style={styles.smallCopyButton}
            />
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Class:</Text>
            <Text style={styles.detailValue}>{item.className}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Room:</Text>
            <Text style={styles.detailValue}>{item.roomNumber}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Password:</Text>
            <View style={styles.passwordContainer}>
              <Text style={styles.passwordValue}>student123</Text>
              <IconButton
                icon="content-copy"
                size={14}
                onPress={() => copyToClipboard('student123', 'Password')}
                style={styles.smallCopyButton}
              />
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={[
              styles.statusBadge,
              item.isActive ? styles.activeBadge : styles.inactiveBadge
            ]}>
              <Text style={styles.statusText}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.studentActions}>
          <Button
            mode="outlined"
            onPress={() => {
              Alert.alert('Student Information', 
                `Name: ${item.name}\n` +
                `Student ID: ${item.studentId}\n` +
                `Email: ${item.email}\n` +
                `Class: ${item.className}\n` +
                `Room: ${item.roomNumber}\n` +
                `Password: student123\n\n` +
                `Please share this information with the student.`
              );
            }}
            style={styles.actionButton}
            icon="information"
          >
            View Info
          </Button>
          
          <Button
            mode="contained"
            color="#f44336"
            onPress={() => handleDeleteStudent(item._id)}
            style={styles.actionButton}
            icon="delete"
          >
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        {/* Instructions */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.infoTitle}>Add Students</Title>
            <Text style={styles.infoText}>
              • Add students using the + button{'\n'}
              • Student ID will be automatically generated{'\n'}
              • Default password: student123{'\n'}
              • Share Student ID and password with students
            </Text>
          </Card.Content>
        </Card>

        <FlatList
          data={students}
          renderItem={renderStudentItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchStudents}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Students Added</Text>
              <Text style={styles.emptyText}>
                Click the + button to add your first student
              </Text>
            </View>
          }
        />

        <FAB
          style={styles.fab}
          icon="plus"
          label="Add Student"
          onPress={() => setModalVisible(true)}
        />

        {/* Add Student Modal */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => {
              setModalVisible(false);
              resetForm();
            }}
            contentContainerStyle={styles.modalContainer}
          >
            <Card>
              <Card.Content>
                <Title>Add New Student</Title>
                <Text style={styles.modalSubtitle}>
                  Student ID will be generated automatically
                </Text>
                
                <TextInput
                  label="Full Name *"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="words"
                />
                
                <TextInput
                  label="Email *"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <TextInput
                  label="Class *"
                  value={className}
                  onChangeText={setClassName}
                  mode="outlined"
                  style={styles.input}
                  placeholder="e.g., CS-3, IT-2"
                />
                
                <TextInput
                  label="Room Number *"
                  value={roomNumber}
                  onChangeText={setRoomNumber}
                  mode="outlined"
                  style={styles.input}
                  placeholder="e.g., 305, A-101"
                />
                
                <View style={styles.passwordInfo}>
                  <Text style={styles.passwordInfoText}>
                    Default password: <Text style={styles.passwordHighlight}>student123</Text>
                  </Text>
                </View>
                
                <View style={styles.modalButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setModalVisible(false);
                      resetForm();
                    }}
                    style={styles.modalButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleAddStudent}
                    style={styles.modalButton}
                  >
                    Add Student
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>

        {/* Success Modal with Student ID */}
        <Portal>
          <Modal
            visible={successModalVisible}
            onDismiss={() => setSuccessModalVisible(false)}
            contentContainerStyle={styles.successModalContainer}
          >
            <Card>
              <Card.Content>
                <View style={styles.successHeader}>
                  <Avatar.Icon size={60} icon="check-circle" style={styles.successIcon} />
                  <Title style={styles.successTitle}>Student Added Successfully!</Title>
                </View>
                
                <Text style={styles.successSubtitle}>
                  Please share this information with the student:
                </Text>
                
                {newStudentInfo && (
                  <View style={styles.studentInfoContainer}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Student ID:</Text>
                      <View style={styles.infoValueContainer}>
                        <Text style={styles.infoValue}>{newStudentInfo.studentId}</Text>
                        <IconButton
                          icon="content-copy"
                          size={20}
                          onPress={() => copyToClipboard(newStudentInfo.studentId, 'Student ID')}
                        />
                      </View>
                    </View>
                    
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Name:</Text>
                      <Text style={styles.infoValue}>{newStudentInfo.name}</Text>
                    </View>
                    
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Class:</Text>
                      <Text style={styles.infoValue}>{newStudentInfo.className}</Text>
                    </View>
                    
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Room:</Text>
                      <Text style={styles.infoValue}>{newStudentInfo.roomNumber}</Text>
                    </View>
                    
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Password:</Text>
                      <View style={styles.infoValueContainer}>
                        <Text style={styles.infoValue}>student123</Text>
                        <IconButton
                          icon="content-copy"
                          size={20}
                          onPress={() => copyToClipboard('student123', 'Password')}
                        />
                      </View>
                    </View>
                    
                    <View style={styles.loginInstructions}>
                      <Text style={styles.instructionsTitle}>Login Instructions:</Text>
                      <Text style={styles.instructionsText}>
                        1. Open Student App{'\n'}
                        2. Enter Student ID: {newStudentInfo.studentId}{'\n'}
                        3. Enter Password: student123{'\n'}
                        4. Click Login
                      </Text>
                    </View>
                  </View>
                )}
                
                <View style={styles.successButtons}>
                  <Button
                    mode="contained"
                    onPress={() => {
                      // Copy all info
                      const infoText = 
                        `Student Information:\n` +
                        `Name: ${newStudentInfo.name}\n` +
                        `Student ID: ${newStudentInfo.studentId}\n` +
                        `Class: ${newStudentInfo.className}\n` +
                        `Room: ${newStudentInfo.roomNumber}\n` +
                        `Password: student123\n` +
                        `Login URL: [Your Student App URL]`;
                      
                      copyToClipboard(infoText, 'Student Information');
                    }}
                    style={styles.copyAllButton}
                    icon="content-copy"
                  >
                    Copy All Information
                  </Button>
                  
                  <Button
                    mode="outlined"
                    onPress={() => setSuccessModalVisible(false)}
                    style={styles.doneButton}
                  >
                    Done
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>

        {/* Snackbar for copy notifications */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2000}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  infoCard: {
    margin: 15,
    marginBottom: 10,
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 18,
    color: '#1976D2',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  list: {
    padding: 10,
    paddingBottom: 80,
  },
  studentCard: {
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    marginRight: 15,
    backgroundColor: '#6200ee',
  },
  studentBasicInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  studentIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  studentIdLabel: {
    fontSize: 14,
    color: '#666',
  },
  studentIdValue: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: 'bold',
  },
  copyButton: {
    margin: 0,
    marginLeft: 5,
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#E0E0E0',
  },
  studentDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 80,
    color: '#666',
    fontSize: 14,
  },
  detailValue: {
    flex: 1,
    color: '#333',
    fontSize: 14,
  },
  smallCopyButton: {
    margin: 0,
    marginLeft: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  passwordValue: {
    flex: 1,
    color: '#333',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 5,
  },
  activeBadge: {
    backgroundColor: '#d4edda',
  },
  inactiveBadge: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  studentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    maxHeight: '90%',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  input: {
    marginBottom: 15,
  },
  passwordInfo: {
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  passwordInfoText: {
    fontSize: 14,
    color: '#E65100',
  },
  passwordHighlight: {
    fontWeight: 'bold',
    color: '#E65100',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  successModalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    maxHeight: '90%',
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    backgroundColor: '#4CAF50',
    marginBottom: 10,
  },
  successTitle: {
    textAlign: 'center',
    color: '#4CAF50',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  studentInfoContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 100,
    color: '#666',
    fontSize: 14,
  },
  infoValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    flex: 1,
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  loginInstructions: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 5,
  },
  instructionsTitle: {
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  instructionsText: {
    color: '#2E7D32',
    fontSize: 13,
    lineHeight: 20,
  },
  successButtons: {
    marginTop: 10,
  },
  copyAllButton: {
    marginBottom: 10,
    backgroundColor: '#2196F3',
  },
  doneButton: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
});

export default StudentsScreen;