import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  StatusBar,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const REGIAO_PADRAO = {
  latitude: -20.5386,
  longitude: -47.4008,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapaSeletorModal({
  visible,
  onClose,
  onConfirm,
  coordenadaInicial,
}) {
  const mapRef = useRef(null);
  const requestIdRef = useRef(0);

  const [regiaoInicial, setRegiaoInicial] = useState(REGIAO_PADRAO);
  const [carregandoMapa, setCarregandoMapa] = useState(true);
  const [pontoSelecionado, setPontoSelecionado] = useState(null);
  const [enderecoExtraido, setEnderecoExtraido] = useState(null);
  const [buscandoEndereco, setBuscandoEndereco] = useState(false);

  const [termoBusca, setTermoBusca] = useState('');
  const [buscandoTermo, setBuscandoTermo] = useState(false);

  
  useEffect(() => {
    if (!visible) return;

    let ativo = true;

    const inicializarMapa = async () => {
      setCarregandoMapa(true);

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (coordenadaInicial) {
          if (!ativo) return;
          setRegiaoInicial({
            latitude: coordenadaInicial.latitude,
            longitude: coordenadaInicial.longitude,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          });
          selecionarCoordenada(coordenadaInicial.latitude, coordenadaInicial.longitude);
          return;
        }

        if (status === 'granted') {
          const posicao = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          if (!ativo) return;
          setRegiaoInicial({
            latitude: posicao.coords.latitude,
            longitude: posicao.coords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          });
        }
      } catch (error) {
      } finally {
        if (ativo) setCarregandoMapa(false);
      }
    };

    inicializarMapa();

    return () => {
      ativo = false;
    };
  }, [visible]);

  const selecionarCoordenada = async (latitude, longitude) => {
    const currentRequestId = ++requestIdRef.current;
    setPontoSelecionado({ latitude, longitude });
    setBuscandoEndereco(true);

    try {
      const resultado = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (currentRequestId !== requestIdRef.current) return;

      if (resultado && resultado.length > 0) {
        const item = resultado[0];
        const rua = item.street || item.name || item.district || '';
        const numero =
          item.streetNumber || (/^\d+$/.test(item.name || '') ? item.name : 'S/N');
        const cidade = item.city || item.subregion || '';
        const estado = item.region || '';

        setEnderecoExtraido({
          rua,
          numero,
          cidade,
          estado,
          resumo: [rua, numero, cidade, estado].filter(Boolean).join(', '),
        });
      } else {
        setEnderecoExtraido({
          rua: '',
          numero: '',
          cidade: '',
          estado: '',
          resumo: 'Coordenada marcada (complete os campos manualmente se necessário).',
        });
      }
    } catch (error) {
      if (currentRequestId === requestIdRef.current) {
        setEnderecoExtraido({
          rua: '',
          numero: '',
          cidade: '',
          estado: '',
          resumo: 'Coordenada selecionada. Não foi possível obter o nome da rua.',
        });
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setBuscandoEndereco(false);
      }
    }
  };

  const handleBuscarNoMapa = async () => {
    if (!termoBusca.trim()) return;

    Keyboard.dismiss();
    setBuscandoTermo(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Habilite a permissão de localização para pesquisar endereços.');
        return;
      }

      const resultados = await Location.geocodeAsync(termoBusca.trim());

      if (resultados.length === 0) {
        Alert.alert('Não encontrado', 'Nenhum local encontrado para essa pesquisa.');
        return;
      }

      const { latitude, longitude } = resultados[0];

      mapRef.current?.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.006,
          longitudeDelta: 0.006,
        },
        600
      );

      await selecionarCoordenada(latitude, longitude);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível pesquisar o local informado.');
    } finally {
      setBuscandoTermo(false);
    }
  };

  const handleIrParaMinhaLocalizacao = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Ative o GPS para usar sua localização atual.');
        return;
      }

      const posicao = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = posicao.coords;
      mapRef.current?.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.006,
          longitudeDelta: 0.006,
        },
        600
      );
      selecionarCoordenada(latitude, longitude);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter sua posição atual.');
    }
  };

  const handleConfirmar = () => {
    if (!pontoSelecionado) return;

    onConfirm({
      latitude: pontoSelecionado.latitude,
      longitude: pontoSelecionado.longitude,
      rua: enderecoExtraido?.rua || '',
      numero: enderecoExtraido?.numero || '',
      cidade: enderecoExtraido?.cidade || '',
      estado: enderecoExtraido?.estado || '',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Cabeçalho do Modal */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escolher Local no Mapa</Text>
          <TouchableOpacity onPress={handleIrParaMinhaLocalizacao} style={styles.gpsButton}>
            <Ionicons name="locate" size={22} color="#0056b3" />
          </TouchableOpacity>
        </View>

        {/* Barra de Pesquisa Rápida */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar local, rua ou cidade..."
            value={termoBusca}
            onChangeText={setTermoBusca}
            returnKeyType="search"
            onSubmitEditing={handleBuscarNoMapa}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleBuscarNoMapa}
            disabled={buscandoTermo}
          >
            {buscandoTermo ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="search" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Área do Mapa */}
        {carregandoMapa ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0056b3" />
            <Text style={styles.loadingText}>Carregando mapa...</Text>
          </View>
        ) : (
          <View style={styles.mapWrapper}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={regiaoInicial}
              showsUserLocation={true}
              onPress={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                selecionarCoordenada(latitude, longitude);
              }}
            >
              {pontoSelecionado && (
                <Marker
                  coordinate={pontoSelecionado}
                  draggable
                  onDragEnd={(e) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    selecionarCoordenada(latitude, longitude);
                  }}
                />
              )}
            </MapView>


            {!pontoSelecionado && (
              <View style={styles.hintBanner} pointerEvents="none">
                <Text style={styles.hintText}>
                  Toque no mapa ou pesquise acima para marcar o local
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Rodapé com Prévia do Endereço e Confirmação */}
        <View style={styles.footer}>
          {buscandoEndereco ? (
            <View style={styles.previewRow}>
              <ActivityIndicator size="small" color="#0056b3" />
              <Text style={styles.previewText}>Identificando endereço...</Text>
            </View>
          ) : (
            <Text style={styles.previewText} numberOfLines={2}>
              {enderecoExtraido?.resumo || 'Nenhum ponto selecionado no mapa.'}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!pontoSelecionado || buscandoEndereco) && styles.confirmButtonDisabled,
            ]}
            disabled={!pontoSelecionado || buscandoEndereco}
            onPress={handleConfirmar}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.confirmButtonText}>Usar este local</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  closeButton: {
    padding: 6,
  },
  gpsButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#0056b3',
    borderRadius: 8,
    width: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapWrapper: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  hintBanner: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
    marginLeft: 6,
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#0056b3',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9fbce0',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
});