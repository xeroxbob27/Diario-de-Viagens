import React, { useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlacesContext } from '../context/PlacesContext';

export default function ListaScreen({ navigation }) {
  const { places } = useContext(PlacesContext);
  const { width } = useWindowDimensions();
  const [modoVisualizacao, setModoVisualizacao] = useState('lista');
  const [indiceAtual, setIndiceAtual] = useState(0);
  const indiceSeguro = Math.min(indiceAtual, Math.max(places.length - 1, 0));
  const handleScrollEnd = useCallback(
    (event) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const novoIndice = Math.round(offsetX / width);
      setIndiceAtual(novoIndice);
    },
    [width]
  );

  const renderItemUnico = useCallback(
    ({ item }) => (
      <View style={[styles.slidePage, { width }]}>
        <View style={styles.singleCard}>
          <View style={styles.singleHeader}>
            <View style={styles.cityHeaderRow}>
              <Ionicons name="location" size={22} color="#0056b3" />
              <Text style={styles.singleCity} numberOfLines={1}>
                {item.cidade}
                {item.estado ? ` - ${item.estado}` : ''}
              </Text>
            </View>

            <View style={styles.singleSubHeader}>
              <Text style={styles.singlePlaceName} numberOfLines={1}>
                {item.nome}
              </Text>
              <View style={styles.statusBadge}>
                <Text
                  style={[
                    styles.statusText,
                    item.status === 'Visitado'
                      ? styles.textVisitado
                      : styles.textQueroVisitar,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          </View>

          {item.foto ? (
            <Image source={{ uri: item.foto }} style={styles.singleImage} />
          ) : (
            <View style={styles.singlePlaceholderImage}>
              <Ionicons name="image-outline" size={52} color="#999" />
              <Text style={styles.singlePlaceholderText}>Sem foto registrada</Text>
            </View>
          )}

          <ScrollView
            style={styles.singleDescriptionScroll}
            contentContainerStyle={styles.singleDescriptionContent}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.singleDescriptionLabel}>Sobre o local</Text>
            <Text style={styles.singleDescriptionText}>
              {item.descricao && item.descricao.trim().length > 0
                ? item.descricao
                : 'Nenhuma descrição informada para esta viagem.'}
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => navigation.navigate('Detalhes', { id: item.id })}
          >
            <Text style={styles.detailsButtonText}>Ver detalhes e mapa</Text>
            <Ionicons name="arrow-forward" size={16} color="#0056b3" />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [navigation, width]
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Detalhes', { id: item.id })}
    >
      {item.foto ? (
        <Image source={{ uri: item.foto }} style={styles.thumbnail} />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="image-outline" size={30} color="#999" />
        </View>
      )}

      {/* Informações do Lugar: Nome, Cidade e Status */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{item.nome}</Text>
        <Text style={styles.city}>{item.cidade}</Text>
        <View style={styles.statusBadge}>
          <Text style={[
            styles.statusText,
            item.status === 'Visitado' ? styles.textVisitado : styles.textQueroVisitar
          ]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={24} color="#ccc" style={styles.arrowIcon} />
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="airplane-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>O seu Diário de Viagens está vazio.</Text>
      <Text style={styles.emptySubText}>
        Adicione lugares que quer conhecer ou que já visitou!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.toggleWrapper}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            modoVisualizacao === 'lista' && styles.toggleButtonActive,
          ]}
          onPress={() => setModoVisualizacao('lista')}
        >
          <Ionicons
            name="list-outline"
            size={18}
            color={modoVisualizacao === 'lista' ? '#fff' : '#0056b3'}
          />
          <Text
            style={[
              styles.toggleText,
              modoVisualizacao === 'lista' && styles.toggleTextActive,
            ]}
          >
            Em Lista
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            modoVisualizacao === 'unitario' && styles.toggleButtonActive,
          ]}
          onPress={() => {
            setIndiceAtual(0);
            setModoVisualizacao('unitario');
          }}
        >
          <Ionicons
            name="albums-outline"
            size={18}
            color={modoVisualizacao === 'unitario' ? '#fff' : '#0056b3'}
          />
          <Text
            style={[
              styles.toggleText,
              modoVisualizacao === 'unitario' && styles.toggleTextActive,
            ]}
          >
            1 em 1
          </Text>
        </TouchableOpacity>
      </View>

      {places.length === 0 ? (
        renderEmpty()
      ) : modoVisualizacao === 'lista' ? (
        <FlatList
          key="modo-lista"
          data={places}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.carouselContainer}>
          <View style={styles.swipeIndicatorRow}>
            <Ionicons name="swap-horizontal-outline" size={16} color="#666" />
            <Text style={styles.swipeIndicatorText}>
              {indiceSeguro + 1} de {places.length} • Arraste para os lados
            </Text>
          </View>

          <FlatList
            key="modo-unitario"
            data={places}
            keyExtractor={(item) => item.id}
            renderItem={renderItemUnico}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Cadastro')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4'
  },
  listContent: {
    padding: 15,
    paddingBottom: 80, 
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
    // Sombra para dar destaque ao card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center'
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  city: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  textVisitado: {
    color: '#2E7D32', 
  },
  textQueroVisitar: {
    color: '#D84315', 
  },
  arrowIcon: {
    marginLeft: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#0056b3', 
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  toggleWrapper: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: '#e6eef8',
    borderRadius: 10,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#0056b3',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  toggleText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0056b3',
  },
  toggleTextActive: {
    color: '#fff',
  },
  carouselContainer: {
    flex: 1,
  },
  swipeIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  swipeIndicatorText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    fontWeight: '600',
  },
  slidePage: {
    paddingHorizontal: 15,
    paddingBottom: 90, 
  },
  singleCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  singleHeader: {
    marginBottom: 12,
  },
  cityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  singleCity: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 6,
    flex: 1,
  },
  singleSubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  singlePlaceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    flex: 1,
    marginRight: 10,
  },
  singleImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 14,
  },
  singlePlaceholderImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  singlePlaceholderText: {
    marginTop: 8,
    color: '#999',
    fontSize: 13,
  },
  singleDescriptionScroll: {
    flex: 1,
  },
  singleDescriptionContent: {
    paddingBottom: 8,
  },
  singleDescriptionLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0056b3',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  singleDescriptionText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 12,
    marginTop: 8,
  },
  detailsButtonText: {
    color: '#0056b3',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 6,
  },
});