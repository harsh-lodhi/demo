export const formatPrice = (price: number) => {
  return price.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
};
