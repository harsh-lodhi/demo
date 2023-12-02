import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { ProductItem } from "app/(aux)/picker/ProductQuantityDialog";
import { FC, memo, useCallback, useRef } from "react";
import { Alert, View, ViewStyle } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import {
  List,
  ProgressBar,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { formatPrice } from "utils/currency";

interface StepperInputProps {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
}

const StepperInput: FC<StepperInputProps> = ({
  value,
  onChange,
  min = 0,
  max,
}) => {
  const handleIncrement = useCallback(() => {
    const val = Number(value) + 1;

    if (max && val > max) return;
    onChange(val.toString());
  }, [max, onChange, value]);

  const handleDecrement = useCallback(() => {
    const val = Number(value) - 1;

    if (val < min) return;
    onChange(val.toString());
  }, [min, onChange, value]);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
      }}
    >
      <InputButton onPress={handleDecrement} icon="minus" />
      <View
        style={{
          backgroundColor: "#f1f1f1",
          width: 64,
          height: 48,
          paddingHorizontal: 8,
          paddingVertical: 4,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ textAlign: "center" }}>
          {value} / {max}
        </Text>
      </View>
      <InputButton onPress={handleIncrement} icon="plus" />
    </View>
  );
};

interface InputButtonProps {
  onPress: () => void;
  icon: string;
  style?: ViewStyle;
}

const InputButton: FC<InputButtonProps> = ({ onPress, icon, style }) => {
  return (
    <TouchableRipple
      style={[
        {
          height: 48,
          width: 48,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
      onPress={onPress}
    >
      <List.Icon icon={icon} />
    </TouchableRipple>
  );
};

interface RefillItemProps {
  item: ProductItem;
  onChange: (item: ProductItem) => void;
  onPressEdit: (item: ProductItem) => void;
}

const RefillItem: FC<RefillItemProps> = memo(
  ({ item, onChange, onPressEdit }) => {
    const theme = useTheme();
    const swipeableRef = useRef<Swipeable>(null);

    const handleQuantityChange = useCallback(
      (qty: string) => {
        onChange({ ...item, left_units: Number(qty) });
      },
      [item, onChange],
    );

    const handleEmpty = useCallback(() => {
      swipeableRef.current?.close();
      Alert.alert(
        "Empty",
        `Are you sure you want to empty ${item.product_name}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Empty",
            style: "destructive",
            onPress: () => {
              handleQuantityChange("0");
            },
          },
        ],
      );
    }, [handleQuantityChange, item.product_name]);

    const renderRightActions = useCallback(() => {
      return (
        <>
          <TouchableRipple
            style={{
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.onErrorContainer,
              paddingHorizontal: 16,
            }}
            onPress={handleEmpty}
          >
            <>
              <List.Icon icon="delete-empty" color={theme.colors.onError} />
              <Text
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  color: theme.colors.onError,
                }}
              >
                Empty
              </Text>
            </>
          </TouchableRipple>
        </>
      );
    }, [handleEmpty, theme.colors.onError, theme.colors.onErrorContainer]);

    return (
      <Swipeable
        useNativeAnimations
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        containerStyle={{ height: 158 }}
      >
        <View
          style={{
            backgroundColor: "#f1f1f1",
            paddingVertical: 4,
            paddingHorizontal: 8,
          }}
        >
          <View
            style={{
              padding: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 8,
              backgroundColor: "#ffffff",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, color: "#00000080" }}>
                {item.show_pos}
              </Text>
              <Text
                style={{ fontSize: 16, fontWeight: "bold" }}
                numberOfLines={1}
              >
                {item.product_name}
              </Text>
              <Text>{formatPrice(item.product_price)}</Text>

              <TouchableRipple
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: "flex-start",
                  marginTop: 16,
                  flexDirection: "row",
                  gap: 8,
                }}
                onPress={() => {
                  swipeableRef.current?.close();
                  onPressEdit(item);
                }}
              >
                <>
                  <Icon
                    name="pencil-box-outline"
                    size={24}
                    color={theme.colors.primary}
                  />
                </>
              </TouchableRipple>
            </View>

            <View style={{ gap: 16 }}>
              <StepperInput
                value={item.left_units.toString()}
                onChange={handleQuantityChange}
                min={0}
                max={item.total_units}
              />

              <TouchableRipple
                onPress={() => {
                  handleQuantityChange(item.total_units.toString());
                }}
              >
                <Text
                  variant="labelLarge"
                  style={{
                    textAlign: "center",
                    borderWidth: 1,
                    borderColor: "#ccc",
                    padding: 4,
                    borderRadius: 4,
                    paddingVertical: 8,
                  }}
                >
                  Full
                </Text>
              </TouchableRipple>
            </View>
          </View>

          <ProgressBar
            progress={Number(item.left_units) / item.total_units}
            color="green"
            style={{ height: 4, backgroundColor: "#ff000099" }}
          />
        </View>
      </Swipeable>
    );
  },
);

export default RefillItem;
