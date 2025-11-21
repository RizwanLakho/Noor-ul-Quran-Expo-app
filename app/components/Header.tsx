import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <View
      style={{
        height: 50,
        backgroundColor: colors.background,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        paddingTop: 10,
      }}>
      <TouchableOpacity onPress={() => navigation.navigate('UserSettings')}>
        <FontAwesome6 name="user-circle" size={24} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => console.log('Right')}>
        <MaterialIcons name="display-settings" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}
