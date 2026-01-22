
import React from 'react';
import { ShoppingBag, Coins, Check, Lock } from 'lucide-react';
import { CartoonBat, CartoonOwl, CartoonParrot } from './BirdSkins';

interface SkinItem {
  id: string;
  name: string;
  price: number;
  component: React.ReactNode;
}

const SKINS: SkinItem[] = [
  { id: 'bat', name: 'Standard Bat', price: 0, component: <CartoonBat isEating={false} /> },
  { id: 'owl', name: 'Wise Owl', price: 10, component: <CartoonOwl isEating={false} /> },
  { id: 'parrot', name: 'Island Parrot', price: 20, component: <CartoonParrot isEating={false} /> },
];

interface ShopProps {
  coins: number;
  unlockedSkins: string[];
  activeSkin: string;
  onPurchase: (skinId: string, price: number) => void;
  onEquip: (skinId: string) => void;
  onClose: () => void;
}

export const Shop: React.FC<ShopProps> = ({ coins, unlockedSkins, activeSkin, onPurchase, onEquip, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#020617ef] backdrop-blur-2xl p-10 flex items-center justify-center animate-in fade-in zoom-in duration-300">
      <div className="bg-[#0c111d] border-4 border-[#1e293b] rounded-[3.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(79,70,229,0.2)]">
        <div className="p-8 border-b border-[#1e293b] flex justify-between items-center">
          <h2 className="text-4xl font-heading text-white flex items-center gap-4">
            <ShoppingBag size={40} className="text-indigo-500" /> SHOP
          </h2>
          <div className="flex items-center gap-3 bg-yellow-400/10 px-6 py-3 rounded-2xl border border-yellow-500/20">
            <Coins className="text-yellow-400" size={28} fill="currentColor" />
            <span className="text-3xl font-heading text-yellow-100">{coins}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {SKINS.map(skin => {
            const isUnlocked = unlockedSkins.includes(skin.id);
            const isActive = activeSkin === skin.id;
            const canAfford = coins >= skin.price;

            return (
              <div key={skin.id} className={`group relative p-8 rounded-[2.5rem] border-4 transition-all duration-300 flex flex-col items-center ${isActive ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-900 border-slate-800'}`}>
                <div className="w-32 h-32 mb-6 group-hover:scale-110 transition-transform">
                  {skin.component}
                </div>
                <h3 className="text-xl font-heading text-white mb-2">{skin.name}</h3>
                
                {isUnlocked ? (
                  <button 
                    onClick={() => onEquip(skin.id)}
                    className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${isActive ? 'bg-indigo-600 text-white cursor-default' : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white'}`}
                  >
                    {isActive ? <><Check size={18} /> EQUIPPED</> : 'EQUIP'}
                  </button>
                ) : (
                  <button 
                    disabled={!canAfford}
                    onClick={() => onPurchase(skin.id, skin.price)}
                    className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${canAfford ? 'bg-yellow-500 text-yellow-950 hover:scale-105 active:scale-95' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}`}
                  >
                    <Coins size={18} fill="currentColor" /> {skin.price} TO UNLOCK
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-8 border-t border-[#1e293b] flex justify-center">
          <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-white font-black px-12 py-4 rounded-2xl text-lg transition-all border-b-4 border-slate-900 active:translate-y-1 active:border-b-0">
            BACK TO ADVENTURE
          </button>
        </div>
      </div>
    </div>
  );
};
