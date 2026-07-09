import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { CameraView, BarcodeScanningResult } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";

interface ScannerModalProps {
  visible: boolean;
  scanned: boolean;
  onClose: () => void;
  onBarcodeScanned: (result: BarcodeScanningResult) => void;
}

export default function ScannerModal({
  visible,
  scanned,
  onClose,
  onBarcodeScanned,
}: ScannerModalProps) {
  return (
    <Modal animationType="fade" transparent={false} visible={visible}>
      <View className="flex-1 bg-black justify-between pb-10">
        <View className="pt-14 px-6 flex-row justify-between items-center z-10">
          <Text className="text-white text-xl font-bold">Point at Barcode</Text>
          <TouchableOpacity
            onPress={onClose}
            className="bg-white/20 p-2 rounded-full"
          >
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="absolute inset-0 justify-center items-center">
          {Platform.OS !== "web" && (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
              }}
            />
          )}
          <View className="w-80 h-48 border-2 border-amber-500 rounded-3xl bg-transparent" />
          <Text className="text-white bg-black/60 px-4 py-2 rounded-full text-xs mt-6 tracking-wide">
            Processing real-time feed...
          </Text>
        </View>
      </View>
    </Modal>
  );
}
