const P: Record<string, React.ReactNode> = {
  musica: <><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></>,
  filmes: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /><path d="M12 9v-1M15 12h1" /></>,
  livros: <><path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z" /><path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z" /></>,
  jogos: <><rect x="2" y="7" width="20" height="11" rx="4" /><path d="M7 11v3M5.5 12.5h3" /><circle cx="16" cy="11.5" r="1" /><circle cx="18" cy="13.5" r="1" /></>,
  fagos: <><path d="M12 2l5 3v5l-5 3-5-3V5z" /><path d="M12 13v5M12 18l-5 4M12 18l5 4M12 18v4" /></>,
  quarto: <><path d="M3 20V9l9-6 9 6v11" /><path d="M7 20v-6h10v6" /><path d="M12 9.5l1.2 1.2-1.2 1.2-1.2-1.2z" /></>,
  comida: <><path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5" /><path d="M17 3c-2 0-3 3-3 6s1 4 3 4v8" /></>,
  vale: <><rect x="3" y="5" width="18" height="14" rx="2" /><rect x="6" y="8" width="5" height="4" rx="1" /><path d="M6 15h12" /></>,
}

export function Icon({ id, size = 26 }: { id: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" aria-hidden="true">
      {P[id]}
    </svg>
  )
}
