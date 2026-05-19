create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  customer_name text,
  email text,
  property_address text,
  city_state_zip text,
  package_type text,
  price_cents integer,
  status text default 'pending_payment',
  payment_status text default 'unpaid',
  stripe_session_id text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists order_photos (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  file_url text not null,
  file_type text,
  uploaded_by text,
  created_at timestamptz default now()
);

create table if not exists photo_edit_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  order_id uuid null references orders(id) on delete set null,
  original_photo_url text,
  edited_photo_url text,
  edit_type text,
  prompt text,
  status text default 'queued',
  created_at timestamptz default now()
);

create table if not exists repair_estimates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  property_address text,
  repair_types jsonb,
  notes text,
  photo_urls jsonb,
  estimate_json jsonb,
  total_low integer,
  total_high integer,
  confidence integer,
  created_at timestamptz default now()
);
