import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";

// Submodule & Interface bindings
import {
  FoodItem,
  loadOfflineItems,
  saveItemOffline,
  deleteItemOffline,
  fetchProductNameFromBarcode,
} from "../../../utils/storage";
import ScannerModal from "../../components/ScannerModal";
import ItemInputModal from "../../components/ItemInputModal";

export default function HomeScreen(): React.JSX.Element {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Visual layout presentation display states
  const [scannerVisible, setScannerVisible] = useState<boolean>(false);
  const [inputVisible, setInputVisible] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<boolean>(false);

  // Dynamic text state bindings for submission inputs
  const [scannedCode, setScannedCode] = useState<string>("");
  const [itemName, setItemName] = useState<string>("");
  const [daysToExpiry, setDaysToExpiry] = useState<string>("3");
  const [category, setCategory] = useState<string>("General");

  useEffect(() => {
    loadOfflineItems().then(setItems);
  }, []);

  const handleOpenScanner = async (): Promise<void> => {
    // Web Simulator Mode Fallback
    if (Platform.OS === "web") {
      const mockCode = "WEB-" + Math.floor(Math.random() * 10000);
      setScannedCode(mockCode);
      setItemName("Simulated Web Product");
      setCategory("Grocery");
      setDaysToExpiry("5");
      setInputVisible(true);
      return;
    }

    if (!permission?.granted) {
      const status = await requestPermission();
      if (!status.granted) {
        Alert.alert(
          "Permission Denied",
          "Camera access is required to scan codes.",
        );
        return;
      }
    }

    setScanned(false);
    setScannerVisible(true);
  };

  const handleBarcodeScanned = async ({
    data,
  }: BarcodeScanningResult): Promise<void> => {
    // Freeze scanner immediately to prevent multi-firing bugs
    setScanned(true);
    setScannerVisible(false);
    setScannedCode(data);

    // Step 1: Check for historical matches inside local inventory
    const existingProduct = items.find((item) => item.barcode === data);

    if (existingProduct) {
      setItemName(existingProduct.name);
      setCategory(existingProduct.category);
      setDaysToExpiry("3");
      setInputVisible(true);
    } else {
      // Step 2: Fallback onto API lookups with non-blocking loader placeholders
      setItemName("Loading product info...");
      setCategory("Grocery");
      setDaysToExpiry("3");
      setInputVisible(true);

      const result = await fetchProductNameFromBarcode(data);
      if (result.found) {
        setItemName(result.name);
        setCategory(result.category);
      } else {
        setItemName(""); // If unknown or completely offline, leave input open for manual writing
      }
    }
  };

  const handleSaveItem = async (): Promise<void> => {
    if (!itemName.trim() || itemName === "Loading product info...") {
      Alert.alert("Invalid Input", "Please supply a clean target food name.");
      return;
    }
    const freshList = await saveItemOffline(
      itemName,
      category,
      daysToExpiry,
      scannedCode,
    );
    setItems(freshList);
    setInputVisible(false);
    setScanned(false);
  };

  const handleDeleteItem = async (id: number): Promise<void> => {
    const freshList = await deleteItemOffline(id);
    setItems(freshList);
  };

  const getUrgencyStyles = (days: number) => {
    if (days <= 1)
      return { color: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-600" };
    if (days <= 3)
      return {
        color: "bg-amber-500",
        bg: "bg-amber-50",
        text: "text-amber-600",
      };
    return {
      color: "bg-emerald-500",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    };
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View className="flex-1 bg-slate-50 pt-12 px-4">
      {/* Brand Header Section */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Smart Autofill Storage
          </Text>
          <Text className="text-2xl font-black text-slate-800">
            B4it<Text className="text-amber-500">Blinks</Text>
          </Text>
        </View>
        <View className="bg-emerald-100 px-3 py-1.5 rounded-full">
          <Text className="text-emerald-700 text-xs font-bold">
            Disk Sync ✓
          </Text>
        </View>
      </View>

      {/* Live Search Input Bar */}
      <View className="flex-row items-center bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <MaterialIcons name="search" size={20} color="#94a3b8" />
        <TextInput
          placeholder="Search items..."
          className="ml-3 flex-1 text-slate-700 text-base"
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Main Tracked Inventory Scroll Layout List */}
      <View className="flex-1">
        <Text className="text-lg font-bold text-slate-800 mb-4">
          Inventory ({filteredItems.length})
        </Text>
        {filteredItems.length === 0 ? (
          <View className="flex-1 justify-center items-center opacity-40 px-8">
            <MaterialIcons name="storage" size={48} color="#64748b" />
            <Text className="text-slate-600 font-medium mt-2 text-center">
              No items found. Tap down below to scan a barcode.
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredItems.map((item) => {
              const status = getUrgencyStyles(item.days_left);
              return (
                <View
                  key={item.id}
                  className="bg-white p-4 rounded-2xl flex-row justify-between items-center shadow-sm border border-slate-100 mb-3"
                >
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className={`w-2 h-10 rounded-full ${status.color}`} />
                    <View className="ml-4 flex-1">
                      <Text
                        className="text-base font-bold text-slate-800"
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text
                        className="text-xs text-slate-400"
                        numberOfLines={1}
                      >
                        {item.category} • {item.barcode ? "Barcode" : "Manual"}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center space-x-2">
                    <View className={`px-3 py-1.5 rounded-xl ${status.bg}`}>
                      <Text className={`text-xs font-black ${status.text}`}>
                        {item.days_left <= 0
                          ? "Expired"
                          : `${item.days_left}d Left`}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => void handleDeleteItem(item.id)}
                      className="p-1 rounded-lg bg-slate-100 active:bg-rose-50"
                    >
                      <MaterialIcons
                        name="delete-forever"
                        size={22}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Bottom Floating Barcode Scanner Action Trigger */}
      <TouchableOpacity
        onPress={handleOpenScanner}
        className="absolute bottom-6 right-6 bg-slate-900 flex-row px-6 py-4 rounded-full shadow-lg"
      >
        <MaterialIcons name="qr-code" size={24} color="#fff" />
        <Text className="text-white font-bold text-base ml-2">Scan Item</Text>
      </TouchableOpacity>

      {/* Scanner Wrapper Component */}
      <ScannerModal
        visible={scannerVisible}
        scanned={scanned}
        onClose={() => setScannerVisible(false)}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {/* Manual Meta Override Form Overlay Spec Component */}
      <ItemInputModal
        visible={inputVisible}
        barcode={scannedCode}
        name={itemName}
        category={category}
        days={daysToExpiry}
        setName={setItemName}
        setCategory={setCategory}
        setDays={setDaysToExpiry}
        onClose={() => {
          setInputVisible(false);
          setScanned(false);
        }}
        onSave={handleSaveItem}
      />
    </View>
  );
}
