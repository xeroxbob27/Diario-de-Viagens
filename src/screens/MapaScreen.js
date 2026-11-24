import React, { useContext, useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Keyboard,
    Platform,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { PlacesContext } from '../context/PlacesContext';
import { useLocation } from '../hooks/useLocation';

export default function MapaScreen({ navigation }) {
    const { places } = useContext(PlacesContext);
    const { location, errorMsg } = useLocation();
    const mapRef = useRef(null);
    const requestIdRef = useRef(0);
    const [termoBusca, setTermoBusca] = useState('');
    const [buscandoLocal, setBuscandoLocal] = useState(false);
    const [pontoNovo, setPontoNovo] = useState(null);
    const [enderecoNovo, setEnderecoNovo] = useState(null);
    const [buscandoEndereco, setBuscandoEndereco] = useState(false);

    const selecionarPontoNoMapa = async (latitude, longitude, nomeSugerido = '') => {
        const reqId = ++requestIdRef.current;
        setPontoNovo({ latitude, longitude });
        setBuscandoEndereco(true);

        try {
            const resultado = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (reqId !== requestIdRef.current) return;

            if (resultado && resultado.length > 0) {
                const item = resultado[0];
                const rua = item.street || item.name || item.district || '';
                const numero =
                    item.streetNumber || (/^\d+$/.test(item.name || '') ? item.name : 'S/N');
                const cidade = item.city || item.subregion || '';
                const estado = item.region || '';

                setEnderecoNovo({
                    nome: nomeSugerido,
                    rua,
                    numero,
                    cidade,
                    estado,
                    resumo: [nomeSugerido, rua, numero, cidade, estado].filter(Boolean).join(', '),
                });
            } else {
                setEnderecoNovo({
                    nome: nomeSugerido,
                    rua: '',
                    numero: '',
                    cidade: '',
                    estado: '',
                    resumo: nomeSugerido || 'Ponto selecionado no mapa',
                });
            }
        } catch (error) {
            if (reqId === requestIdRef.current) {
                setEnderecoNovo({
                    nome: nomeSugerido,
                    rua: '',
                    numero: '',
                    cidade: '',
                    estado: '',
                    resumo: nomeSugerido || 'Coordenada selecionada no mapa',
                });
            }
        } finally {
            if (reqId === requestIdRef.current) {
                setBuscandoEndereco(false);
            }
        }
    };

    const handleBuscarLocal = async () => {
        const consulta = termoBusca.trim();
        if (!consulta) return;

        Keyboard.dismiss();
        setBuscandoLocal(true);

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permissão necessária',
                    'Habilite a permissão de localização para buscar locais no mapa.'
                );
                return;
            }

            const resultados = await Location.geocodeAsync(consulta);
            if (!resultados || resultados.length === 0) {
                Alert.alert('Local não encontrado', 'Não encontramos resultados para essa busca.');
                return;
            }

            const { latitude, longitude } = resultados[0];
            mapRef.current?.animateToRegion(
                {
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                600
            );

            await selecionarPontoNoMapa(latitude, longitude, consulta);
        } catch (error) {
            Alert.alert('Erro na busca', 'Não foi possível buscar o local no momento.');
        } finally {
            setBuscandoLocal(false);
        }
    };

    const handleRegistrarNovaViagem = () => {
        if (!pontoNovo) return;

        navigation.navigate('Cadastro', {
            localInicial: {
                nome: enderecoNovo?.nome || '',
                rua: enderecoNovo?.rua || '',
                numero: enderecoNovo?.numero || '',
                cidade: enderecoNovo?.cidade || '',
                estado: enderecoNovo?.estado || '',
                latitude: pontoNovo.latitude,
                longitude: pontoNovo.longitude,
            },
        });

        setPontoNovo(null);
        setEnderecoNovo(null);
    };

    if (errorMsg) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
        );
    }

    if (!location) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0056b3" />
                <Text style={styles.loadingText}>A obter localização atual...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar local, cidade ou endereço..."
                    value={termoBusca}
                    onChangeText={setTermoBusca}
                    returnKeyType="search"
                    onSubmitEditing={handleBuscarLocal}
                />
                {termoBusca.length > 0 && (
                    <TouchableOpacity onPress={() => setTermoBusca('')} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={18} color="#999" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleBuscarLocal}
                    disabled={buscandoLocal}
                >
                    {buscandoLocal ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.searchButtonText}>Buscar</Text>
                    )}
                </TouchableOpacity>
            </View>

            <MapView
                ref={mapRef}
                style={styles.map}

                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation={true} 
                onPress={(event) => {
                    const { latitude, longitude } = event.nativeEvent.coordinate;
                    selecionarPontoNoMapa(latitude, longitude);
                }}
            >
                {places.map((place) => (
                    <Marker
                        key={place.id}
                        coordinate={{
                            latitude: place.latitude,
                            longitude: place.longitude
                        }}
                        title={place.nome}
                        description={place.cidade}
                        pinColor={place.status === 'Visitado' ? 'green' : 'orange'}
                        onCalloutPress={() => navigation.navigate('Detalhes', { id: place.id })}
                    >
                        <Callout tooltip={false}>
                            <View style={styles.calloutContainer}>
                                <Text style={styles.calloutTitle}>{place.nome}</Text>
                                <Text style={styles.calloutSubtitle}>Tocar para ver detalhes</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}

                {pontoNovo && (
                    <Marker
                        coordinate={pontoNovo}
                        pinColor="#0056b3"
                        draggable
                        onDragEnd={(event) => {
                            const { latitude, longitude } = event.nativeEvent.coordinate;
                            selecionarPontoNoMapa(latitude, longitude);
                        }}
                    />
                )}
            </MapView>

            {pontoNovo && (
                <View style={styles.newTripCard}>
                    <View style={styles.newTripHeader}>
                        <Ionicons name="add-location-outline" size={20} color="#0056b3" />
                        <Text style={styles.newTripTitle} numberOfLines={2}>
                            {buscandoEndereco
                                ? 'Buscando endereço do ponto...'
                                : enderecoNovo?.resumo || 'Ponto selecionado no mapa'}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                setPontoNovo(null);
                                setEnderecoNovo(null);
                            }}
                        >
                            <Ionicons name="close" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegistrarNovaViagem}
                        disabled={buscandoEndereco}
                    >
                        <Ionicons name="add-circle-outline" size={20} color="#fff" />
                        <Text style={styles.registerButtonText}>Registrar nova viagem aqui</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff' 
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        padding: 20
    },
    errorText: {
        fontSize: 16,
        color: '#D84315',
        textAlign: 'center'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555'
    },
    calloutContainer: {
        padding: 5,
        alignItems: 'center'
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 2
    },
    calloutSubtitle: {
        fontSize: 12,
        color: '#0056b3'
    },
    searchBar: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 54 : 14,
        left: 14,
        right: 14,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingLeft: 10,
        paddingRight: 6,
        paddingVertical: 6,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    searchIcon: {
        marginRight: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        paddingVertical: 6,
    },
    clearButton: {
        paddingHorizontal: 6,
    },
    searchButton: {
        backgroundColor: '#0056b3',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginLeft: 4,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
    newTripCard: {
        position: 'absolute',
        bottom: 20,
        left: 14,
        right: 14,
        zIndex: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    newTripHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    newTripTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginHorizontal: 8,
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0056b3',
        borderRadius: 8,
        paddingVertical: 12,
    },
    registerButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 8,
    },
});