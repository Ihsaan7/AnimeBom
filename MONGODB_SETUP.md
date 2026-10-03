# MongoDB Setup Guide for AnimeBom (Vercel)

This application has been migrated from Supabase to **MongoDB** (with Mongoose and JWT authentication).

---

## 1. What to REMOVE from Vercel Environment Variables:

Go to your **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**, and delete:
- ❌ `NEXT_PUBLIC_SUPABASE_URL`
- ❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. What to ADD to Vercel Environment Variables:

Add the following two environment variables:

| Variable | Description | Example |
| :--- | :--- | :--- |
| **`MONGODB_URI`** | Your MongoDB connection string (from MongoDB Atlas) | `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/animebom?retryWrites=true&w=majority` |
| **`JWT_SECRET`** | Secret key for signing authentication tokens | `your-secret-random-jwt-string-here` |

---

## 3. How to get your free MongoDB Atlas URI (if you don't have one):

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a database user (username and password).
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere) so Vercel serverless functions can connect.
5. In your cluster dashboard, click **Connect** → **Drivers** (Node.js).
6. Copy the connection string, replace `<password>` with your database user password, and set it as `MONGODB_URI` on Vercel.

---

## 4. Redeploy

After setting the environment variables in Vercel:
1. Go to the **Deployments** tab on Vercel.
2. Click **Redeploy** on the latest deployment (or push a new commit).
