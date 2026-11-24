import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PieChart, BarChart, Grid } from 'react-native-svg-charts';
import { PlacesContext } from '../context/PlacesContext';
import { Ionicons } from '@expo/vector-icons';

export default function EstatisticasScreen() {
  const { places } = useContext(PlacesContext);

  if (places.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="pie-chart-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>Sem dados para analisar.</Text>
        <Text style={styles.emptySubText}>Registe locais para visualizar as estatísticas.</Text>
      </View>
    );
  }
  const qtdQueroVisitar = places.filter(p => p.status === 'Quero visitar').length;
  const qtdVisitado = places.filter(p => p.status === 'Visitado').length;

  const dataStatus = [
    { key: 'quero', value: qtdQueroVisitar, svg: { fill: '#D84315' }, label: 'Quero visitar' },
    { key: 'visitado', value: qtdVisitado, svg: { fill: '#2E7D32' }, label: 'Visitado' }
  ].filter(d => d.value > 0);

  const cidadesCount = places.reduce((acc, place) => {
    const cidade = place.cidade || 'Desconhecida';
    acc[cidade] = (acc[cidade] || 0) + 1;
    return acc;
  }, {});

  const coresCidades = ['#0056b3', '#17a2b8', '#ffc107', '#fd7e14', '#6f42c1'];

  const dataCidades = Object.keys(cidadesCount).map((cidade, index) => ({
    key: cidade,
    value: cidadesCount[cidade],
    svg: { fill: coresCidades[index % coresCidades.length] }, // Alterna cores
    label: cidade
  }));

  const qtdComFoto = places.filter((p) => Boolean(p.foto)).length;
  const qtdSemFoto = places.length - qtdComFoto;
  const percentualSemFoto = Math.round((qtdSemFoto / places.length) * 100);

  const resumoFotos = [
    { key: 'sem-foto', value: qtdSemFoto, svg: { fill: '#EF6C00' }, label: 'Sem foto' },
    { key: 'com-foto', value: qtdComFoto, svg: { fill: '#0288D1' }, label: 'Com foto' },
  ];

  const dataFotos = resumoFotos.filter((d) => d.value > 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Lugares por Status</Text>

        <PieChart
          style={{ height: 200 }}
          data={dataStatus}
          innerRadius="0%"
          outerRadius="100%"
        />

        <View style={styles.legendContainer}>
          {dataStatus.map((item) => (
            <View key={item.key} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.svg.fill }]} />
              <Text style={styles.legendText}>
                {item.label}: <Text style={styles.legendValue}>{item.value}</Text>
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Lugares por Cidade</Text>

        <BarChart
          style={{ height: 200 }}
          data={dataCidades}
          yAccessor={({ item }) => item.value}
          contentInset={{ top: 10, bottom: 10 }}
          spacingInner={0.3} 
        >
          <Grid direction={Grid.Direction.HORIZONTAL} />
        </BarChart>

        <View style={styles.legendContainer}>
          {dataCidades.map((item) => (
            <View key={item.key} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.svg.fill }]} />
              <Text style={styles.legendText}>
                {item.label}: <Text style={styles.legendValue}>{item.value}</Text>
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Memórias Registradas (Fotos)</Text>

        <View style={styles.donutContainer}>
          <PieChart
            style={styles.donutChart}
            data={dataFotos}
            innerRadius="60%"
            outerRadius="100%"
          />
          <View style={styles.donutCenter} pointerEvents="none">
            <Text
              style={[
                styles.donutPercent,
                { color: qtdSemFoto > 0 ? '#EF6C00' : '#2E7D32' },
              ]}
            >
              {percentualSemFoto}%
            </Text>
            <Text style={styles.donutLabel}>sem foto</Text>
          </View>
        </View>


        <View style={styles.legendContainer}>
          {resumoFotos.map((item) => {
            const pct = Math.round((item.value / places.length) * 100);
            return (
              <View key={item.key} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.svg.fill }]} />
                <Text style={styles.legendText}>
                  {item.label}:{' '}
                  <Text style={styles.legendValue}>
                    {item.value} ({pct}%)
                  </Text>
                </Text>
              </View>
            );
          })}
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingBottom: 30,
    backgroundColor: '#f4f4f4',
    flexGrow: 1, 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
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
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  legendContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#555',
  },
  legendValue: {
    fontWeight: 'bold',
    color: '#000',
  },
  donutContainer: {
    height: 200,
    justifyContent: 'center',
  },
  donutChart: {
    height: 200,
    width: '100%',
  },
  donutCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutPercent: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  donutLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});