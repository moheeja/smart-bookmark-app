# Smart Bookmark App

[

A modern, realtime bookmark manager built with **Next.js 14**, **Supabase Auth + Database**, and **Tailwind CSS**. Secure Google OAuth login, realtime updates, and responsive design.

## ✨ Features

- 🔐 **Google OAuth** login/logout
- 📱 **Fully responsive** design (mobile + desktop)
- ⚡ **Realtime bookmarks** (add/delete updates across tabs)
- 🛡️ **User isolation** (each user sees only their bookmarks)
- 🚀 **Production ready** (Vercel + Supabase)
- 💾 **Auto HTTPS** for bookmark URLs

## 🛠 Tech Stack

| Frontend | Backend | Database | Styling | Deployment |
|----------|---------|----------|---------|------------|
| Next.js 14 App Router | Supabase Auth | Supabase Postgres | Tailwind CSS | Vercel |
| React Hooks | Supabase Realtime | RLS Security | | |

## 🚀 Quick Start

### 1. Deploy (2 minutes)
```
Click "Deploy" button above → connect GitHub → done!
```

### 2. Setup Supabase (5 minutes)
```
1. supabase.com → New Project
2. Authentication → Providers → Enable Google OAuth
3. URL Configuration:
   Site URL: https://your-app.vercel.app
   Redirect URLs: https://your-app.vercel.app/**
4. Database → Table Editor → Create "bookmarks":
   ```sql
   id: uuid (PK)
   title: text
   url: text  
   user_id: uuid (FK → auth.users)
   created_at: timestamptz (default now())
   ```
```

### 3. Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📁 Project Structure

```
app/
├── page.tsx           # Home (Google login)
├── dashboard/         # Protected dashboard
│   └── page.tsx
└── globals.css        # Tailwind
supabase/
└── client.ts          # Supabase client
```

## 🔧 Key Code Highlights

### Google OAuth (app/page.tsx)
```tsx
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: "https://your-app.vercel.app/dashboard" }
});
```

### Protected Dashboard (app/dashboard/page.tsx)
```tsx
useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    if (!data.user) router.push("/");
  });
}, []);
```

### Realtime Bookmarks
```tsx
supabase.channel("realtime-bookmarks")
  .on("postgres_changes", { event: "*", table: "bookmarks" }, () => fetchBookmarks())
  .subscribe();
```

## 🧪 Local Development

```
npm install
npm run dev
# http://localhost:3000
```

## 🔒 Security

- **Row Level Security (RLS)**: Users only see their bookmarks
- **Google OAuth**: Secure third-party auth
- **HTTPS enforced**: All bookmark URLs normalized
- **Client-side validation**: Input sanitization

## 📱 Screenshots

| Home | Dashboard | Empty State |
|------|-----------|-------------|
|  |  |  |

## 🎯 Future Features

- [ ] Bookmark editing
- [ ] Categories/tags
- [ ] Search/filter
- [ ] Export/Import
- [ ] PWA support

## 🙌 Contributing

```
1. Fork repository
2. Create feature branch  
3. npm install && npm run dev
4. Commit changes
5. Push + PR
```

## 📄 License

MIT License - use for anything!

***

**Live Demo:** https://smart-bookmark-app.vercel.app/#

**Made with ❤️ using Next.js + Supabase**

***

**Copy this into `README.md`** → `git add . && git push` → perfect GitHub repo! 🚀
