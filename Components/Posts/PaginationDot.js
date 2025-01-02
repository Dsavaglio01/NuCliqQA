import React, { useMemo } from "react";
import { View, StyleSheet} from "react-native";
export const PaginationDot = React.memo(({ isActive }) => {
  const dotStyle = useMemo(
    () => (isActive ? [styles.paginationDot, {backgroundColor: "#fafafa"}] : [styles.paginationDot, {backgroundColor: "#121212"}]),
    [isActive]
  ); // Memoize the style calculation
  
  return <View style={dotStyle} />;
}, (prevProps, nextProps) => prevProps.isActive === nextProps.isActive);
const styles = StyleSheet.create({
    paginationDot: {
        width: 10,
        height: 10,
        margin: 2.5,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        borderWidth: 0.5,
        borderColor: "#fafafa"
    },
})