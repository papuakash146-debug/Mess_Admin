import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
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
  List,
  FAB,
  SegmentedButtons
} from 'react-native-paper';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const ExpenseScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'summary'
  
  const [category, setCategory] = useState('Groceries');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const categories = [
    'Groceries',
    'Vegetables',
    'Fruits',
    'Dairy',
    'Cleaning',
    'Utensils',
    'Miscellaneous'
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.EXPENSES.ALL);
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.EXPENSES.SUMMARY);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch summary');
    }
    return null;
  };

  const handleSaveExpense = async () => {
    if (!category || !amount || !description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const expenseData = {
      category,
      amount: parseFloat(amount),
      description,
      recordedBy: 'Admin'
    };

    try {
      if (editingExpense) {
        await axios.put(API_ENDPOINTS.EXPENSES.UPDATE(editingExpense._id), expenseData);
        Alert.alert('Success', 'Expense updated successfully');
      } else {
        await axios.post(API_ENDPOINTS.EXPENSES.ADD, expenseData);
        Alert.alert('Success', 'Expense added successfully');
      }
      
      setModalVisible(false);
      resetForm();
      fetchExpenses();
    } catch (error) {
      Alert.alert('Error', 'Failed to save expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setCategory(expense.category);
    setAmount(expense.amount.toString());
    setDescription(expense.description);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(API_ENDPOINTS.EXPENSES.DELETE(id));
              fetchExpenses();
              Alert.alert('Success', 'Expense deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expense');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setEditingExpense(null);
    setCategory('Groceries');
    setAmount('');
    setDescription('');
  };

  const renderExpenseItem = ({ item }) => (
    <Card style={styles.expenseCard} mode="outlined">
      <Card.Content>
        <View style={styles.expenseHeader}>
          <View>
            <Title style={styles.expenseTitle}>{item.category}</Title>
            <Text style={styles.expenseDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.amount}>₹{item.amount}</Text>
        </View>
        
        <Text style={styles.description}>{item.description}</Text>
        
        <View style={styles.expenseActions}>
          <Button
            icon="pencil"
            mode="text"
            onPress={() => handleEdit(item)}
          >
            Edit
          </Button>
          <Button
            icon="delete"
            mode="text"
            color="red"
            onPress={() => handleDelete(item._id)}
          >
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderSummary = async () => {
    const summary = await fetchSummary();
    if (!summary) return null;

    return (
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.summaryTitle}>Expense Summary</Title>
            
            {summary.byCategory.map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <Text>{item._id}</Text>
                <Text style={styles.summaryAmount}>₹{item.totalAmount}</Text>
              </View>
            ))}
            
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>₹{summary.total}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <SegmentedButtons
          value={view}
          onValueChange={setView}
          buttons={[
            { value: 'list', label: 'List View' },
            { value: 'summary', label: 'Summary' },
          ]}
          style={styles.segmentedButtons}
        />

        {view === 'list' ? (
          <FlatList
            data={expenses}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={fetchExpenses}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No expenses found</Text>
            }
          />
        ) : (
          renderSummary()
        )}

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
                <Title>{editingExpense ? 'Edit Expense' : 'Add Expense'}</Title>
                
                <TextInput
                  label="Category"
                  value={category}
                  onChangeText={setCategory}
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label="Amount (₹)"
                  value={amount}
                  onChangeText={setAmount}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
                
                <TextInput
                  label="Description"
                  value={description}
                  onChangeText={setDescription}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />
                
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
                    onPress={handleSaveExpense}
                    style={styles.button}
                  >
                    {editingExpense ? 'Update' : 'Save'}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>

        {view === 'list' && (
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() => setModalVisible(true)}
          />
        )}
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  segmentedButtons: {
    margin: 10,
  },
  list: {
    padding: 10,
  },
  expenseCard: {
    marginBottom: 10,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  expenseTitle: {
    fontSize: 18,
  },
  expenseDate: {
    color: '#666',
    fontSize: 12,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e53935',
  },
  description: {
    marginBottom: 10,
    color: '#333',
  },
  expenseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  summaryContainer: {
    padding: 10,
  },
  summaryCard: {
    marginBottom: 10,
  },
  summaryTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryAmount: {
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#333',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e53935',
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

export default ExpenseScreen;