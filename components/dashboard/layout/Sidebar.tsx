"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import Image from "next/image";
import { 
  ChatBubbleBottomCenterTextIcon,
  Squares2X2Icon,
  CalendarIcon,
  BookOpenIcon,
  FolderIcon,
  PuzzlePieceIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import { useSidebarStore } from "@/store/useSidebarStore";
import { RollingText } from "@/components/common/RollingText";
import { UserIcon, DatabaseIcon, CreditCardIcon } from "lucide-react";

interface MenuItem {
  name: string;
  icon: React.ElementType;
  href: string;
  children?: {
    name: string;
    icon: React.ElementType;
    href: string;
  }[];
}

const menuItems: MenuItem[] = [
  { name: 'Overview', icon: Squares2X2Icon, href: '/dashboard' },
  { name: 'Curriculum', icon: BookOpenIcon, href: '/dashboard/curriculum' },
  { name: 'AppScript', icon: CodeBracketIcon, href: '/dashboard/appscript-builder' },
  { name: 'Schedule', icon: CalendarIcon, href: '/dashboard/schedule' },
  { name: 'Brainstorm', icon: ChatBubbleBottomCenterTextIcon, href: '/dashboard/analytics' },
  { name: 'My Files', icon: FolderIcon, href: '/dashboard/resources' },
  { name: 'Game', icon: PuzzlePieceIcon, href: '/game/pacman' },
  { 
    name: 'Settings', 
    icon: Cog6ToothIcon, 
    href: '/dashboard/settings',
    children: [
      { name: 'Account Setting', icon: UserIcon, href: '/dashboard/settings?tab=user-setting' },
      { name: 'Files setting', icon: DatabaseIcon, href: '/dashboard/settings?tab=data-usage' },
      { name: 'Subscription', icon: CreditCardIcon, href: '/dashboard/settings?tab=subscription' },
    ]
  },
];

const sidebarContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -20, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    x: 0, 
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

export default function Sidebar() {
  const { isCollapsed, toggleSidebar, isMobileOpen, toggleMobileSidebar, setMobileOpen } = useSidebarStore();
  const pathname = usePathname();

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobileSidebar}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 flex flex-col z-[110] transition-all duration-300 shadow-xl shadow-gray-900/5 dark:shadow-none ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}`}
        initial={false}
      >
        {/* Branding */}
        <div className={`h-14 flex items-center transition-all duration-300 ${isCollapsed ? 'md:justify-between px-3' : 'justify-between px-6'}`}>
          <div className="flex items-center gap-2">
            {/* Desktop Branding */}
            <div className="hidden md:flex items-center">
              {isCollapsed ? (
                <Link href="/" className="group/logo relative z-10 shrink-0">
                  <Image 
                    src="/logoku/logo1/logo-aja.svg" 
                    alt="TechPlan Logo" 
                    width={28} 
                    height={28} 
                    className="w-7 h-7 object-contain hover:scale-110 transition-transform"
                    priority
                  />
                </Link>
              ) : (
                <Link href="/" className="flex items-center gap-2 group/logo hover:opacity-80 transition-all">
                  <Image 
                    src="/logoku/logo1/logo-full.svg" 
                    alt="TechPlan Logo" 
                    width={140} 
                    height={40} 
                    className="h-8 w-auto object-contain" 
                    priority
                  />
                </Link>
              )}
            </div>
            
            {/* Mobile Branding - Always Full Logo */}
            <Link href="/" className="flex items-center gap-2 group/logo hover:opacity-80 transition-all md:hidden">
              <Image 
                src="/logoku/logo1/logo-full.svg" 
                alt="TechPlan Logo" 
                width={140} 
                height={40} 
                className="h-8 w-auto object-contain" 
                priority
              />
            </Link>
          </div>

          <button 
            onClick={toggleSidebar} 
            className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors focus:outline-none"
          >
            {isCollapsed ? <ChevronDoubleRightIcon className="w-4 h-4" /> : <ChevronDoubleLeftIcon className="w-4 h-4" />}
          </button>
          
          <button 
            onClick={toggleMobileSidebar}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors focus:outline-none"
          >
            <ChevronDoubleLeftIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <motion.nav 
          variants={sidebarContainerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 px-3 py-6 space-y-1 overflow-y-auto no-scrollbar"
        >
          {menuItems.map((item) => (
              <motion.div key={item.name} variants={sidebarItemVariants}>
                <SidebarItem item={item} isCollapsed={isCollapsed} />
              </motion.div>
          ))}
        </motion.nav>
      </motion.aside>
    </>
  );
}

function SidebarItem({ item, isCollapsed }: { item: MenuItem, isCollapsed: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  
  const isActive = pathname === item.href || item.children?.some(child => pathname.startsWith(child.href.split('?')[0]));
  
  // Close if sidebar collapses
  React.useEffect(() => {
    if (isCollapsed) setIsOpen(false);
  }, [isCollapsed]);

  // Handle collapsed state effectively for mobile (mobile is never collapsed in view)
  const effectiveCollapsed = isCollapsed;

  return (
    <div className="space-y-1">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => item.children ? setIsOpen(!isOpen) : null}
        className="block cursor-pointer outline-none"
      >
        {item.children ? (
          <div
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-300 group ${
              isActive && !isOpen
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white'
            } ${effectiveCollapsed ? 'md:justify-center md:px-2' : ''}`}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-300 ${isActive ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-white'}`} />
            <div className={`flex-1 text-[15px] font-medium font-geist overflow-hidden select-none ${effectiveCollapsed ? 'md:hidden' : 'block'}`}>
              {isHovered ? (
                <RollingText 
                  text={item.name} 
                  className="leading-tight text-gray-900 dark:text-white"
                  transition={{ duration: 0.2, delay: 0.02, ease: "easeOut" }} 
                />
              ) : (
                <span className="inline-block leading-tight">
                  {item.name}
                </span>
              )}
            </div>
            {(isOpen || !effectiveCollapsed) && (
              <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${effectiveCollapsed ? 'md:hidden' : 'block'}`} />
            )}
          </div>
        ) : (
          <Link href={item.href}>
            <div
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white'
              } ${effectiveCollapsed ? 'md:justify-center md:px-2' : ''}`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-300 ${isActive ? 'text-blue-600' : 'group-hover:text-gray-900 dark:group-hover:text-white'}`} />
              <div className={`text-[15px] font-medium font-geist overflow-hidden select-none ${effectiveCollapsed ? 'md:hidden' : 'block'}`}>
                {isHovered ? (
                  <RollingText 
                    text={item.name} 
                    className="leading-tight text-gray-900 dark:text-white"
                    transition={{ duration: 0.2, delay: 0.02, ease: "easeOut" }} 
                  />
                ) : (
                  <span className="inline-block leading-tight">
                    {item.name}
                  </span>
                )}
              </div>
            </div>
          </Link>
        )}
      </div>

      {item.children && (
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={`ml-9 space-y-1 overflow-hidden ${effectiveCollapsed ? 'md:hidden' : 'block'}`}
            >
              {item.children.map((child) => (
                  <Link 
                    key={child.name} 
                    href={child.href}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    <child.icon className="w-3.5 h-3.5" />
                    {child.name}
                  </Link>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
