import React, { useState } from 'react';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Vehicle, VehicleType, City, BRAZILIAN_STATES } from '../types';
import { Calendar, Car, MapPin, Key, FileText, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const VEHICLE_TYPES: VehicleType[] = [
  'Automóvel', 'Motocicleta', 'Camioneta', 'Caminhonete', 'Caminhão',
  'Ônibus', 'Cam. Trator', 'Triciclo', 'Quadriciclo', 'Trator de Rodas',
  'Semi-Reboque', 'Motoneta', 'Microônibus', 'Reboque', 'Ciclomotor', 'Utilitário'
];

const CITIES: City[] = ['Medianeira', 'SMI', 'Missal', 'Itaipulândia', 'Serranópolis'];

export default function VehicleForm() {
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<Partial<Vehicle>>({
    plate: '',
    state: 'PR',
    inspectionDate: '',
    brand: '',
    model: '',
    vehicleType: 'Automóvel',
    hasKey: false,
    chassisObservation: '',
    releaseDate: '',
    city: 'Medianeira'
  });

  const getNextRegistrationNumber = async () => {
    const vehiclesRef = collection(db, 'vehicles');
    const q = query(vehiclesRef, orderBy('registrationNumber', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return 1202890;
    }
    
    const lastVehicle = snapshot.docs[0].data();
    return (lastVehicle.registrationNumber as number) + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const registrationNumber = await getNextRegistrationNumber();
      await addDoc(collection(db, 'vehicles'), {
        ...vehicle,
        registrationNumber,
        createdAt: new Date().toISOString()
      });

      toast.success('Veículo cadastrado com sucesso!');
      setVehicle({
        plate: '',
        state: 'PR',
        inspectionDate: '',
        brand: '',
        model: '',
        vehicleType: 'Automóvel',
        hasKey: false,
        chassisObservation: '',
        releaseDate: '',
        city: 'Medianeira'
      });
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Erro ao cadastrar veículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Car className="w-6 h-6" />
        Cadastro de Veículo
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Placa
          </label>
          <input
            type="text"
            value={vehicle.plate}
            onChange={(e) => setVehicle({ ...vehicle, plate: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            UF
          </label>
          <select
            value={vehicle.state}
            onChange={(e) => setVehicle({ ...vehicle, state: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            {BRAZILIAN_STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Data de Vistoria
          </label>
          <input
            type="date"
            value={vehicle.inspectionDate}
            onChange={(e) => setVehicle({ ...vehicle, inspectionDate: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marca/Modelo
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Marca"
              value={vehicle.brand}
              onChange={(e) => setVehicle({ ...vehicle, brand: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Modelo"
              value={vehicle.model}
              onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Veículo
          </label>
          <select
            value={vehicle.vehicleType}
            onChange={(e) => setVehicle({ ...vehicle, vehicleType: e.target.value as VehicleType })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            {VEHICLE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Key className="w-4 h-4" />
            Chave
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={vehicle.hasKey === true}
                onChange={() => setVehicle({ ...vehicle, hasKey: true })}
                className="mr-2"
              />
              Sim
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={vehicle.hasKey === false}
                onChange={() => setVehicle({ ...vehicle, hasKey: false })}
                className="mr-2"
              />
              Não
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observação Chassi
          </label>
          <textarea
            value={vehicle.chassisObservation}
            onChange={(e) => setVehicle({ ...vehicle, chassisObservation: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Data de Liberação
          </label>
          <input
            type="date"
            value={vehicle.releaseDate}
            onChange={(e) => setVehicle({ ...vehicle, releaseDate: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cidade
          </label>
          <select
            value={vehicle.city}
            onChange={(e) => setVehicle({ ...vehicle, city: e.target.value as City })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar Veículo'}
        </button>
      </div>
    </form>
  );
}