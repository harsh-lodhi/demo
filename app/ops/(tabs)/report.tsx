import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import ProductPicker from "app/admin/(aux)/ProductPicker";
import { ProductItemType } from "atoms/app";
import { useUser } from "hooks/useUserInfo";
import { useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { FAB, List, Text, TextInput, useTheme } from "react-native-paper";
import { db, serverTimestamp } from "utils/firebase";

const OpsReport = () => {
  const theme = useTheme();
  const [productPickerVisible, setProductPickerVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItemType>();
  const [loading, setLoading] = useState(false);
  const [user] = useUser();

  const [formData, setFormData] = useState({
    vendingMachine: "",
    tray: "",
    product: "",
    actualQuantity: "",
    systemQuantity: "",
  });

  const differnceQty = useMemo(() => {
    if (!formData.actualQuantity || !formData.systemQuantity) {
      return 0;
    }

    const an = Number(formData.actualQuantity);
    const sn = Number(formData.systemQuantity);

    if (isNaN(an) || isNaN(sn)) {
      return 0;
    }

    return an - sn;
  }, [formData.actualQuantity, formData.systemQuantity]);

  /**
   * Report issue / submit an issue with Vending machine inventory
   * select vending machine
   * select tray in vending machine
   * select product
   * enter product actually available
   * enter product available as per system
   */

  const handleSelectProduct = (product: ProductItemType) => {
    setSelectedProduct(product);
    setProductPickerVisible(false);
  };

  const handleSubmit = async () => {
    // Validation all fields are required

    if (!formData.vendingMachine) {
      Alert.alert(
        "Vending machine is required",
        "Please select a vending machine",
      );
      return;
    }

    if (!formData.tray) {
      Alert.alert(
        "Tray is required",
        "Please select a tray in the vending machine",
      );
      return;
    }

    if (!selectedProduct) {
      Alert.alert(
        "Product is required",
        "Please select a product in the vending machine",
      );
      return;
    }

    if (!formData.actualQuantity || isNaN(Number(formData.actualQuantity))) {
      Alert.alert(
        "Actual quantity is required",
        "Please enter the actual quantity of the product available",
      );
      return;
    }

    if (!formData.systemQuantity || isNaN(Number(formData.systemQuantity))) {
      Alert.alert(
        "System quantity is required",
        "Please enter the system quantity of the product available",
      );
      return;
    }

    setLoading(true);

    return db
      .collection("machine-inventory-mismatch-report")
      .add({
        vendingMachine: formData.vendingMachine,
        tray: formData.tray,
        product: selectedProduct.product_id,
        productName: selectedProduct.product_name,
        actualQuantity: Number(formData.actualQuantity),
        systemQuantity: Number(formData.systemQuantity),
        difference: differnceQty,
        createdAt: serverTimestamp(),
        createdBy: user?.uid,
      })
      .then(() => {
        Alert.alert(
          "Report submitted",
          "Thank you for submitting the report. We will look into it and get back to you.",
        );
        setFormData({
          vendingMachine: "",
          tray: "",
          product: "",
          actualQuantity: "",
          systemQuantity: "",
        });
        setSelectedProduct(undefined);
      })
      .catch((err: any) => {
        Alert.alert(
          "Something went wrong",
          err.message ??
            "Please try again later. If the issue persists, please contact support.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          gap: 16,
          padding: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <TextInput
            label="Vending Machine"
            mode="outlined"
            keyboardType="number-pad"
            value={formData.vendingMachine}
            onChangeText={(text) =>
              setFormData({ ...formData, vendingMachine: text })
            }
            style={{ flex: 2 }}
          />

          <TextInput
            label="Tray"
            mode="outlined"
            keyboardType="number-pad"
            value={formData.tray}
            onChangeText={(text) => setFormData({ ...formData, tray: text })}
            style={{ flex: 1 }}
          />
        </View>

        <List.Item
          title={selectedProduct?.product_name || "Select Product"}
          right={(props) => <Icon {...props} name="chevron-right" size={24} />}
          style={{
            borderWidth: 1,
            backgroundColor: theme.colors.background,
            borderRadius: 4,
          }}
          onPress={() => setProductPickerVisible(true)}
        />

        <View>
          <Text variant="labelMedium" style={{ padding: 4 }}>
            Qantity
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            <TextInput
              label="Actual"
              mode="outlined"
              keyboardType="number-pad"
              style={{ flex: 1 }}
              value={formData.actualQuantity}
              onChangeText={(text) =>
                setFormData({ ...formData, actualQuantity: text })
              }
            />
            <TextInput
              label="System"
              mode="outlined"
              keyboardType="number-pad"
              style={{ flex: 1 }}
              value={formData.systemQuantity}
              onChangeText={(text) =>
                setFormData({ ...formData, systemQuantity: text })
              }
            />
          </View>
          <Text
            variant="labelMedium"
            style={{ padding: 4, textAlign: "center", marginTop: 8 }}
          >
            Difference: {differnceQty}
          </Text>
        </View>
      </ScrollView>

      <FAB
        icon="check"
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
        }}
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
      />

      <ProductPicker
        visible={productPickerVisible}
        onDismiss={() => setProductPickerVisible(false)}
        onSelectProduct={handleSelectProduct}
      />
    </>
  );
};

export default OpsReport;
