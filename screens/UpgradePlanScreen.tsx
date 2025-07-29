import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import WebView from 'react-native-webview';
import { RootStackNavigationProp, RootStackParamList } from 'types/navigation';

type UpgradePlanScreenProps = NativeStackScreenProps<RootStackParamList, 'UpgradePlan'>;

export default function UpgradePlanScreen({ route }: UpgradePlanScreenProps) {
  const navigation = useNavigation<RootStackNavigationProp>();

  const handleWebViewNavigationStateChange = (newNavState: {
    url?: string;
    title?: string;
    loading?: boolean;
    canGoBack?: boolean;
    canGoForward?: boolean;
  }) => {
    const { url, title, loading, canGoBack, canGoForward } = newNavState;

    // if (url?.includes('https://checkout-staging.xendit.co/web/')) {
    //   navigation.navigate('Profile');
    // }
    // TODO: Redirect to profile
    console.log(newNavState);
  };

  const { uri } = route.params;
  return <WebView source={{ uri }} onNavigationStateChange={handleWebViewNavigationStateChange} />;
}
