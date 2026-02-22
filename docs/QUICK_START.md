# Quick Start Guide - Admin Approval Workflow

## 🚀 Get Started in 5 Minutes

### 1️⃣ Run Database Setup (2 min)

1. Open your Supabase project dashboard (URL from `NEXT_PUBLIC_SUPABASE_URL` in `.env`)
2. Go to **SQL Editor** → **New Query**
3. Copy the contents of `supabase-scripts/01-initial-setup.sql`
4. Paste and click **Run**

### 2️⃣ Configure Email (2 min)

1. In Supabase: **Authentication** → **Email Templates**
2. Scroll to **SMTP Settings** → **Enable Custom SMTP**
3. Enter your SMTP credentials (use your email provider's settings):

   ```
   Host: [your-smtp-host] (e.g., in-v3.mailjet.com for Mailjet)
   Port: 587
   Username: [your-smtp-username/api-key]
   Password: [your-smtp-password/secret-key]
   Sender: [your-sender-email]
   Name: [your-sender-name]
   ```

   **Note:** Get your SMTP credentials from:
   - Mailjet: https://app.mailjet.com/account/apikeys
   - Or use your preferred email provider (SendGrid, Resend, etc.)

4. Save

### 3️⃣ Create Your Admin Account (1 min)

1. Run dev server: `npm run dev`
2. Sign up at `/auth/signup` with your admin email address
3. In Supabase SQL Editor, run (replace `YOUR_EMAIL` with your actual email):

   ```sql
   UPDATE "web-eco_user_profile"
   SET role = 'admin',
       approval_status = 'approved',
       approved_at = CURRENT_TIMESTAMP,
       approved_by = id
   WHERE email = 'YOUR_EMAIL@example.com';
   ```

   **Alternative:** Run the script: `node scripts/create-admin.js YOUR_EMAIL@example.com`

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
- **Supabase Dashboard**: [Your Supabase project URL from `.env`]
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

**Need Help?** → See full documentation in `docs/` folder or check the troubleshooting section above
