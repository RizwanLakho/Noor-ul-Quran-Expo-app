import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export const Container = ({ children }: { children: React.ReactNode }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      margin: 24,
      backgroundColor: colors.background,
    },
  });

  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
};
