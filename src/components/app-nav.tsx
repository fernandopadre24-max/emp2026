'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, List, BarChart3, Bot } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Visão Geral', icon: Home },
  { href: '/emprestimos', label: 'Empréstimos', icon: List },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/analise-de-credito', label: 'Análise de Crédito', icon: Bot },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
            <Link href={item.href}>
              <item.icon />
              {item.label}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
