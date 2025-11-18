-- Add 'mesa' role to the app_role enum
-- This must be in its own transaction
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mesa';