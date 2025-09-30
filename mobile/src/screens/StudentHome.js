import React, { useEffect, useState } from 'react';
import { menuAPI } from '../api/client';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';

export default function StudentHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await menuAPI.getProducts({ available_only: true, limit: 20 });
        if (isMounted && res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setItems(res.data);
        } else {
          // Fallback to legacy menu items endpoint if products are empty
          const res2 = await menuAPI.getItems({ available_only: true, limit: 20 });
          if (isMounted && res2?.success) setItems(res2.data.items || []);
        }
      } catch (e) {
        try {
          const res2 = await menuAPI.getItems({ available_only: true, limit: 20 });
          if (isMounted && res2?.success) setItems(res2.data.items || []);
        } catch (_) {}
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Menu item"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.categoryButton}>
          <Text style={styles.categoryButtonText}>{selectedCategory}</Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text>Loading...</Text>
      ) : items.length === 0 ? (
        <Text>No items available</Text>
      ) : (
        items.map((item) => (
          <View key={item.id || item.product_id} style={styles.menuItemCard}>
            <View style={styles.menuItemHeader}>
              <Text style={styles.menuItemName}>{item.name || item.product_name}</Text>
              <Text style={styles.menuItemPrice}>₱{Number(item.price).toFixed(2)}</Text>
            </View>
            {!!(item.category || item.category_name) && (
              <View style={styles.menuItemCategory}>
                <Text style={styles.categoryTag}>{item.category || item.category_name}</Text>
              </View>
            )}
            {item.description ? (
              <Text style={styles.menuItemDescription}>{item.description}</Text>
            ) : null}
            <TouchableOpacity style={styles.availabilityButton}>
              <Text style={styles.availabilityButtonText}>
                {item.is_available ? 'Available at the Canteen' : 'Currently Unavailable'}
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
  },
  menuItemCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  menuItemCategory: {
    marginBottom: 10,
  },
  categoryTag: {
    backgroundColor: '#87CEEB',
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  availabilityButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  availabilityButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});
