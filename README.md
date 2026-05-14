# Sentinel - My Incident Response App

Hey! This is Sentinel. Its a platform I built to help teams manage security incidents. I tried to make it production-ready and used a multi-tenant setup so different companies can use it on the same DB without seeing each others data.

## What I used (Tech Stack)
- **Frontend**: React with Vite, TypeScript (still learning it lol), Tailwind for styling, and Framer Motion for some cool animations.
- **Backend**: NestJS, Prisma for the DB stuff, and PostgreSQL.
- **Auth**: JWT with tokens and cookies. Its pretty secure I think.
- **Docs**: Swagger is there if you need to see the API endpoints.

## Cool stuff it does
- **Multi-Tenancy**: Basically everyone has a `tenant_id` so data doesnt leak.
- **Managing Incidents**: You can create, assign, and close incidents.
- **Version control**: Used optimistic locking so two people dont edit the same thing at once and break it.
- **Activity Logs**: Keeps track of what everyone is doing.
- **Comments**: You can talk about incidents in a thread.
- **Roles**: Admin, Manager, and regular Users.

## How to get it running

### 1. The Database
- Just make sure you got Postgres installed.
- Create a db called `incident_db`.

### 2. Backend stuff
```bash
cd backend
npm install
# Make sure your .env has the right DATABASE_URL
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

### 3. Frontend stuff
```bash
cd frontend
npm install
npm run dev
```

## How I built it
I used a discriminator column for the multi-tenancy because it was easier than making separate schemas for 1000 users. Every query just filters by `tenant_id` which we get from the JWT. The client doesnt even send the ID, we just pull it from the token on the server.

I also added a `version` column to incidents. If the version you have is old when you try to save, it will give a 409 error. This prevents people from overwriting each other.

## Future Plans (If I have time)
- WebSockets for live updates would be sick.
- File uploads for evidence photos.
- Better search (maybe elasticsearch if I can figure it out).
- SSO for the big companies.

Hope this helps! Let me know if something breaks.
