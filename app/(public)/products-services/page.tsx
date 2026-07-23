'use client';

import { Loader } from '@/components/Loaders/Loader.component';
import { useApi } from '@/hooks/useApi';
import { Product } from '@/types/products.types';
import { useEffect, useState } from 'react';
import { Search, Package, Phone, ShoppingCart, Tag } from 'lucide-react';

export default function ProductsServicesPage() {
  const { error, loading, request } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await request('/productos');
      if (res.data) {
        // Filtrar solo productos activos para el público
        const activeProducts = res.data.products.filter(
          (product: Product) => product.activo !== false
        );
        setProducts(activeProducts);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Mostrar error si existe
  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-violet-50'>
        <div className='text-center max-w-md mx-auto p-6'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Package className='w-8 h-8 text-red-600' />
          </div>
          <h2 className='text-xl font-bold text-violet-900 mb-2'>
            Error al cargar productos
          </h2>
          <p className='text-violet-600 mb-6'>
            No pudimos cargar el catálogo en este momento
          </p>
          <button
            onClick={fetchProducts}
            className='px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors'
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-violet-50'>
        <Loader />
      </div>
    );
  }

  const filteredProducts = products.filter(
    (product) =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContact = (productName: string) => {
    const message = `Hola, me interesa obtener más información sobre: ${productName}`;
    const whatsappUrl = `https://wa.me/526567788565?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className='min-h-screen bg-violet-50 py-8 px-4 mt-8 sm:px-6 lg:px-8'>
      {/* Hero Section */}
      <div className='max-w-6xl mx-auto text-center mb-12'>
        <h1 className='text-4xl sm:text-5xl font-bold text-violet-900 mb-4'>
          Nuestro Catálogo
        </h1>
        <p className='text-xl text-violet-600 max-w-3xl mx-auto mb-8'>
          Descubre nuestra amplia variedad de productos y servicios para hacer
          de tu evento una experiencia única
        </p>

        {/* Search */}
        <div className='max-w-md mx-auto relative'>
          <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-violet-400 w-5 h-5' />
          <input
            type='text'
            placeholder='Buscar productos...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-12 pr-4 py-3 border border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm'
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className='max-w-7xl mx-auto'>
        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className='text-center py-16'>
            <div className='flex justify-center mb-6'>
              <Package className='w-24 h-24 text-violet-300' />
            </div>
            <h3 className='text-2xl font-bold text-violet-900 mb-4'>
              {searchTerm
                ? 'No se encontraron productos'
                : 'Catálogo en preparación'}
            </h3>
            <p className='text-violet-600 max-w-md mx-auto mb-8'>
              {searchTerm
                ? 'Intenta con otro término de búsqueda'
                : 'Estamos preparando nuestro catálogo completo. Contáctanos para conocer disponibilidad.'}
            </p>
            <button
              onClick={() => handleContact('catálogo general')}
              className='inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors'
            >
              <Phone className='w-5 h-5' />
              Consultar disponibilidad
            </button>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className='flex justify-between items-center mb-8'>
              <p className='text-violet-600'>
                Mostrando{' '}
                <span className='font-semibold text-violet-700'>
                  {filteredProducts.length}
                </span>{' '}
                {filteredProducts.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>

            {/* Products Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className='bg-white rounded-2xl shadow-sm border border-violet-100 hover:shadow-lg hover:border-violet-200 transition-all duration-300 group'
                >
                  {/* Product Image Placeholder */}
                  <div className='h-48 bg-gradient-to-br from-violet-50 to-purple-100 rounded-t-2xl flex items-center justify-center'>
                    {product.imagenes && product.imagenes.length > 0 ? (
                      <img
                        src={product.imagenes[0].url}
                        alt={product.nombre}
                        className='h-full w-full object-cover rounded-t-2xl'
                      />
                    ) : (
                      <Package className='w-16 h-16 text-violet-300 group-hover:text-violet-400 transition-colors' />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className='p-6'>
                    {/* Header */}
                    <div className='flex justify-between items-start mb-3'>
                      <h3 className='font-bold text-violet-900 text-lg leading-tight pr-2 flex-1'>
                        {product.nombre}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${product.stock > 10
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : product.stock > 0
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                      >
                        {product.stock > 10
                          ? 'Disponible'
                          : product.stock > 0
                            ? 'Últimas unidades'
                            : 'Agotado'}
                      </span>
                    </div>

                    {/* Description */}
                    {product.descripcion && (
                      <p className='text-violet-600 text-sm mb-4 line-clamp-2 leading-relaxed'>
                        {product.descripcion}
                      </p>
                    )}

                    {/* Category */}
                    {product.categoria && (
                      <div className='flex items-center gap-2 mb-4'>
                        <Tag className='w-4 h-4 text-violet-400' />
                        <span className='text-xs text-violet-500 bg-violet-50 px-2 py-1 rounded'>
                          {product.categoria.nombre}
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className='flex items-center justify-between mb-4'>
                      <div>
                        <span className='text-2xl font-bold text-violet-700'>
                          ${parseFloat(product.precioVenta).toFixed(2)}
                        </span>
                        {Number(product.precioRentaDiario) &&
                          Number(product.precioRentaDiario) > 0 && (
                            <p className='text-violet-500 text-sm'>
                              Renta: $
                              {parseFloat(
                                product.precioRentaDiario.toString()
                              ).toFixed(2)}
                              /día
                            </p>
                          )}
                      </div>
                    </div>

                    {/* Contact Button */}
                    <button
                      onClick={() => handleContact(product.nombre)}
                      disabled={product.stock === 0}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-colors ${product.stock === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-violet-600 text-white hover:bg-violet-700'
                        }`}
                    >
                      <ShoppingCart className='w-4 h-4' />
                      {product.stock === 0 ? 'Agotado' : 'Consultar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CTA Section */}
        {filteredProducts.length > 0 && (
          <div className='mt-16 text-center'>
            <div className='bg-white rounded-2xl shadow-sm border border-violet-100 p-8 max-w-2xl mx-auto'>
              <h2 className='text-2xl font-bold text-violet-900 mb-4'>
                ¿No encuentras lo que buscas?
              </h2>
              <p className='text-violet-600 mb-6'>
                Tenemos más productos disponibles. Contáctanos y te ayudamos a
                encontrar exactamente lo que necesitas para tu evento.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <button
                  onClick={() => handleContact('asesoría personalizada')}
                  className='inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors'
                >
                  <Phone className='w-5 h-5' />
                  WhatsApp
                </button>
                <a
                  href='tel:+526561304629'
                  className='inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors'
                >
                  <Phone className='w-5 h-5' />
                  Llamar ahora
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
