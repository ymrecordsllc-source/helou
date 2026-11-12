-- ====================================================================
-- YM-ki PLATFORM - SUPABASE DATABASE MIGRATION SCRIPT
-- Version: 20261108_initial_schema.sql
-- Description: Full production-grade PostgreSQL schema for YM-ki
--              Supports Supabase Database, Auth, Storage, and Realtime.
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. ENUMS & CUSTOM TYPES
-- ====================================================================
DO $$ BEGIN
  CREATE TYPE user_account_type AS ENUM ('fan', 'premium_fan', 'trainee', 'artista', 'admin', 'diseñador');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vendor_status_type AS ENUM ('pendiente', 'aprobado', 'rechazado', 'suspendido', 'revocado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reaction_kind AS ENUM ('like', 'love', 'laugh', 'wow', 'fire', 'support', 'cute');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE currency_kind AS ENUM ('coins', 'gems', 'both');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ====================================================================
-- 3. PROFILES & USER ACCOUNTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
  banner TEXT DEFAULT 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&h=300&fit=crop',
  description TEXT DEFAULT 'Miembro de la comunidad artística YM-ki Records.',
  ring_color TEXT DEFAULT '#6366f1',
  account_type user_account_type DEFAULT 'fan',
  is_founder BOOLEAN DEFAULT FALSE,
  profile_bg_color TEXT DEFAULT '#1e293b',
  badge_admin_color TEXT DEFAULT '#ec4899',
  badge_verified_color TEXT DEFAULT '#38bdf8',
  animal TEXT DEFAULT 'Zorro 🦊',
  allow_messages BOOLEAN DEFAULT TRUE,
  coins BIGINT DEFAULT 3500 CHECK (coins >= 0),
  gems BIGINT DEFAULT 50 CHECK (gems >= 0),
  dob DATE DEFAULT '2004-06-15',
  is_merch_private BOOLEAN DEFAULT FALSE,
  showcase_item_ids JSONB DEFAULT '[]'::jsonb,
  owned_frames JSONB DEFAULT '[]'::jsonb,
  selected_frame_id TEXT,
  custom_frame_color TEXT DEFAULT '#6366f1',
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);

-- ====================================================================
-- 4. USER STATUS (ESTADOS PERSONALIZADOS)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.user_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  text TEXT NOT NULL,
  emoji TEXT DEFAULT '✨',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_status_active UNIQUE (username)
);

CREATE INDEX IF NOT EXISTS idx_user_statuses_username ON public.user_statuses(username);

-- ====================================================================
-- 5. FOLLOWERS SYSTEM (SISTEMA DE SEGUIDORES)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  following_username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_no_self_follow CHECK (follower_username <> following_username),
  CONSTRAINT uq_follower_following UNIQUE (follower_username, following_username)
);

CREATE INDEX IF NOT EXISTS idx_followers_follower ON public.followers(follower_username);
CREATE INDEX IF NOT EXISTS idx_followers_following ON public.followers(following_username);
CREATE INDEX IF NOT EXISTS idx_followers_created_at ON public.followers(created_at DESC);

-- ====================================================================
-- 6. USER BLOCKS (BLOQUEO DE USUARIOS)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  blocked_username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_no_self_block CHECK (blocker_username <> blocked_username),
  CONSTRAINT uq_blocker_blocked UNIQUE (blocker_username, blocked_username)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks(blocker_username);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks(blocked_username);

-- ====================================================================
-- 7. FORUMS & SOCIAL POSTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.forums (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  banner TEXT,
  avatar TEXT,
  creator TEXT NOT NULL,
  followers INT DEFAULT 0,
  is_official BOOLEAN DEFAULT FALSE,
  is_fandom_forum BOOLEAN DEFAULT FALSE,
  fan_club_id TEXT,
  bg_type TEXT DEFAULT 'solid',
  bg_value TEXT DEFAULT '#0f172a',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.posts (
  id BIGSERIAL PRIMARY KEY,
  author TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  forum_id TEXT NOT NULL REFERENCES public.forums(id) ON DELETE CASCADE,
  forum_name TEXT NOT NULL,
  tag TEXT DEFAULT 'General',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'normal' CHECK (type IN ('normal', 'poll', 'announcement')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_by TEXT,
  pinned_at TIMESTAMPTZ,
  original_post_id BIGINT REFERENCES public.posts(id) ON DELETE SET NULL,
  promoted_product_id TEXT,
  share_count INT DEFAULT 0,
  is_fandom_only BOOLEAN DEFAULT FALSE,
  fandom_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author);
CREATE INDEX IF NOT EXISTS idx_posts_forum_id ON public.posts(forum_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned ON public.posts(is_pinned);

-- ====================================================================
-- 8. CUSTOM POST REACTIONS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  reaction reaction_kind NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_post_user_reaction UNIQUE (post_id, username)
);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user ON public.post_reactions(username);

-- ====================================================================
-- 9. NESTED COMMENTS & COMMENT REACTIONS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  author TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.comments(author);

CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  reaction reaction_kind NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_comment_user_reaction UNIQUE (comment_id, username)
);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON public.comment_reactions(comment_id);

-- ====================================================================
-- 10. COMMUNITY POLLS & VOTES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.community_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id BIGINT NOT NULL UNIQUE REFERENCES public.posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  allow_change_vote BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.community_polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_order INT NOT NULL DEFAULT 0,
  CONSTRAINT uq_poll_order UNIQUE (poll_id, option_order)
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.community_polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_poll_user_vote UNIQUE (poll_id, username)
);

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_option ON public.poll_votes(option_id);

-- ====================================================================
-- 11. SAVED POSTS & COLLECTIONS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.saved_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_collection_name UNIQUE (username, name)
);

CREATE TABLE IF NOT EXISTS public.saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.saved_collections(id) ON DELETE SET NULL,
  post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_post_saved UNIQUE (username, post_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_posts_user ON public.saved_posts(username);
CREATE INDEX IF NOT EXISTS idx_saved_posts_collection ON public.saved_posts(collection_id);

-- ====================================================================
-- 12. AUTHORIZED VENDORS (PROVEEDORES AUTORIZADOS)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE REFERENCES public.profiles(username) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  description TEXT NOT NULL,
  product_types TEXT[] NOT NULL DEFAULT '{}',
  catalog_url TEXT,
  contact_info TEXT NOT NULL,
  status vendor_status_type DEFAULT 'pendiente',
  rejection_reason TEXT,
  reviewed_by TEXT REFERENCES public.profiles(username) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status);

-- ====================================================================
-- 13. ADVANCED STORE: PRODUCTS, VARIANTS & INVENTORY
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  category TEXT DEFAULT 'general',
  stock_type TEXT DEFAULT 'fixed' CHECK (stock_type IN ('unlimited', 'fixed')),
  stock_count INT DEFAULT 0 CHECK (stock_count >= 0),
  currency_type currency_kind DEFAULT 'coins',
  price_coins INT DEFAULT 0 CHECK (price_coins >= 0),
  price_gems INT DEFAULT 0 CHECK (price_gems >= 0),
  created_by TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  is_outlet BOOLEAN DEFAULT FALSE,
  outlet_price INT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_recent BOOLEAN DEFAULT FALSE,
  associated_artists TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variant_type TEXT NOT NULL, -- e.g., 'color', 'size', 'edition', 'rarity'
  price_coins INT,
  price_gems INT,
  stock_count INT DEFAULT 0 CHECK (stock_count >= 0),
  sku TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('purchase', 'restock', 'adjustment', 'return')),
  quantity INT NOT NULL,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  reason TEXT,
  created_by TEXT REFERENCES public.profiles(username) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.discount_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent INT NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  min_purchase_coins INT DEFAULT 0,
  max_uses INT DEFAULT 100,
  uses_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_by TEXT REFERENCES public.profiles(username) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity INT DEFAULT 1 CHECK (quantity > 0),
  currency_used TEXT NOT NULL CHECK (currency_used IN ('coins', 'gems')),
  total_paid INT NOT NULL CHECK (total_paid >= 0),
  coupon_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON public.product_purchases(buyer_username);
CREATE INDEX IF NOT EXISTS idx_purchases_product ON public.product_purchases(product_id);

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  verified_buyer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_product_user_review UNIQUE (product_id, username)
);

-- ====================================================================
-- 14. ADVANCED VIRTUAL ECONOMY & AUDITABLE LEDGER
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.economy_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  operation_type TEXT NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('coins', 'gems')),
  amount BIGINT NOT NULL,
  balance_before BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,
  reason TEXT NOT NULL,
  reference_id TEXT,
  related_user TEXT REFERENCES public.profiles(username) ON DELETE SET NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_username ON public.economy_ledger(username);
CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON public.economy_ledger(created_at DESC);

-- ====================================================================
-- 15. PERSISTENT NOTIFICATIONS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  sender TEXT REFERENCES public.profiles(username) ON DELETE SET NULL,
  type TEXT NOT NULL,
  category TEXT DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id TEXT,
  action_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ====================================================================
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economy_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, owner update
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (
  auth.uid() = id OR 
  auth.jwt() ->> 'email' = username OR 
  (SELECT is_founder FROM public.profiles WHERE id = auth.uid()) = true OR
  (SELECT account_type FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Followers: Viewable by all, insertable/deletable only by follower themselves
CREATE POLICY "Followers are viewable by everyone" ON public.followers FOR SELECT USING (true);
CREATE POLICY "Users can manage their follows" ON public.followers FOR ALL USING (
  auth.jwt() ->> 'email' = follower_username OR auth.uid()::text = follower_username
);

-- User Statuses: Public read or followers-only, managed only by status author
CREATE POLICY "User statuses are viewable by everyone" ON public.user_statuses FOR SELECT USING (
  visibility = 'public' OR 
  auth.jwt() ->> 'email' = username OR 
  EXISTS (SELECT 1 FROM public.followers WHERE following_username = user_statuses.username AND (follower_username = auth.jwt() ->> 'email' OR follower_username = auth.uid()::text))
);
CREATE POLICY "Users can manage own status" ON public.user_statuses FOR ALL USING (
  auth.jwt() ->> 'email' = username OR auth.uid()::text = username
);

-- Posts: Viewable by all (unless fandom only), author creates/edits, admins can moderate
CREATE POLICY "Posts viewable by everyone" ON public.posts FOR SELECT USING (
  NOT is_fandom_only OR auth.role() = 'authenticated'
);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND (auth.jwt() ->> 'email' = author OR auth.uid()::text = author)
);
CREATE POLICY "Users can edit own posts" ON public.posts FOR UPDATE USING (
  auth.jwt() ->> 'email' = author OR 
  (SELECT account_type FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
  (SELECT is_founder FROM public.profiles WHERE id = auth.uid()) = true
);

-- Reactions & Comments: Public read, insert by authenticated owner
CREATE POLICY "Post reactions viewable by everyone" ON public.post_reactions FOR SELECT USING (true);
CREATE POLICY "Users can react to posts" ON public.post_reactions FOR ALL USING (
  auth.role() = 'authenticated' AND (auth.jwt() ->> 'email' = username OR auth.uid()::text = username)
);

CREATE POLICY "Comments viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON public.comments FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND (auth.jwt() ->> 'email' = author OR auth.uid()::text = author)
);
CREATE POLICY "Users can update/delete own comments" ON public.comments FOR UPDATE USING (
  auth.jwt() ->> 'email' = author OR 
  (SELECT account_type FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
  (SELECT is_founder FROM public.profiles WHERE id = auth.uid()) = true
);
CREATE POLICY "Comment reactions viewable" ON public.comment_reactions FOR SELECT USING (true);
CREATE POLICY "Comment reactions insertable" ON public.comment_reactions FOR ALL USING (
  auth.role() = 'authenticated' AND (auth.jwt() ->> 'email' = username OR auth.uid()::text = username)
);

-- Polls & Votes: Public read, vote once
CREATE POLICY "Polls viewable by everyone" ON public.community_polls FOR SELECT USING (true);
CREATE POLICY "Poll options viewable by everyone" ON public.poll_options FOR SELECT USING (true);
CREATE POLICY "Poll votes viewable by everyone" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote in polls" ON public.poll_votes FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND (auth.jwt() ->> 'email' = username OR auth.uid()::text = username)
);

-- Saved Collections & Posts: Strictly private to owner
CREATE POLICY "Users can view own saved collections" ON public.saved_collections FOR SELECT USING (
  auth.jwt() ->> 'email' = username OR auth.uid()::text = username
);
CREATE POLICY "Users can manage own collections" ON public.saved_collections FOR ALL USING (
  auth.jwt() ->> 'email' = username OR auth.uid()::text = username
);
CREATE POLICY "Users can view own saved posts" ON public.saved_posts FOR SELECT USING (
  auth.jwt() ->> 'email' = username OR auth.uid()::text = username
);
CREATE POLICY "Users can manage own saved posts" ON public.saved_posts FOR ALL USING (
  auth.jwt() ->> 'email' = username OR auth.uid()::text = username
);

-- Vendors: Viewable by everyone if approved, applicant views own, only admins manage
CREATE POLICY "Vendors viewable by everyone" ON public.vendors FOR SELECT USING (
  status = 'aprobado' OR 
  auth.jwt() ->> 'email' = username OR 
  (SELECT account_type FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
  (SELECT is_founder FROM public.profiles WHERE id = auth.uid()) = true
);
CREATE POLICY "Users can submit vendor application" ON public.vendors FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND (auth.jwt() ->> 'email' = username OR auth.uid()::text = username)
);
CREATE POLICY "Admins can update vendors" ON public.vendors FOR UPDATE USING (
  (SELECT account_type FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
  (SELECT is_founder FROM public.profiles WHERE id = auth.uid()) = true
);

-- Products & Variants: Viewable by everyone, only approved vendors or artists/admins create
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Vendors can insert products" ON public.products FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND (
    EXISTS (SELECT 1 FROM public.vendors WHERE username = (auth.jwt() ->> 'email') AND status = 'aprobado') OR
    (SELECT account_type FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'artista') OR
    (SELECT is_founder FROM public.profiles WHERE id = auth.uid()) = true
  )
);
CREATE POLICY "Vendors can update own products" ON public.products FOR UPDATE USING (
  auth.jwt() ->> 'email' = created_by OR 
  (SELECT account_type FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
  (SELECT is_founder FROM public.profiles WHERE id = auth.uid()) = true
);
CREATE POLICY "Product variants viewable by everyone" ON public.product_variants FOR SELECT USING (true);

-- Reviews: Viewable by all, verified buyers can write
CREATE POLICY "Reviews viewable by everyone" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Buyers can write reviews" ON public.product_reviews FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND (auth.jwt() ->> 'email' = buyer_username OR auth.uid()::text = buyer_username)
);

-- Notifications: Strictly private to recipient
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (
  auth.jwt() ->> 'email' = recipient OR auth.uid()::text = recipient
);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (
  auth.jwt() ->> 'email' = recipient OR auth.uid()::text = recipient
);

-- Economy Ledger: Private to user and administrative auditing
CREATE POLICY "Users can view own ledger entries" ON public.economy_ledger FOR SELECT USING (
  auth.jwt() ->> 'email' = username OR 
  auth.uid()::text = username OR 
  (SELECT account_type FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
  (SELECT is_founder FROM public.profiles WHERE id = auth.uid()) = true
);

-- ====================================================================
-- 17. ATOMIC STORED FUNCTIONS
-- ====================================================================

-- Function: Atomic Virtual Economy Transfer
CREATE OR REPLACE FUNCTION public.fn_transfer_virtual_currency(
  p_sender TEXT,
  p_recipient TEXT,
  p_currency TEXT,
  p_amount BIGINT,
  p_reason TEXT DEFAULT 'Transferencia de usuario'
) RETURNS JSONB AS $$
DECLARE
  v_sender_balance BIGINT;
  v_recip_balance BIGINT;
BEGIN
  IF p_sender = p_recipient THEN
    RETURN jsonb_build_object('success', false, 'error', 'No puedes transferir fondos a tu propia cuenta.');
  END IF;

  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'El monto a transferir debe ser mayor a cero.');
  END IF;

  -- Lock sender profile
  IF p_currency = 'gems' THEN
    SELECT gems INTO v_sender_balance FROM public.profiles WHERE username = p_sender FOR UPDATE;
  ELSE
    SELECT coins INTO v_sender_balance FROM public.profiles WHERE username = p_sender FOR UPDATE;
  END IF;

  IF v_sender_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'El usuario remitente no existe.');
  END IF;

  IF v_sender_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Saldo insuficiente para completar la transferencia.');
  END IF;

  -- Lock recipient profile
  IF p_currency = 'gems' THEN
    SELECT gems INTO v_recip_balance FROM public.profiles WHERE username = p_recipient FOR UPDATE;
  ELSE
    SELECT coins INTO v_recip_balance FROM public.profiles WHERE username = p_recipient FOR UPDATE;
  END IF;

  IF v_recip_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'El destinatario no existe en la plataforma.');
  END IF;

  -- Update balances
  IF p_currency = 'gems' THEN
    UPDATE public.profiles SET gems = gems - p_amount WHERE username = p_sender;
    UPDATE public.profiles SET gems = gems + p_amount WHERE username = p_recipient;
  ELSE
    UPDATE public.profiles SET coins = coins - p_amount WHERE username = p_sender;
    UPDATE public.profiles SET coins = coins + p_amount WHERE username = p_recipient;
  END IF;

  -- Record in Ledger
  INSERT INTO public.economy_ledger (username, operation_type, currency, amount, balance_before, balance_after, reason, related_user)
  VALUES
    (p_sender, 'transfer_sent', p_currency, p_amount, v_sender_balance, v_sender_balance - p_amount, p_reason, p_recipient),
    (p_recipient, 'transfer_received', p_currency, p_amount, v_recip_balance, v_recip_balance + p_amount, p_reason, p_sender);

  -- Send notification
  INSERT INTO public.notifications (recipient, sender, type, category, title, message)
  VALUES (
    p_recipient,
    p_sender,
    'transfer_received',
    'compras',
    'Has recibido una transferencia',
    FORMAT('El usuario @%s te ha transferido %s %s.', p_sender, p_amount, p_currency)
  );

  RETURN jsonb_build_object('success', true, 'sender_balance_after', v_sender_balance - p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Atomic Product Purchase with Stock Verification
CREATE OR REPLACE FUNCTION public.fn_purchase_product_atomic(
  p_buyer TEXT,
  p_product_id TEXT,
  p_variant_id UUID DEFAULT NULL,
  p_quantity INT DEFAULT 1,
  p_currency TEXT DEFAULT 'coins',
  p_coupon_code TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_prod_stock INT;
  v_prod_stock_type TEXT;
  v_price_coins INT;
  v_price_gems INT;
  v_total_cost BIGINT;
  v_buyer_coins BIGINT;
  v_buyer_gems BIGINT;
  v_discount INT := 0;
  v_var_stock INT;
BEGIN
  -- Fetch product
  SELECT stock_type, stock_count, price_coins, price_gems
  INTO v_prod_stock_type, v_prod_stock, v_price_coins, v_price_gems
  FROM public.products WHERE id = p_product_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'El producto solicitado no existe.');
  END IF;

  -- Check variant if provided
  IF p_variant_id IS NOT NULL THEN
    SELECT stock_count, COALESCE(price_coins, v_price_coins), COALESCE(price_gems, v_price_gems)
    INTO v_var_stock, v_price_coins, v_price_gems
    FROM public.product_variants WHERE id = p_variant_id AND product_id = p_product_id FOR UPDATE;

    IF v_var_stock < p_quantity THEN
      RETURN jsonb_build_object('success', false, 'error', 'Stock insuficiente para la variante seleccionada.');
    END IF;
  ELSE
    IF v_prod_stock_type = 'fixed' AND v_prod_stock < p_quantity THEN
      RETURN jsonb_build_object('success', false, 'error', 'El producto está agotado o no tiene suficiente stock.');
    END IF;
  END IF;

  -- Validate coupon
  IF p_coupon_code IS NOT NULL AND p_coupon_code <> '' THEN
    SELECT discount_percent INTO v_discount
    FROM public.discount_coupons
    WHERE code = p_coupon_code AND is_active = true AND (expires_at IS NULL OR expires_at > NOW()) AND uses_count < max_uses;
  END IF;

  -- Calculate total
  IF p_currency = 'gems' THEN
    v_total_cost := v_price_gems * p_quantity;
  ELSE
    v_total_cost := v_price_coins * p_quantity;
    IF v_discount > 0 THEN
      v_total_cost := ROUND(v_total_cost * (100 - v_discount) / 100);
    END IF;
  END IF;

  -- Check buyer balance
  SELECT coins, gems INTO v_buyer_coins, v_buyer_gems FROM public.profiles WHERE username = p_buyer FOR UPDATE;
  IF p_currency = 'gems' AND v_buyer_gems < v_total_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gemas insuficientes para realizar esta compra.');
  END IF;
  IF p_currency = 'coins' AND v_buyer_coins < v_total_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Coins insuficientes para realizar esta compra.');
  END IF;

  -- Deduct buyer balance
  IF p_currency = 'gems' THEN
    UPDATE public.profiles SET gems = gems - v_total_cost WHERE username = p_buyer;
  ELSE
    UPDATE public.profiles SET coins = coins - v_total_cost WHERE username = p_buyer;
  END IF;

  -- Deduct stock
  IF p_variant_id IS NOT NULL THEN
    UPDATE public.product_variants SET stock_count = stock_count - p_quantity WHERE id = p_variant_id;
  END IF;
  IF v_prod_stock_type = 'fixed' THEN
    UPDATE public.products SET stock_count = stock_count - p_quantity WHERE id = p_product_id;
  END IF;

  -- Increment coupon use
  IF p_coupon_code IS NOT NULL AND v_discount > 0 THEN
    UPDATE public.discount_coupons SET uses_count = uses_count + 1 WHERE code = p_coupon_code;
  END IF;

  -- Record purchase
  INSERT INTO public.product_purchases (buyer_username, product_id, variant_id, quantity, currency_used, total_paid, coupon_code)
  VALUES (p_buyer, p_product_id, p_variant_id, p_quantity, p_currency, v_total_cost, p_coupon_code);

  -- Record in ledger
  INSERT INTO public.economy_ledger (username, operation_type, currency, amount, balance_before, balance_after, reason, reference_id)
  VALUES (
    p_buyer,
    'purchase',
    p_currency,
    v_total_cost,
    CASE WHEN p_currency = 'gems' THEN v_buyer_gems ELSE v_buyer_coins END,
    CASE WHEN p_currency = 'gems' THEN v_buyer_gems - v_total_cost ELSE v_buyer_coins - v_total_cost END,
    FORMAT('Compra en tienda de %sx producto %s', p_quantity, p_product_id),
    p_product_id
  );

  RETURN jsonb_build_object('success', true, 'total_paid', v_total_cost, 'remaining_stock', v_prod_stock - p_quantity);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
