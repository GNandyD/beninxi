# BéninXi Mobile

Application mobile Expo pour le marketplace BéninXi.

## Démarrage

```bash
cd mobile
npm install
npm run start
```

Copie `.env.example` vers `.env` puis renseigne les variables Supabase si tu veux charger les vrais produits:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_KKIAPAY_PUBLIC_KEY=your-kkiapay-public-key
EXPO_PUBLIC_KKIAPAY_SANDBOX=true
```

Sans Supabase, l'app affiche un catalogue démo avec les catégories clés pour le Bénin: smartphones, pagnes, vêtements, chaussures, meubles, montres et bijoux.

Le paiement mobile passe uniquement par Kkiapay. `EXPO_PUBLIC_API_BASE_URL` doit pointer vers l'app Next.js pour créer les commandes et lier les transactions Kkiapay.
