import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  FlatList,
  ScrollView,
  RefreshControl
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
  SegmentedButtons,
  Divider,
  ActivityIndicator
} from 'react-native-paper';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const ExpenseScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'summary'
  const [summaryData, setSummaryData] = useState(null);
  
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

  useEffect(() => {
    if (view === 'summary') {
      fetchSummary();
    }
  }, [view]);

  const fetchExpenses = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(API_ENDPOINTS.EXPENSES.ALL);
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch expenses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const response = await axios.get(API_ENDPOINTS.EXPENSES.SUMMARY);
      if (response.data.success) {
        setSummaryData(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch summary');
    } finally {
      setSummaryLoading(false);
    }
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
      if (view === 'summary') {
        fetchSummary();
      }
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
              if (view === 'summary') {
                fetchSummary();
              }
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
          <View style={styles.expenseInfo}>
            <Title style={styles.expenseTitle}>{item.category}</Title>
            <Text style={styles.expenseDate}>
              {new Date(item.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>₹{parseFloat(item.amount).toFixed(2)}</Text>
            <Text style={styles.recordedBy}>By: {item.recordedBy}</Text>
          </View>
        </View>
        
        <Text style={styles.description}>{item.description}</Text>
        
        <View style={styles.expenseActions}>
          <Button
            icon="pencil"
            mode="text"
            onPress={() => handleEdit(item)}
            style={styles.actionButton}
          >
            Edit
          </Button>
          <Button
            icon="delete"
            mode="text"
            textColor="#f44336"
            onPress={() => handleDelete(item._id)}
            style={styles.actionButton}
          >
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderSummary = () => {
    if (summaryLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading summary...</Text>
        </View>
      );
    }

    if (!summaryData) {
      return (
        <View style={styles.emptySummaryContainer}>
          <Text style={styles.emptyText}>No expense data available</Text>
        </View>
      );
    }

    const { byCategory = [], total = 0 } = summaryData;
    
    // Prepare data for pie chart
    const pieChartData = byCategory.map((item, index) => ({
      name: item._id,
      amount: item.totalAmount,
      color: getCategoryColor(item._id, index),
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));

    // Calculate percentages
    const categoryData = byCategory.map(item => ({
      ...item,
      percentage: total > 0 ? ((item.totalAmount / total) * 100).toFixed(1) : 0
    }));

    return (
      <ScrollView style={styles.summaryContainer}>
        {/* Total Expenses Card */}
        <Card style={styles.totalCard}>
          <Card.Content>
            <View style={styles.totalHeader}>
              <Text style={styles.totalLabel}>Total Expenses</Text>
              <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Pie Chart Card */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.chartTitle}>Expense Distribution</Title>
            {byCategory.length > 0 ? (
              <View style={styles.chartContainer}>
                <PieChart
                  data={pieChartData}
                  width={screenWidth - 60}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            ) : (
              <Text style={styles.noChartData}>No data for chart</Text>
            )}
          </Card.Content>
        </Card>

        {/* Category-wise Breakdown */}
        <Card style={styles.breakdownCard}>
          <Card.Content>
            <Title style={styles.breakdownTitle}>Category-wise Breakdown</Title>
            
            {categoryData.map((item, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <View 
                      style={[
                        styles.colorDot, 
                        { backgroundColor: getCategoryColor(item._id, index) }
                      ]} 
                    />
                    <Text style={styles.categoryName}>{item._id}</Text>
                  </View>
                  <Text style={styles.categoryPercentage}>{item.percentage}%</Text>
                </View>
                
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Amount:</Text>
                  <Text style={styles.categoryAmount}>₹{item.totalAmount.toFixed(2)}</Text>
                </View>
                
                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar,
                      { 
                        width: `${item.percentage}%`,
                        backgroundColor: getCategoryColor(item._id, index)
                      }
                    ]} 
                  />
                </View>
                
                {index < categoryData.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))}
            
            {/* Summary Statistics */}
            <Card style={styles.statsCard}>
              <Card.Content>
                <Title style={styles.statsTitle}>Summary Statistics</Title>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{byCategory.length}</Text>
                    <Text style={styles.statLabel}>Categories</Text>
                  </View>
                  <Divider style={styles.verticalDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {total > 0 ? (total / byCategory.length).toFixed(2) : 0}
                    </Text>
                    <Text style={styles.statLabel}>Avg/Category</Text>
                  </View>
                  <Divider style={styles.verticalDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {byCategory.length > 0 
                        ? Math.max(...byCategory.map(item => item.totalAmount)).toFixed(2) 
                        : 0
                      }
                    </Text>
                    <Text style={styles.statLabel}>Highest</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };

  // Helper function to get colors for categories
  const getCategoryColor = (category, index) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', 
      '#EF476F', '#073B4C', '#7209B7', '#F3722C', '#277DA1'
    ];
    
    // Use index or create hash from category name
    const colorIndex = index % colors.length;
    return colors[colorIndex];
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        {/* View Toggle */}
        <View style={styles.toggleContainer}>
          <SegmentedButtons
            value={view}
            onValueChange={setView}
            buttons={[
              { 
                value: 'list', 
                label: 'List View',
                icon: 'format-list-bulleted',
                style: view === 'list' ? styles.selectedButton : null
              },
              { 
                value: 'summary', 
                label: 'Summary',
                icon: 'chart-pie',
                style: view === 'summary' ? styles.selectedButton : null
              },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Content based on view */}
        {view === 'list' ? (
          <FlatList
            data={expenses}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={fetchExpenses} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Expenses Found</Text>
                <Text style={styles.emptyText}>Add your first expense using the + button</Text>
              </View>
            }
          />
        ) : (
          renderSummary()
        )}

        {/* Add/Edit Expense Modal */}
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
                
                {/* Category Selection */}
                <Text style={styles.inputLabel}>Category *</Text>
                <SegmentedButtons
                  value={category}
                  onValueChange={setCategory}
                  buttons={categories.map(cat => ({
                    value: cat,
                    label: cat,
                    style: category === cat ? styles.selectedCategory : null
                  }))}
                  style={styles.categoryButtons}
                />
                
                {/* Amount Input */}
                <TextInput
                  label="Amount (₹) *"
                  value={amount}
                  onChangeText={setAmount}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                  left={<TextInput.Icon icon="currency-inr" />}
                  placeholder="0.00"
                />
                
                {/* Description Input */}
                <TextInput
                  label="Description *"
                  value={description}
                  onChangeText={setDescription}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  placeholder="Enter expense description..."
                />
                
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
                    onPress={handleSaveExpense}
                    style={styles.modalButton}
                    disabled={!amount || !description}
                  >
                    {editingExpense ? 'Update' : 'Save'}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>

        {/* FAB for adding expenses (only in list view) */}
        {view === 'list' && (
          <FAB
            style={styles.fab}
            icon="plus"
            label="Add Expense"
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
  toggleContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: 'white',
  },
  segmentedButtons: {
    marginBottom: 5,
  },
  selectedButton: {
    backgroundColor: '#6200ee',
  },
  list: {
    padding: 15,
    paddingBottom: 80,
  },
  expenseCard: {
    marginBottom: 15,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  expenseDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e53935',
  },
  recordedBy: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 15,
  },
  expenseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 10,
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
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  // Summary View Styles
  summaryContainer: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptySummaryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  totalCard: {
    marginBottom: 15,
    backgroundColor: '#6200ee',
  },
  totalHeader: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chartCard: {
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
  },
  noChartData: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
  breakdownCard: {
    marginBottom: 20,
  },
  breakdownTitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  categoryItem: {
    marginBottom: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 5,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  divider: {
    marginTop: 15,
    backgroundColor: '#E0E0E0',
  },
  statsCard: {
    marginTop: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statsTitle: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  // Modal Styles
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    maxHeight: '90%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 8,
  },
  categoryButtons: {
    marginBottom: 15,
  },
  selectedCategory: {
    backgroundColor: '#6200ee',
  },
  input: {
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

export default ExpenseScreen;