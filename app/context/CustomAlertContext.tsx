import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title: string;
  message: string;
  type: AlertType;
  buttons?: AlertButton[];
}

interface CustomAlertContextType {
  showAlert: (title: string, message: string, type?: AlertType, buttons?: AlertButton[]) => void;
  hideAlert: () => void;
}

const CustomAlertContext = createContext<CustomAlertContextType | undefined>(undefined);

export const CustomAlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: '',
    message: '',
    type: 'info',
    buttons: [],
  });

  const showAlert = (
    title: string,
    message: string,
    type: AlertType = 'info',
    buttons?: AlertButton[]
  ) => {
    setAlertConfig({
      title,
      message,
      type,
      buttons: buttons || [{ text: 'OK', onPress: () => hideAlert() }],
    });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const getIconConfig = () => {
    switch (alertConfig.type) {
      case 'success':
        return { name: 'checkmark-circle' as const, color: '#2EBBC3', bgColor: '#D1FAE5' };
      case 'error':
        return { name: 'alert-circle' as const, color: '#EF4444', bgColor: '#FEE2E2' };
      case 'warning':
        return { name: 'warning' as const, color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'info':
      default:
        return { name: 'information-circle' as const, color: '#3B82F6', bgColor: '#DBEAFE' };
    }
  };

  const getButtonStyle = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case 'cancel':
        return styles.cancelButton;
      case 'destructive':
        return styles.destructiveButton;
      default:
        return styles.defaultButton;
    }
  };

  const getButtonTextStyle = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case 'cancel':
        return styles.cancelButtonText;
      case 'destructive':
        return styles.destructiveButtonText;
      default:
        return styles.defaultButtonText;
    }
  };

  const iconConfig = getIconConfig();

  return (
    <CustomAlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}

      <Modal
        visible={alertVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideAlert}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Icon */}
            <View style={[styles.modalIconContainer, { backgroundColor: iconConfig.bgColor }]}>
              <Ionicons name={iconConfig.name} size={48} color={iconConfig.color} />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>{alertConfig.title}</Text>

            {/* Message */}
            <Text style={styles.modalMessage}>{alertConfig.message}</Text>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              {alertConfig.buttons?.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalButton,
                    getButtonStyle(button.style),
                  ]}
                  onPress={() => {
                    if (button.onPress) {
                      button.onPress();
                    }
                    hideAlert();
                  }}>
                  <Text style={getButtonTextStyle(button.style)}>{button.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </CustomAlertContext.Provider>
  );
};

export const useCustomAlert = () => {
  const context = useContext(CustomAlertContext);
  if (context === undefined) {
    throw new Error('useCustomAlert must be used within a CustomAlertProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'column',
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  defaultButton: {
    backgroundColor: '#2EBBC3',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  destructiveButton: {
    backgroundColor: '#EF4444',
  },
  defaultButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  destructiveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
