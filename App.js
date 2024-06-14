import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button, View, StyleSheet, Text, ScrollView, RefreshControl } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import Products from './components/Products';
import Home from './components/Home';




function HomeScreen({ navigation }) {
  
  
  return (
      <Home />
  
  );
}

function NotificationsScreen({ navigation }) {
  return (

    <Products />

  );
}

const Drawer = createDrawerNavigator();
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgb(45, 255, 85)',
    background: 'rgb(0,0,0)',
    card: 'rgb(50,50,50)',
    text: 'rgb(255,255,255)',
    border: 'rgb(50,50,50)',
    notification: 'rgb(255,255,255)'
  },
};

export default function App() {


  return (
    <NavigationContainer theme={MyTheme}>
      <Drawer.Navigator screenOptions={{ headerTintColor: "#fff" }} initialRouteName="Home">
        <Drawer.Screen name="Inicio" component={HomeScreen} />
        <Drawer.Screen name="Produtos" component={NotificationsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
