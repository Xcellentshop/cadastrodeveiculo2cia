import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Vehicle, City } from '../types';
import { Search, FileDown, Filter } from 'lucide-react';
import { CSVLink } from 'react-csv';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | 'all'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, 'vehicles'), orderBy('registrationNumber', 'desc'));

      if (selectedCity !== 'all') {
        q = query(q, where('city', '==', selectedCity));
      }

      const snapshot = await getDocs(q);
      const vehicleData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vehicle[];

      setVehicles(vehicleData);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [selectedCity]);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = Object.values(vehicle).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesDateRange = (!dateRange.start || vehicle.inspectionDate >= dateRange.start) &&
      (!dateRange.end || vehicle.inspectionDate <= dateRange.end);

    return matchesSearch && matchesDateRange;
  });

  const generateStats = () => {
    const stats = {
      total: filteredVehicles.length,
      byType: {} as Record<string, number>,
      byKey: { yes: 0, no: 0 },
      byState: {} as Record<string, number>,
      byCity: {} as Record<string, number>,
    };

    filteredVehicles.forEach(vehicle => {
      // Count by type
      stats.byType[vehicle.vehicleType] = (stats.byType[vehicle.vehicleType] || 0) + 1;
      
      // Count by key
      if (vehicle.hasKey) stats.byKey.yes += 1;
      else stats.byKey.no += 1;
      
      // Count by state
      stats.byState[vehicle.state] = (stats.byState[vehicle.state] || 0) + 1;
      
      // Count by city
      stats.byCity[vehicle.city] = (stats.byCity[vehicle.city] || 0) + 1;
    });

    return stats;
  };

  const stats = generateStats();

  const csvData = filteredVehicles.map(vehicle => ({
    'Número de Registro': vehicle.registrationNumber,
    'Placa': vehicle.plate,
    'UF': vehicle.state,
    'Data de Vistoria': format(new Date(vehicle.inspectionDate), 'dd/MM/yyyy'),
    'Marca': vehicle.brand,
    'Modelo': vehicle.model,
    'Tipo': vehicle.vehicleType,
    'Chave': vehicle.hasKey ? 'Sim' : 'Não',
    'Observação Chassi': vehicle.chassisObservation,
    'Data de Liberação': format(new Date(vehicle.releaseDate), 'dd/MM/yyyy'),
    'Cidade': vehicle.city
  }));

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Lista de Veículos</h2>
        
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar veículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value as City | 'all')}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as cidades</option>
            <option value="Medianeira">Medianeira</option>
            <option value="SMI">SMI</option>
            <option value="Missal">Missal</option>
            <option value="Itaipulândia">Itaipulândia</option>
            <option value="Serranópolis">Serranópolis</option>
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <CSVLink
            data={csvData}
            filename={`veiculos-${format(new Date(), 'dd-MM-yyyy')}.csv`}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Exportar CSV
          </CSVLink>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Total de Veículos</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Com Chave</h3>
          <p className="text-2xl font-bold text-green-600">{stats.byKey.yes}</p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Sem Chave</h3>
          <p className="text-2xl font-bold text-red-600">{stats.byKey.no}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Cidades Atendidas</h3>
          <p className="text-2xl font-bold text-purple-600">{Object.keys(stats.byCity).length}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando veículos...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Placa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marca/Modelo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {vehicle.registrationNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.plate} ({vehicle.state})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.brand} {vehicle.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.vehicleType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      vehicle.hasKey
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.hasKey ? 'Com Chave' : 'Sem Chave'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}