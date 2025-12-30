'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function NavLink({ href, icon: Icon, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200',
        isActive
          ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
      <span>{children}</span>
    </Link>
  );
}

