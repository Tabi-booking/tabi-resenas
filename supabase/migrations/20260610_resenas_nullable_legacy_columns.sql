-- Allow simplified review form (nombre, correo, meseros only)
ALTER TABLE public.resenas ALTER COLUMN calificacion DROP NOT NULL;
ALTER TABLE public.resenas ALTER COLUMN comentario DROP NOT NULL;

ALTER TABLE public.resenas DROP CONSTRAINT IF EXISTS resenas_calificacion_check;
ALTER TABLE public.resenas ADD CONSTRAINT resenas_calificacion_check
  CHECK (calificacion IS NULL OR calificacion BETWEEN 1 AND 5);
