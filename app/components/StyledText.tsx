import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface StyledTextProps extends TextProps {
  children: React.ReactNode;
}

const StyledText: React.FC<StyledTextProps> = ({ style, ...props }) => {
  const { uiFont } = useLanguage();
  const { colors } = useTheme();

  const fontStyle = uiFont === 'urdu' ? styles.urduFont : styles.defaultFont;
  const defaultTextColor = { color: colors.text };

  return <Text style={[fontStyle, defaultTextColor, style]} {...props} />;
};

const styles = StyleSheet.create({
  defaultFont: {
    // You can set a default font here if you want
  },
  urduFont: {
    fontFamily: 'urdu',
  },
});

export default StyledText;
