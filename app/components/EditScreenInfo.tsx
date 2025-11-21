import { View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import StyledText from './StyledText';

export const EditScreenInfo = ({ path }: { path: string }) => {
  const { t } = useLanguage();
  const title = t('editScreenInfoTitle');
  const description = t('editScreenInfoDescription');

  return (
    <View>
      <View className={styles.getStartedContainer}>
        <StyledText className={styles.getStartedText}>{title}</StyledText>
        <View className={styles.codeHighlightContainer + styles.homeScreenFilename}>
          <StyledText>{path}</StyledText>
        </View>
        <StyledText className={styles.getStartedText}>{description}</StyledText>
      </View>
    </View>
  );
};

const styles = {
  codeHighlightContainer: `rounded-md px-1`,
  getStartedContainer: `items-center mx-12`,
  getStartedText: `text-lg leading-6 text-center`,
  helpContainer: `items-center mx-5 mt-4`,
  helpLink: `py-4`,
  helpLinkText: `text-center`,
  homeScreenFilename: `my-2`,
};