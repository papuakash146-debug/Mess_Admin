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
  List,
  FAB
} from 'react-native-paper';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const MenuScreen = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [day, setDay] = useState('Monday');
  const [mealType, setMealType] = useState('Breakfast');
  const [items, setItems] = useState('');
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.MENU.ALL);
      if (response.data.success) {
        setMenu(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch menu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!day || !mealType || !items) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const menuData = {
      day,
      mealType,
      items: items.split(',').map(item => item.trim())
    };

    try {
      if (editingItem) {
        await axios.put(API_ENDPOINTS.MENU.UPDATE(editingItem._id), menuData);
        Alert.alert('Success', 'Menu updated successfully');
      } else {
        await axios.post(API_ENDPOINTS.MENU.ADD, menuData);
        Alert.alert('Success', 'Menu added successfully');
      }
      
      setModalVisible(false);
      resetForm();
      fetchMenu();
    } catch (error) {
      Alert.alert('Error', 'Failed to save menu');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setDay(item.day);
    setMealType(item.mealType);
    setItems(item.items.join(', '));
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this menu item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(API_ENDPOINTS.MENU.DELETE(id));
              fetchMenu();
              Alert.alert('Success', 'Menu deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete menu');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setEditingItem(null);
    setDay('Monday');
    setMealType('Breakfast');
    setItems('');
  };

  const renderMenuItem = ({ item }) => (
    <Card style={styles.menuCard} mode="outlined">
      <Card.Content>
        <View style={styles.menuHeader}>
          <Title style={styles.menuTitle}>{item.day} - {item.mealType}</Title>
          <View style={styles.menuActions}>
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
        </View>
        <List.Section>
          {item.items.map((foodItem, index) => (
            <List.Item
              key={index}
              title={foodItem}
              left={props => <List.Icon {...props} icon="food" />}
            />
          ))}
        </List.Section>
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <FlatList
          data={menu}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchMenu}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No menu items found</Text>
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
                <Title>{editingItem ? 'Edit Menu' : 'Add Menu Item'}</Title>
                
                <TextInput
                  label="Day"
                  value={day}
                  onChangeText={setDay}
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label="Meal Type"
                  value={mealType}
                  onChangeText={setMealType}
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label="Items (comma separated)"
                  value={items}
                  onChangeText={setItems}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  placeholder="Rice, Dal, Chicken, Salad"
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
                    onPress={handleSave}
                    style={styles.button}
                  >
                    {editingItem ? 'Update' : 'Save'}
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
  menuCard: {
    marginBottom: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 18,
  },
  menuActions: {
    flexDirection: 'row',
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

export default MenuScreen;