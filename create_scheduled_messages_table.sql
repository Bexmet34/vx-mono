CREATE TABLE IF NOT EXISTS public.scheduled_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_content TEXT NOT NULL,
    ping_everyone BOOLEAN DEFAULT false,
    buttons JSONB DEFAULT '[]'::jsonb,
    schedule_type TEXT NOT NULL CHECK (schedule_type IN ('once', 'recurring')),
    send_time TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) ayarları (Admin yetkisi gerektiriyorsa ayarlanabilir, şimdilik sadece servis rolü için açık bırakılabilir veya tabloya özel RLS eklenebilir)
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

-- Servis rolünün her şeyi yapabilmesi için Policy:
CREATE POLICY "Allow service role all actions on scheduled_messages"
ON public.scheduled_messages
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Veya anonim / authenticated için read/write (Supabase yapınıza göre değişebilir, Veyronix'te genelde Admin yetkisi kontrolü backend'de yapılıyor)
CREATE POLICY "Allow all authenticated users full access"
ON public.scheduled_messages
AS PERMISSIVE
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
