import React, { useState } from 'react';
import { PopcornProduct } from '../../types';
import { useCart } from '../../context/CartContext';
import { Search, Filter, Star, Plus, Check } from 'lucide-react';
import { POPCORN_CATEGORIES } from '../../data/initialData';
import { formatNaira } from '../../lib/currency';

interface MenuPageProps {
  products: PopcornProduct[];
  selectedCategory?: string;
  onSelectProduct: (product: PopcornProduct) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  products,
  selectedCategory = 'All',
  onSelectProduct,
}) => {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [addedItemAlert, setAddedItemAlert] = useState<string | null>(null);

  // Step 8 requirement: Only show products where is_available = true to customers
  const availableProducts = products.filter((p) => p.is_available !== false);

  const filteredProducts = availableProducts.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0; // featured
  });

  const handleQuickAdd = (product: PopcornProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAddedItemAlert(product.id);
    setTimeout(() => {
      setAddedItemAlert(null);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
          Our Popcorn Catalog
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display tracking-tight">
          Handcrafted Popcorn Menu
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Explore gourmet sweet glazes, aged cheese dusts, and spicy seasonings.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search flavor, caramel, truffle, cheddar..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 shrink-0">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
          >
            <option value="featured">Featured Flavors</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {POPCORN_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {availableProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-3">
            🍿
          </div>
          <h3 className="text-base font-bold text-stone-900">No Available Products</h3>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            There are currently no active products marked as available in <code className="bg-stone-100 px-1 py-0.5 rounded text-amber-800 font-mono">public.products</code>.
          </p>
          <p className="text-xs text-stone-400 mt-2">
            Once products are published and in-stock in Supabase, they will appear here immediately.
          </p>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
          <span className="text-4xl">🍿</span>
          <h3 className="text-sm font-bold text-stone-800 mt-2">No flavors match your search</h3>
          <p className="text-xs text-stone-500 mt-1">
            Try resetting your search query or picking another category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
            }}
            className="mt-4 px-4 py-2 bg-amber-500 text-stone-950 text-xs font-bold rounded-xl"
          >
            View All Popcorn
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => {
            const isAvailable = product.is_available !== false;
            return (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400 transition-all flex flex-col justify-between cursor-pointer group"
            >
              {/* Image & Tags */}
              <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                  {product.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-900/80 text-white backdrop-blur-xs shadow-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/90 text-amber-900 text-[11px] font-bold shadow-xs flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>{product.rating || 4.9}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                      {product.category}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                      isAvailable ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {isAvailable ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 block leading-none">Price</span>
                    <span className="text-base font-extrabold text-stone-900">
                      {formatNaira(product.price)}
                    </span>
                  </div>

                  <button
                    disabled={!isAvailable}
                    onClick={(e) => isAvailable && handleQuickAdd(product, e)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                      !isAvailable
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                        : addedItemAlert === product.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950'
                    }`}
                  >
                    {!isAvailable ? (
                      'Sold Out'
                    ) : addedItemAlert === product.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
};
