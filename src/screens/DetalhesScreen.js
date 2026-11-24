import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { PlacesContext } from '../context/PlacesContext';

export default function DetalhesScreen({ route, navigation }) {
  const { id } = route.params;
  const { places, deletePlace, toggleStatus } = useContext(PlacesContext);
  const place = places.find(p => p.id === id);
  if (!place) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Lugar não encontrado.</Text>
      </View>
    );
  }

  const handleRemover = () => {
    Alert.alert(
      'Remover Lugar',
      `Tem a certeza que deseja remover "${place.nome}" do seu diário?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            deletePlace(id);
            navigation.goBack(); 
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Exibição da Foto ou Placeholder */}
      {place.foto ? (
        <Image source={{ uri: place.foto }} style={styles.image} />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="image-outline" size={50} color="#999" />
          <Text style={styles.placeholderText}>Sem foto</Text>
        </View>
      )}

      {/* Informações Principais */}
      <View style={styles.infoCard}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{place.nome}</Text>
          <View style={[
            styles.statusBadge,
            place.status === 'Visitado' ? styles.badgeVisitado : styles.badgeQueroVisitar
          ]}>
            <Text style={styles.statusText}>{place.status}</Text>
          </View>
        </View>

        {place.descricao ? (
          <Text style={styles.description}>{place.descricao}</Text>
        ) : null}

        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <Text style={styles.addressText}>
            {place.rua}, {place.numero} - {place.cidade} / {place.estado}
          </Text>
        </View>
      </View>

      {/* Botões de Ação */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleStatus(id)}
        >
          <Ionicons
            name={place.status === 'Visitado' ? 'close-circle-outline' : 'checkmark-circle-outline'}
            size={22}
            color="#0056b3"
          />
          <Text style={styles.actionButtonText}>
            {place.status === 'Visitado' ? 'Pendente' : 'Visitado'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Cadastro', { placeToEdit: place })}
        >
          <Ionicons name="create-outline" size={22} color="#0056b3" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleRemover}
        >
          <Ionicons name="trash-outline" size={22} color="#D84315" />
          <Text style={styles.deleteButtonText}>Remover</Text>
        </TouchableOpacity>
      </View>

      {/* Mini Mapa Exigido */}
      <Text style={styles.sectionTitle}>Localização</Text>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: place.latitude,
            longitude: place.longitude,
            latitudeDelta: 0.005, 
            longitudeDelta: 0.005,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.nome}
          />
        </MapView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, paddingBottom: 40, backgroundColor: '#f4f4f4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: '#666' },
  image: { width: '100%', height: 250, borderRadius: 12, marginBottom: 15, resizeMode: 'cover' },
  placeholderImage: { width: '100%', height: 250, borderRadius: 12, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  placeholderText: { marginTop: 10, color: '#999' },
  infoCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeVisitado: { backgroundColor: '#E8F5E9' },
  badgeQueroVisitar: { backgroundColor: '#FFF3E0' },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  description: { fontSize: 16, color: '#555', marginBottom: 15, fontStyle: 'italic' },
  addressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  addressText: { fontSize: 14, color: '#666', marginLeft: 5, flex: 1 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionButton: { flex: 1, flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 6, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginHorizontal: 3, elevation: 1 },
  actionButtonText: { marginLeft: 4, color: '#0056b3', fontWeight: 'bold', fontSize: 13 },
  deleteButton: { marginRight: 0 },
  deleteButtonText: { marginLeft: 4, color: '#D84315', fontWeight: 'bold', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  mapContainer: { height: 200, borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  map: { flex: 1 }
});