import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { PlacesContext } from '../context/PlacesContext';
import MapaSeletorModal from '../components/MapaSeletorModal';

export default function CadastroScreen({ navigation, route }) {
  const { addPlace, editPlace } = useContext(PlacesContext);
  const placeToEdit = route?.params?.placeToEdit || null;
  const isEditing = Boolean(placeToEdit);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [status, setStatus] = useState('Quero visitar'); // Valor padrão
  const [fotoUri, setFotoUri] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!placeToEdit) return;

    setNome(placeToEdit.nome || '');
    setDescricao(placeToEdit.descricao || '');
    setRua(placeToEdit.rua || '');
    setNumero(placeToEdit.numero || '');
    setCidade(placeToEdit.cidade || '');
    setEstado(placeToEdit.estado || '');
    setStatus(placeToEdit.status || 'Quero visitar');
    setFotoUri(placeToEdit.foto || null);
  }, [placeToEdit]);

  useEffect(() => {
    const localInicial = route?.params?.localInicial;
    if (!localInicial) return;

    if (localInicial.nome) setNome(localInicial.nome);
    if (localInicial.rua) setRua(localInicial.rua);
    if (localInicial.numero) setNumero(localInicial.numero);
    if (localInicial.cidade) setCidade(localInicial.cidade);
    if (localInicial.estado) setEstado(localInicial.estado);
  }, [route?.params?.localInicial]);

  const [mapaVisivel, setMapaVisivel] = useState(false);
  const [coordenadasMapa, setCoordenadasMapa] = useState(null);

  const handleConfirmarMapa = (dadosLocal) => {
    setCoordenadasMapa({
      latitude: dadosLocal.latitude,
      longitude: dadosLocal.longitude,
    });
    if (dadosLocal.rua) setRua(dadosLocal.rua);
    if (dadosLocal.numero) setNumero(dadosLocal.numero);
    if (dadosLocal.cidade) setCidade(dadosLocal.cidade);
    if (dadosLocal.estado) setEstado(dadosLocal.estado);
    setMapaVisivel(false);
  };

  const tirarFoto = async () => {
    const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPerm = await MediaLibrary.requestPermissionsAsync();

    if (cameraPerm.status !== 'granted' || mediaPerm.status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à câmara e à galeria para guardar a foto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      try {
        await MediaLibrary.createAssetAsync(uri);
        setFotoUri(uri);
        Alert.alert('Sucesso', 'Foto guardada na galeria do dispositivo!');
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível guardar a foto na galeria.');
      }
    }
  };

  const escolherFoto = async () => {
    const galleryPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (galleryPerm.status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à galeria para escolher uma foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setFotoUri(result.assets[0].uri);
    }
  };

  const handleSalvar = async () => {
    if (!nome || !rua || !numero || !cidade || !estado) {
      Alert.alert('Atenção', 'Preencha todos os campos de endereço e o nome do local.');
      return;
    }

    setLoading(true);

    const enderecoCompleto = `${rua}, ${numero}, ${cidade}, ${estado}`;

    try {
      let latitude;
      let longitude;

      if (coordenadasMapa) {
        latitude = coordenadasMapa.latitude;
        longitude = coordenadasMapa.longitude;
      } else {
        await Location.requestForegroundPermissionsAsync();
        const geocode = await Location.geocodeAsync(enderecoCompleto);

        if (geocode.length === 0) {
          Alert.alert(
            'Endereço não encontrado',
            'Não foi possível encontrar as coordenadas para este endereço. Verifique os dados digitados ou selecione pelo mapa.'
          );
          setLoading(false);
          return;
        }

        latitude = geocode[0].latitude;
        longitude = geocode[0].longitude;
      }

      const dadosLugar = {
        nome,
        descricao,
        rua,
        numero,
        cidade,
        estado,
        status,
        foto: fotoUri,
        latitude,
        longitude,
      };

      if (isEditing) {
        editPlace(placeToEdit.id, dadosLugar);
        Alert.alert('Sucesso', 'Lugar atualizado no seu diário!');
      } else {
        addPlace(dadosLugar);
        Alert.alert('Sucesso', 'Lugar adicionado ao seu diário!');
      }

      navigation.goBack();

    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao comunicar com o serviço de localização.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nome do Lugar *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Museu do Louvre" />
      <Text style={styles.label}>Descrição</Text>
      <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} placeholder="O que achou do local?" multiline />

      <TouchableOpacity
        style={styles.mapPickerButton}
        onPress={() => setMapaVisivel(true)}
      >
        <Ionicons name="map-outline" size={20} color="#0056b3" />
        <Text style={styles.mapPickerButtonText}>
          {coordenadasMapa ? 'Ajustar Local no Mapa' : 'Encontrar Endereço pelo Mapa'}
        </Text>
      </TouchableOpacity>

      {coordenadasMapa && (
        <View style={styles.mapBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
          <Text style={styles.mapBadgeText}>Coordenada exata vinculada pelo mapa</Text>
          <TouchableOpacity onPress={() => setCoordenadasMapa(null)}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.label}>Rua *</Text>
      <TextInput style={styles.input} value={rua} onChangeText={setRua} placeholder="Ex: Rua das Flores" />

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Número *</Text>
          <TextInput style={styles.input} value={numero} onChangeText={setNumero} keyboardType="numeric" />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Estado *</Text>
          <TextInput style={styles.input} value={estado} onChangeText={setEstado} placeholder="Ex: SP" />
        </View>
      </View>

      <Text style={styles.label}>Cidade *</Text>
      <TextInput style={styles.input} value={cidade} onChangeText={setCidade} placeholder="Ex: Franca" />

      <Text style={styles.label}>Status da Viagem</Text>
      <View style={styles.statusContainer}>
        <TouchableOpacity
          style={[styles.statusButton, status === 'Quero visitar' && styles.statusActive]}
          onPress={() => setStatus('Quero visitar')}
        >
          <Text style={[styles.statusText, status === 'Quero visitar' && styles.statusTextActive]}>
            Quero visitar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statusButton, status === 'Visitado' && styles.statusActive]}
          onPress={() => setStatus('Visitado')}
        >
          <Text style={[styles.statusText, status === 'Visitado' && styles.statusTextActive]}>
            Visitado
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Foto do Local</Text>
      <View style={styles.photoButtons}>
        <Button title="Tirar Foto" onPress={tirarFoto} />
        <Button title="Galeria" onPress={escolherFoto} color="#666" />
      </View>

      {fotoUri && (
        <Image source={{ uri: fotoUri }} style={styles.previewImage} />
      )}
      <View style={styles.saveContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0056b3" />
        ) : (
          <Button
            title={isEditing ? 'Salvar Alterações' : 'Guardar Local'}
            onPress={handleSalvar}
            color="#0056b3"
          />
        )}
      </View>

      <MapaSeletorModal
        visible={mapaVisivel}
        coordenadaInicial={coordenadasMapa}
        onClose={() => setMapaVisivel(false)}
        onConfirm={handleConfirmarMapa}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f9f9f9', flexGrow: 1 },
  label: { fontWeight: 'bold', marginTop: 10, marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, backgroundColor: '#fff', marginBottom: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  statusContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statusButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, alignItems: 'center', marginHorizontal: 5, backgroundColor: '#fff' },
  statusActive: { backgroundColor: '#0056b3', borderColor: '#0056b3' },
  statusText: { color: '#333', fontWeight: 'bold' },
  statusTextActive: { color: '#fff' },
  photoButtons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15, marginTop: 5 },
  previewImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 20, resizeMode: 'cover' },
  saveContainer: { marginTop: 20, marginBottom: 40 },
  mapPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF3FA',
    borderWidth: 1,
    borderColor: '#0056b3',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 15,
    marginBottom: 5,
  },
  mapPickerButtonText: {
    color: '#0056b3',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  mapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  mapBadgeText: {
    flex: 1,
    fontSize: 12,
    color: '#2E7D32',
    marginLeft: 6,
    fontWeight: '600',
  },
});
