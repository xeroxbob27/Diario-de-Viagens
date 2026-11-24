import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons'; // Já vem embutido no Expo
import { PlacesProvider } from './src/context/PlacesContext';
import ListaScreen from './src/screens/ListaScreen';
import MapaScreen from './src/screens/MapaScreen';
import EstatisticasScreen from './src/screens/EstatisticasScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import DetalhesScreen from './src/screens/DetalhesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Placeholder = () => null;

function TabRoutes() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Lugares') iconName = 'list';
          else if (route.name === 'Mapa') iconName = 'map';
          else if (route.name === 'Estatísticas') iconName = 'pie-chart';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0056b3', 
        tabBarInactiveTintColor: 'gray',
        headerShown: true, 
      })}
    >
      <Tab.Screen name="Lugares" component={ListaScreen} />
      <Tab.Screen name="Mapa" component={MapaScreen} />
      <Tab.Screen name="Estatísticas" component={EstatisticasScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PlacesProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="HomeTabs" 
            component={TabRoutes} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Cadastro" 
            component={CadastroScreen} 
            options={{ title: 'Novo Lugar' }} 
          />
          <Stack.Screen 
            name="Detalhes" 
            component={DetalhesScreen} 
            options={{ title: 'Detalhes' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PlacesProvider>
  );
}