import React from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface ItemInputModalProps {
  visible: boolean;
  barcode: string;
  name: string;
  category: string;
  days: string;
  setName: (text: string) => void;
  setCategory: (text: string) => void;
  setDays: (text: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function ItemInputModal({
  visible,
  barcode,
  name,
  category,
  days,
  setName,
  setCategory,
  setDays,
  onClose,
  onSave,
}: ItemInputModalProps) {
  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 space-y-4 shadow-xl">
          <View className="flex-row justify-between items-center border-b border-slate-100 pb-3">
            <Text className="text-xl font-black text-slate-800">
              Add Item Entry
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text className="text-xs text-slate-400 font-bold tracking-wide uppercase">
            Barcode Key: {barcode || "Manual Input"}
          </Text>

          <View>
            <Text className="text-slate-600 font-semibold mb-1 text-sm">
              Item Name
            </Text>
            <TextInput
              placeholder="e.g. Organic Almond Milk"
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-base"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="text-slate-600 font-semibold mb-1 text-sm">
                Category
              </Text>
              <TextInput
                placeholder="e.g. Dairy, Produce"
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-base"
                value={category}
                onChangeText={setCategory}
              />
            </View>
            <View className="flex-1">
              <Text className="text-slate-600 font-semibold mb-1 text-sm">
                Days Until Expiry
              </Text>
              <TextInput
                placeholder="3"
                keyboardType="numeric"
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-base"
                value={days}
                onChangeText={setDays}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={onSave}
            className="bg-amber-500 w-100 py-4 rounded-xl items-center mt-4 shadow-md"
          >
            <Text className="text-white font-bold text-base">
              Write to Device Store
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
