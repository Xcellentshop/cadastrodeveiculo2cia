import React from 'react';
import { Toaster } from 'react-hot-toast';
import VehicleForm from './components/VehicleForm';
import VehicleList from './components/VehicleList';
import { Car } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Car className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Sistema de Gerenciamento de Veículos
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <VehicleForm />
          <VehicleList />
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} Sistema de Gerenciamento de Veículos. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;