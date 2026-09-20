import React from 'react';
import { PopcornProduct } from '../../types';
import { useCart } from '../../context/CartContext';
import { Sparkles, Flame, Clock, Truck, ShieldCheck, ArrowRight, Star, Heart } from 'lucide-react';
import { formatNaira, FREE_DELIVERY_THRESHOLD } from '../../lib/currency';

interface HomePageProps {
  products: PopcornProduct[];
  onSelectProduct: (product: PopcornProduct) => void;
  onNavigateToMenu: (category?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  onSelectProduct,
  onNavigateToMenu,
}) => {
  const { addToCart } = useCart();
  // Only show available products to customers
  const availableProducts = products.filter((p) => p.is_available !== false);
  const featured = availableProducts.slice(0, 4);
  const popular = availableProducts.length > 4 ? availableProducts.slice(4, 8) : availableProducts.slice(0, 4);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 shadow-xl">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-12 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Kettle-Popped In Fresh Batches Daily</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-tight">
              Golden, Crunchy <br />
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                Artisan Popcorn.
              </span>
            </h1>

            <p className="text-stone-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Crafted in copper kettles with real brown sugar, farm-fresh butter, and aged sharp cheese. Delivered piping crisp to your door.
            </p>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-order-now-btn"
                onClick={() => onNavigateToMenu()}
                className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 transform active:scale-95"
              >
                Order Fresh Popcorn <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigateToMenu('Party Bundles')}
                className="px-5 py-3.5 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 text-amber-200 border border-stone-700/80 font-bold text-sm transition-all"
              >
                Party & Movie Packs
              </button>
            </div>

            {/* Delivery highlights */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-800/80 max-w-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-stone-100 block">25-35 Mins</span>
                  <span className="text-stone-400">Express Drop</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-stone-100 block">Free Shipping</span>
                  <span className="text-stone-400">Over {formatNaira(FREE_DELIVERY_THRESHOLD)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 shrink-0 fill-amber-400" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-stone-100 block">4.9 / 5.0</span>
                  <span className="text-stone-400">From 1,200+ fans</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-72 sm:w-84 aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400/20 group">
              <img
                src="https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=800&q=80"
                alt="Artisan Salted Caramel Gold Popcorn"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                <span className="px-2.5 py-1 bg-amber-500 text-stone-950 font-black text-[10px] rounded-full uppercase w-fit mb-1">
                  Today's Chef Batch
                </span>
                <p className="text-white font-bold text-sm">Artisan Salted Caramel Gold</p>
                <p className="text-amber-200 text-xs font-semibold">From ₦3,500 • Warm & Crisp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popcorn Categories Quick Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display tracking-tight">
              Flavors for Every Craving
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Select a category or browse our signature handcrafted menu.
            </p>
          </div>
          <button
            onClick={() => onNavigateToMenu()}
            className="text-amber-700 hover:text-amber-800 font-bold text-xs flex items-center gap-1 hover:underline"
          >
            See All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { name: 'Sweet & Caramel', emoji: '🍯', desc: 'Butter, Sugar & Vanilla' },
            { name: 'Savory & Cheesy', emoji: '🧀', desc: 'Sharp Wisconsin Cheddar' },
            { name: 'Spicy & Bold', emoji: '🌶️', desc: 'Jalapeño & Smoked Paprika' },
            { name: 'Gourmet Specialties', emoji: '✨', desc: 'Black Truffle & Chicago Mix' },
            { name: 'Party Bundles', emoji: '🎉', desc: 'Movie Tins & Feasts' },
          ].map((cat) => (
            <button
              key={cat.name}
              onClick={() => onNavigateToMenu(cat.name)}
              className="p-4 rounded-2xl bg-white border border-stone-200/80 hover:border-amber-400 hover:shadow-md transition-all text-left group flex flex-col justify-between"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                {cat.emoji}
              </div>
              <div>
                <h3 className="text-xs font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">{cat.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold uppercase tracking-wider mb-0.5">
              <Flame className="w-3.5 h-3.5" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
              Signature Popcorn Batches
            </h2>
          </div>
          <button
            onClick={() => onNavigateToMenu()}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            Explore Menu <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-8 shadow-xs max-w-lg mx-auto">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">No products in Supabase</h3>
            <p className="text-xs text-stone-500 mb-4">
              The <code className="bg-stone-100 px-1 py-0.5 rounded text-amber-800 font-mono">public.products</code> table in your Supabase database is currently empty.
            </p>
            <button
              onClick={() => onNavigateToMenu()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2"
            >
              View Menu Page
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onSelectProduct(product)}>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.tags && product.tags.length > 0 && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 shadow-xs">
                      {product.tags[0]}
                    </span>
                  )}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-stone-900/80 text-amber-300 text-[11px] font-semibold backdrop-blur-xs flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-300" />
                    <span>{product.rating || 4.9}</span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                      {product.category}
                    </span>
                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="text-sm font-bold text-stone-900 hover:text-amber-600 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block leading-none">Starting from</span>
                      <span className="text-base font-extrabold text-stone-900">
                        {formatNaira(product.price)}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        Sizes
                      </button>
                      <button
                        onClick={() => addToCart(product)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold text-xs transition-colors shadow-xs"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Popular Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trending Now</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
              Popular Popcorn Selections
            </h2>
          </div>
          <button
            onClick={() => onNavigateToMenu()}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            View All Flavors <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {availableProducts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs max-w-lg mx-auto">
            <p className="text-xs text-stone-500">
              No available products found in <code className="bg-stone-100 px-1 py-0.5 rounded text-amber-800 font-mono">public.products</code>. Add products to populate popular picks.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popular.map((product) => (
              <div
                key={`popular-${product.id}`}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div
                  className="relative aspect-4/3 overflow-hidden bg-stone-100 cursor-pointer"
                  onClick={() => onSelectProduct(product)}
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 shadow-xs">
                    Popular
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-stone-900/80 text-amber-300 text-[11px] font-semibold backdrop-blur-xs flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-300" />
                    <span>{product.rating || 4.9}</span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                      {product.category}
                    </span>
                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="text-sm font-bold text-stone-900 hover:text-amber-600 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block leading-none">Starting from</span>
                      <span className="text-base font-extrabold text-stone-900">
                        {formatNaira(product.price)}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => addToCart(product)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold text-xs transition-colors shadow-xs"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quality Commitment / Why Ruckyn Antee */}
      <section className="bg-amber-100/50 border-y border-amber-200/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-black text-stone-900 font-display tracking-tight">
              Why Popcorn Lovers Choose Ruckyn Antee
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Never stale, never bagged months ago. Popped fresh right after you place your order.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center text-xl mb-4">
                🌽
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1">Non-GMO Mushroom Corn</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                We exclusively pop extra-large round mushroom kernels that hold coatings evenly without crushing or crumbling.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center text-xl mb-4">
                🧈
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1">Pure Copper Kettle Glazing</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Real butter and unrefined cane sugar are caramelized at high heat for that unmistakable golden glaze and crunch.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center text-xl mb-4">
                🚀
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1">Express Heat-Sealed Dispatch</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tins and bags are heat-sealed immediately upon leaving the kettle to lock in maximum warmth and aroma.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
