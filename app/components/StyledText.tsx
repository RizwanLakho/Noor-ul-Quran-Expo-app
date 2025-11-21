import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

interface StyledTextProps extends TextProps {
  children: React.ReactNode;
}

const StyledText: React.FC<StyledTextProps> = ({ style, ...props }) => {
  const { uiFont } = useLanguage();

  const fontStyle = uiFont === 'urdu' ? styles.urduFont : styles.defaultFont;

  return <Text style={[fontStyle, style]} {...props} />;
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
