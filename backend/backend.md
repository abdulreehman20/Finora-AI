### Project Setup:
- Clone package.json
- bun install
- bunx tsc --init

### Biome Setup:
- bun add -D -E @biomejs/biome
- bunx --bun biome init

### Drizzle ORM & Neon Postgress Setup:
- bun add drizzle-orm pg dotenv
- bun add -D drizzle-kit tsx @types/pg
- bun add neondatabase/serverless
- Create DB Schemas & setup database
- Create drizzle.config.ts file & add required code in this file
- bunx drizzle-kit generate
- bunx drizzle-kit migrate
- bunx drizzle-kit push

### Add BetterAuth for Authentication:
- bun add better-auth
- Generate better-auth secret & add it in .env file (BETTER_AUTH_SECRET)
- Then setup the betterauth Base URL in .env file (BETTER_AUTH_URL=http://localhost:3000 # Base URL of your app)
- Create a file named auth.ts in the src/lib/auth.ts file & add required code in this file
- Configure Database in auth.ts with the help of betterauth & drizzle
- Create a Database Table using betterauth cli commands 
    - bun x auth@latest generate
    - bun x auth@latest migrate
    - bunx drizzle-kit push





<!-- ### Project Setup:
- Clone package.json
- bun install
- bunx tsc --init

### Logging Setup:
- bun add winston 

### Drizzle ORM & Neon Postgress Setup:
- bun add drizzle-orm pg dotenv
- bun add -D drizzle-kit tsx @types/pg
- bun add neondatabase/serverless
- bunx drizzle-kit generate
- bunx drizzle-kit migrate
- bunx drizzle-kit push

### Better-Auth Setup:
- bun add better-auth

### Biome Setup:
- bun add -D -E @biomejs/biome
- bunx --bun biome init

### Husky Setup:
- npm install --save-dev husky
- bunx husky init

### Setup Code Reddit
- 
- 
-  -->