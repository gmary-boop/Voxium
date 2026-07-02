import { Home, Film, PlusSquare, Bell, User, Search } from "lucide-react";
import { motion } from "motion/react";

interface BottomNavProps {
  activeView: 'threads' | 'reels' | 'create' | 'activity' | 'profile' | 'search';
  onViewChange: (view: 'threads' | 'reels' | 'create' | 'activity' | 'profile' | 'search') => void;
  unreadCount: number;
}

export default function BottomNav({ activeView, onViewChange, unreadCount }: BottomNavProps) {
  const navItems: Array<{
    id: 'threads' | 'reels' | 'create' | 'activity' | 'profile' | 'search';
    label: string;
    icon: any;
    badge: number;
  }> = [
    { id: "threads", label: "Hilos", icon: Home, badge: 0 },
    { id: "reels", label: "Reels", icon: Film, badge: 0 },
    { id: "create", label: "Crear", icon: PlusSquare, badge: 0 },
    { id: "search", label: "Buscar", icon: Search, badge: 0 },
    { id: "activity", label: "Actividad", icon: Bell, badge: unreadCount },
    { id: "profile", label: "Perfil", icon: User, badge: 0 },
  ];

  return (
    <div id="voxium_bottom_nav" className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-t border-slate-900 px-2 pb-safe">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="relative flex flex-col items-center justify-center w-12 h-12 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={`transition-all duration-300 ${isActive ? "text-indigo-400 scale-110" : "opacity-80"}`}
                />
                
                {/* Notification Badge */}
                {!!item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-950">
                    {item.badge}
                  </span>
                )}
              </div>
              
              <span className={`text-[10px] mt-1 transition-all ${isActive ? "text-indigo-400 font-medium scale-105" : "text-slate-500 text-[9px]"}`}>
                {item.label}
              </span>

              {/* Glowing active indicator line */}
              {isActive && (
                <motion.div
                  layoutId="active_indicator"
                  className="absolute bottom-1 w-5 h-[2px] bg-indigo-400 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
