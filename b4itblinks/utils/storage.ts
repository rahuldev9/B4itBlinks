import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FoodItem {
  id: number;
  barcode: string | null;
  name: string;
  category: string;
  expiry_timestamp: number;
  date_added: number;
  days_left: number;
}

export interface ExternalProductInfo {
  name: string;
  category: string;
  found: boolean;
}

const STORAGE_KEY = "b4itblinks_inventory_v3";

// Fetch product details from the Open Food Facts API
export const fetchProductNameFromBarcode = async (
  barcode: string,
): Promise<ExternalProductInfo> => {
  // 1. Try a universal barcode index first (Supports general retail items)
  try {
    const response = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
    );

    if (response.ok) {
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        // Extract category tree or fall back to General
        const category = item.category
          ? item.category.split(" > ")[0]
          : "General";

        return {
          name: item.title || "",
          category: category,
          found: true,
        };
      }
    }
  } catch (error) {
    console.warn(
      "Universal registry lookup failed, trying fallback route...",
      error,
    );
  }

  // 2. Fallback Route: Try Open Food Facts (If it happens to be a food item, this database is richer)
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,categories_tags`,
    );
    const data = await response.json();

    if (data.status === 1 && data.product) {
      const name = data.product.product_name || "";
      let category = "Grocery";
      if (
        data.product.categories_tags &&
        data.product.categories_tags.length > 0
      ) {
        const rawCategory = data.product.categories_tags[0].replace("en:", "");
        category = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
      }
      return { name, category, found: true };
    }
  } catch (error) {
    console.warn(
      "All online networks failed or device is entirely offline:",
      error,
    );
  }

  // 3. Absolute Fallback: Offline handling profile configuration
  return { name: "", category: "General", found: false };
};

// Load saved local inventory sorted by earliest expiry date
export const loadOfflineItems = async (): Promise<FoodItem[]> => {
  try {
    const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
    if (!storedItems) return [];

    const parsedItems = JSON.parse(storedItems) as Omit<
      FoodItem,
      "days_left"
    >[];
    const nowInSeconds = Math.floor(Date.now() / 1000);

    return parsedItems
      .map((item) => ({
        ...item,
        days_left: Math.floor((item.expiry_timestamp - nowInSeconds) / 86400),
      }))
      .sort((a, b) => a.expiry_timestamp - b.expiry_timestamp);
  } catch (error) {
    console.warn("Unable to load store dataset:", error);
    return [];
  }
};

// Write a new food tracking object onto the device disk space
export const saveItemOffline = async (
  name: string,
  category: string,
  daysToExpiry: string,
  barcode: string | null,
): Promise<FoodItem[]> => {
  const targetDays = parseInt(daysToExpiry, 10) || 1;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expiryTimestamp = nowInSeconds + targetDays * 86400;

  const nextItem: Omit<FoodItem, "days_left"> = {
    id: Date.now(),
    barcode: barcode || null,
    name: name.trim(),
    category: category.trim() || "General",
    expiry_timestamp: expiryTimestamp,
    date_added: nowInSeconds,
  };

  const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
  const existingItems = storedItems ? JSON.parse(storedItems) : [];
  const updatedItems = [nextItem, ...existingItems];

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
  return loadOfflineItems();
};

// Delete a food item by ID
export const deleteItemOffline = async (id: number): Promise<FoodItem[]> => {
  const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
  if (!storedItems) return [];

  const existingItems = JSON.parse(storedItems) as FoodItem[];
  const updatedItems = existingItems.filter((item) => item.id !== id);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
  return loadOfflineItems();
};
