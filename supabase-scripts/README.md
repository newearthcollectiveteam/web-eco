# Supabase SQL Scripts

This folder contains helpful SQL scripts for managing your New Earth Collective authentication system.

## 📂 Scripts Overview

| Script                         | Purpose                                   | When to Use                                    |
| ------------------------------ | ----------------------------------------- | ---------------------------------------------- |
| `01-initial-setup.sql`         | Create all tables, triggers, and policies | **Run ONCE** when first setting up the project |
| `02-create-admin.sql`          | Make a user an admin                      | After signing up your first admin account      |
| `03-manually-verify-email.sql` | Manually verify a user's email            | When verification emails aren't working        |
| `04-approve-user.sql`          | Approve a pending user                    | When you want to approve manually via SQL      |
| `05-reject-user.sql`           | Reject a pending user                     | When you want to reject manually via SQL       |
| `06-view-users.sql`            | View and inspect users                    | Anytime you want to see user data              |
| `07-change-user-role.sql`      | Change user roles                         | When promoting/demoting users                  |
| `08-delete-user.sql`           | Permanently delete a user                 | **CAUTION:** Only when necessary               |
| `09-troubleshooting.sql`       | Diagnose setup issues                     | When things aren't working as expected         |
| `10-reset-onboarding.sql`      | Reset onboarding status                   | When a user needs to redo onboarding           |

## 🚀 Quick Start

### First Time Setup:

1. Run `01-initial-setup.sql` in Supabase SQL Editor
2. Sign up for an account via your app
3. Run `02-create-admin.sql` (update with your email)
4. If needed, run `03-manually-verify-email.sql` (update with your email)

### Common Tasks:

**View all users:**

```sql
-- Use queries from 06-view-users.sql
```

**Make someone an admin:**

```sql
-- Use 07-change-user-role.sql
```

**Approve a user manually:**

```sql
-- Use 04-approve-user.sql
```

## 📝 How to Use These Scripts

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the script you need from this folder
6. **Replace placeholder emails/IDs** with actual values
7. Click **Run** (or press Ctrl/Cmd + Enter)

## ⚠️ Important Notes

- **Always replace placeholder values** (like `'your-email@example.com'`) with actual values
- **Test with non-critical data first** when trying a new script
- **Be extra careful with delete operations** - they cannot be undone
- **Run `01-initial-setup.sql` only once** - running it again is safe but unnecessary

## 🆘 Troubleshooting

If something isn't working:

1. Run queries from `09-troubleshooting.sql`
2. Check if tables exist
3. Check if triggers are working
4. Check RLS policies
5. Look for mismatches between `auth.users` and `web-eco_user_profile`

## 🔗 Related Files

- `/supabase-setup.sql` - Original complete setup (same as `01-initial-setup.sql`)
- `/AUTH_SETUP.md` - Detailed authentication setup guide
- `/QUICK_START.md` - Quick start guide

## 💡 Tips

- **Save frequently used queries** as snippets in Supabase SQL Editor
- **Test on staging/dev first** before running in production
- **Keep a backup** of your database before making major changes
- **Document any custom scripts** you create

## 🔐 Security

- These scripts should only be run by **administrators**
- Never share your Supabase credentials
- Be careful with scripts that modify `auth.users` table
- Always verify changes after running scripts
