# Supabase Schema Source Of Truth

`supabase/schema.sql` is legacy and intentionally blocked from execution.

Use this safe flow:

1. Apply SQL files in `supabase/migrations/` in chronological order.
2. Regenerate DB types after migrations:

```bash
npx supabase gen types typescript --project-id vqunmqtozykwqtmyfjyi > src/lib/database.types.ts
```

3. Treat `src/lib/database.types.ts` as the current typed snapshot.

Do not bootstrap new environments from `supabase/schema.sql`.
