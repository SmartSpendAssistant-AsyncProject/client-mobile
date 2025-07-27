import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Home, TrendingUp, Plus, MessageCircle, User } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import ReportScreen from '../screens/ReportScreen';
import CreateScreen from '../screens/CreateScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Initialize bottom tab navigator
const Tab = createBottomTabNavigator();

//   Define navigation items configuration for consistent icon mapping
const navigationItems = [
  { id: 'Home', icon: Home, label: 'Home', component: HomeScreen },
  { id: 'Report', icon: TrendingUp, label: 'Analytics', component: ReportScreen },
  { id: 'Create', icon: Plus, label: 'Add', component: CreateScreen },
  { id: 'Chat', icon: MessageCircle, label: 'Messages', component: ChatScreen },
  { id: 'Profile', icon: User, label: 'Profile', component: ProfileScreen },
];

//   Custom tab bar button component with dynamic styling based on active state
const CustomTabBarButton = ({ children, onPress, routeName, isFocused }: any) => {
  //   Determine if current button is the special "Create" button
  const isCreateButton = routeName === 'Create';
  //   Only Create button gets special color when focused, all others follow normal pattern
  const isActive = isFocused;

  return (
    <TouchableOpacity
      style={{
        //   Apply conditional styling based on active state
        width: 48, // Fixed width for consistent circular shape
        height: 48, // Fixed height for consistent circular shape
        borderRadius: 24, // Half of width/height for perfect circle
        justifyContent: 'center', // Center icon vertically
        alignItems: 'center', // Center icon horizontally
        padding: 12, // 3 * 4 = 12px padding (equivalent to p-3)
        borderWidth: isActive ? 0 : 2, //   Remove border only for truly active states
        borderColor: '#D1D5DB', // Gray-300 equivalent for inactive buttons
        //   Use custom blue color (#3b667c) for Create when active, otherwise white for all
        backgroundColor: isActive ? '#3b667c' : '#FFFFFF',
        //   Add platform-specific shadows for depth
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          },
          android: {
            elevation: 2,
          },
        }),
      }}
      onPress={onPress}
      activeOpacity={0.8} // Opacity feedback on press
    >
      {children}
    </TouchableOpacity>
  );
};

//   Custom tab bar component that renders all navigation items
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View
      style={{
        //   Style container to match design specifications
        backgroundColor: '#FFFFFF', // White background
        borderTopWidth: 1, // Top border for separation
        borderTopColor: '#E5E7EB', // Gray-200 equivalent
        paddingHorizontal: 32, // 8 * 4 = 32px horizontal padding
        paddingVertical: 16, // 4 * 4 = 16px vertical padding
        flexDirection: 'row', // Arrange buttons horizontally
        justifyContent: 'space-between', // Even spacing between buttons
        alignItems: 'center', // Center buttons vertically
      }}>
      {/*   Map through navigation items to render each tab button */}
      {navigationItems.map((item, index) => {
        const route = state.routes[index];
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const Icon = item.icon;

        //   Handle tab press with navigation logic
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        //   Determine icon color and stroke width based on active state
        const isCreateButton = item.id === 'Create';
        const isActive = isFocused;
        //   Special color logic - Create button uses custom blue when active, others use slate
        const iconColor = isActive ? (isCreateButton ? '#FFFFFF' : '#FFFFFF') : '#6B7280';
        const strokeWidth = isActive ? 2 : 1.5; // Thicker stroke for active state

        return (
          <CustomTabBarButton
            key={item.id}
            onPress={onPress}
            routeName={route.name}
            isFocused={isFocused}>
            <Icon
              size={24} // 6 * 4 = 24px icon size (equivalent to w-6 h-6)
              color={iconColor}
              strokeWidth={strokeWidth}
            />
          </CustomTabBarButton>
        );
      })}
    </View>
  );
};

//   Main tab navigator component with custom tab bar and headers
export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        //   Configure header styling for all screens
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF', // White header background
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 1, // Add bottom border
          borderBottomColor: '#E5E7EB', // Gray-200 equivalent
        },
        headerTitleStyle: {
          fontSize: 18, // Appropriate title size
          fontWeight: '600', // Semi-bold font weight
          color: '#1F2937', // Gray-800 for good contrast
        },
        headerTitleAlign: 'left', // Align title to left for modern look
        headerLeftContainerStyle: {
          paddingLeft: 16, // Add left padding for title
        },
      }}>
      {/*   Dynamically create tab screens with individual header configurations */}
      {navigationItems.map((item) => (
        <Tab.Screen
          key={item.id}
          name={item.id}
          component={item.component}
          options={{
            //   Set appropriate header title for each screen
            headerTitle: item.label,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
