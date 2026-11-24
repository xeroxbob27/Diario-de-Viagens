import React, { createContext, useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@diarioviagens:places';

export const PlacesContext = createContext();
export const PlacesProvider = ({ children }) => {
  const [places, setPlaces] = useState([]);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    const carregarViagens = async () => {
      try {
        const jsonSalvo = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonSalvo !== null) {
          const dadosConvertidos = JSON.parse(jsonSalvo);
          if (Array.isArray(dadosConvertidos)) {
            setPlaces(dadosConvertidos);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar viagens salvas:', error);
      } finally {
        setHidratado(true);
      }
    };

    carregarViagens();
  }, []);

  useEffect(() => {
    if (!hidratado) return;

    const salvarViagens = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(places));
      } catch (error) {
        console.error('Erro ao guardar viagens no dispositivo:', error);
      }
    };

    salvarViagens();
  }, [places, hidratado]);

  const addPlace = (newPlace) => {
    setPlaces((prevPlaces) => [...prevPlaces, { ...newPlace, id: Date.now().toString() }]);
  };

  const editPlace = (id, updatedPlace) => {
    setPlaces((prevPlaces) =>
      prevPlaces.map((place) => (place.id === id ? { ...place, ...updatedPlace } : place))
    );
  };

  const deletePlace = (id) => {
    setPlaces((prevPlaces) => prevPlaces.filter((place) => place.id !== id));
  };

  const toggleStatus = (id) => {
    setPlaces((prevPlaces) =>
      prevPlaces.map((place) => {
        if (place.id === id) {
          const newStatus = place.status === 'Quero visitar' ? 'Visitado' : 'Quero visitar';
          return { ...place, status: newStatus };
        }
        return place;
      })
    );
  };

  if (!hidratado) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0056b3" />
      </View>
    );
  }

  return (
    <PlacesContext.Provider value={{ places, addPlace, editPlace, deletePlace, toggleStatus }}>
      {children}
    </PlacesContext.Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
});