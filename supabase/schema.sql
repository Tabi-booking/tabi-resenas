-- Tabi Review — schema for Supabase (PostgreSQL)
-- Run in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS public.resenas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL,
  calificacion INTEGER CHECK (calificacion IS NULL OR calificacion BETWEEN 1 AND 5),
  comentario TEXT,
  meseros TEXT,
  ocasion JSONB,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migration for databases created with the original schema (NOT NULL calificacion/comentario)
ALTER TABLE public.resenas ALTER COLUMN calificacion DROP NOT NULL;
ALTER TABLE public.resenas ALTER COLUMN comentario DROP NOT NULL;

ALTER TABLE public.resenas ENABLE ROW LEVEL SECURITY;

-- Service role key bypasses RLS; no public policies needed for server-side access.
