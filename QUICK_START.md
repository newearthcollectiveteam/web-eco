# Quick Start Guide - Admin Approval Workflow

## 🚀 Get Started in 5 Minutes

### 1️⃣ Run Database Setup (2 min)

1. Open: https://wroehiostvueldeucaze.supabase.co
2. Go to **SQL Editor** → **New Query**
3. Copy entire `supabase-setup.sql` file
4. Paste and click **Run**

### 2️⃣ Configure Email (2 min)

1. In Supabase: **Authentication** → **Email Templates**
2. Scroll to **SMTP Settings** → **Enable Custom SMTP**
3. Enter Mailjet credentials:
   ```
   Host: in-v3.mailjet.com
   Port: 587
   Username: c96e788abe5cdd1eec619781309eb237
   Password: 0b02cf3a4e9b15941f56ade98dd217bd
   Sender: newearthcollectiveteam@gmail.com
   Name: New Earth Collective
   ```
4. Save

### 3️⃣ Create Your Admin Account (1 min)

1. Run dev server: `npm run dev`
2. Sign up at `/auth/signup` with: newearthcollectiveteam@gmail.com
3. In Supabase SQL Editor, run:
   ```sql
   UPDATE "web-eco_user_profile"
   SET role = 'admin',
       approval_status = 'approved',
       approved_at = CURRENT_TIMESTAMP,
       approved_by = id
   WHERE email = 'newearthcollectiveteam@gmail.com';
   ```
4. Check email → Click verification link
5. Complete onboarding

### ✅ Done!

You now have:

- ✅ Site protected behind login + approval
- ✅ Admin dashboard at `/admin/users`
- ✅ Email verification via Mailjet
- ✅ Complete approval workflow

---

## 📋 Daily Workflow

### When New User Signs Up:

1. **User signs up** → Sees "Awaiting Approval" message
2. **You receive notification** (manual check at `/admin/users` for now)
3. **Review user** in Pending Approvals table
4. **Click "Approve"** → User gets verification email
5. **User verifies email** → Completes onboarding → Full access!

---

## 🔗 Important URLs

- **Admin Dashboard**: http://localhost:3000/admin
- **User Management**: http://localhost:3000/admin/users
- **Supabase Dashboard**: https://wroehiostvueldeucaze.supabase.co
- **Login Page**: http://localhost:3000/admin/login

---

## 🆘 Quick Troubleshooting

**User not receiving email?**
→ Check spam folder, verify SMTP settings in Supabase

**Can't access admin dashboard?**
→ Verify `role = 'admin'` in database for your account

**User stuck on pending?**
→ Check `/admin/users` and click Approve

---

## 📚 Full Documentation

- `AUTH_SETUP.md` - Complete setup instructions
- `APPROVAL_WORKFLOW_SUMMARY.md` - Detailed workflow explanation
- `supabase-setup.sql` - Database setup script

---

**Need Help?** → newearthcollectiveteam@gmail.com
