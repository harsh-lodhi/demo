import {
  Button,
  List,
  ProgressBar,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { ProductItem } from "../../../../(aux)/picker/ProductQuantityDialog";
import React, { FC, useCallback, useMemo, useRef } from "react";
import { Alert, View } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { formatPrice } from "../../../../../utils/currency";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

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
  }, [value]);

  const handleDecrement = useCallback(() => {
    const val = Number(value) - 1;

    if (val < min) return;
    onChange(val.toString());
  }, [value]);

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <InputButton onPress={handleDecrement} icon="minus" />
      <View
        style={{
          backgroundColor: "#f1f1f1",
          width: 64,
          height: 32,
          paddingHorizontal: 8,
          paddingVertical: 4,
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
}

const InputButton: FC<InputButtonProps> = ({ onPress, icon }) => {
  return (
    <TouchableRipple
      style={{
        height: 32,
        width: 32,
        alignItems: "center",
        justifyContent: "center",
      }}
      onPress={onPress}
    >
      <List.Icon icon={icon} />
    </TouchableRipple>
  );
};

interface RefillItemProps {
  item: ProductItem;
  onChange: (item: ProductItem) => void;
}

const RefillItem: FC<RefillItemProps> = React.memo(({ item, onChange }) => {
  const theme = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  const handleQuantityChange = useCallback((qty: string) => {
    onChange({
      ...item,
      left_units: Number(qty),
    });
  }, []);

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
      ]
    );
  }, [handleQuantityChange]);

  return (
    <Swipeable
      useNativeAnimations
      ref={swipeableRef}
      renderRightActions={() => {
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
      }}
    >
      <View
        style={{
          backgroundColor: "#f1f1f1",
          paddingVertical: 4,
        }}
      >
        <View
          style={{
            backgroundColor: "#ffffff",
          }}
        >
          <View
            style={{
              padding: 16,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                }}
              >
                {item.show_pos}
              </Text>
              <Text>{item.product_name}</Text>
              <Text>{formatPrice(item.product_price)}</Text>
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
                  }}
                >
                  Full
                </Text>
              </TouchableRipple>
            </View>
          </View>

          <TouchableRipple
            style={{
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "flex-start",
              marginHorizontal: 16,
              marginBottom: 16,
              flexDirection: "row",
              gap: 8,
            }}
            onPress={() => {
              swipeableRef.current?.close();
            }}
          >
            <>
              {/* <Text
                style={{
                  paddingVertical: 4,
                  color: theme.colors.primary,
                }}
              >
                Change
              </Text> */}
              <Icon
                name="pencil-box-outline"
                size={24}
                color={theme.colors.primary}
              />
            </>
          </TouchableRipple>
        </View>

        <ProgressBar
          progress={Number(item.left_units) / item.total_units}
          color="green"
          style={{ height: 4, backgroundColor: "#ff000099" }}
        />
      </View>
    </Swipeable>
  );
});

export default RefillItem;
