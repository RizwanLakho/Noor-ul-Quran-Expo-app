import { View, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import StyledText from './StyledText';

export const EditScreenInfo = ({ path }: { path: string }) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const title = t('editScreenInfoTitle');
  const description = t('editScreenInfoDescription');

  const styles = StyleSheet.create({
    getStartedContainer: {
      alignItems: 'center',
      marginHorizontal: 48,
    },
    getStartedText: {
      fontSize: 18,
      lineHeight: 24,
      textAlign: 'center',
      color: colors.text,
    },
    codeHighlightContainer: {
      borderRadius: 6,
      paddingHorizontal: 4,
      backgroundColor: colors.surface,
      marginVertical: 8,
      padding: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pathText: {
      color: colors.primary,
      fontSize: 14,
    },
  });

  return (
    <View>
      <View style={styles.getStartedContainer}>
        <StyledText style={styles.getStartedText}>{title}</StyledText>
        <View style={styles.codeHighlightContainer}>
          <StyledText style={styles.pathText}>{path}</StyledText>
        </View>
        <StyledText style={styles.getStartedText}>{description}</StyledText>
      </View>
    </View>
  );
};