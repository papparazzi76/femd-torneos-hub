-- Add 'mesa' role to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mesa';

-- Add referee_user_id column to matches table
ALTER TABLE public.matches
ADD COLUMN referee_user_id uuid REFERENCES auth.users(id);

-- Drop existing RLS policies for matches to recreate them with new logic
DROP POLICY IF EXISTS "Authenticated users can update matches" ON public.matches;
DROP POLICY IF EXISTS "Authenticated users can delete matches" ON public.matches;

-- Recreate update policy: Admins can update any match, mesas can only update their assigned matches
CREATE POLICY "Admins and assigned mesas can update matches"
ON public.matches
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  (public.has_role(auth.uid(), 'mesa') AND referee_user_id = auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  (public.has_role(auth.uid(), 'mesa') AND referee_user_id = auth.uid())
);

-- Recreate delete policy: Only admins can delete matches
CREATE POLICY "Only admins can delete matches"
ON public.matches
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Keep insert policy for admins only
DROP POLICY IF EXISTS "Authenticated users can insert matches" ON public.matches;
CREATE POLICY "Only admins can insert matches"
ON public.matches
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));