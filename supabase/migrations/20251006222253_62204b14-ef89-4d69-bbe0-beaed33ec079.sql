-- Add admin role for the first user
INSERT INTO public.user_roles (user_id, role)
VALUES ('24de8e7f-0789-418c-847c-ed6ea137fab8', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;