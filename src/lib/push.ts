// src/lib/push.ts
// Registers the device for push notifications via Capacitor.
// Call registerForPush() after login. No-op on web (only runs in the native app).

import { createClient } from '@/lib/supabase'

export async function registerForPush() {
  // Only run inside the Capacitor native app
  if (typeof window === 'undefined') return
  const Capacitor = (window as any).Capacitor
  if (!Capacitor?.isNativePlatform?.()) return

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')

    // Ask permission
    let perm = await PushNotifications.checkPermissions()
    if (perm.receive === 'prompt') {
      perm = await PushNotifications.requestPermissions()
    }
    if (perm.receive !== 'granted') return

    await PushNotifications.register()

    // When we get a token, save it to Supabase
    PushNotifications.addListener('registration', async (token: any) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('push_tokens').upsert(
        { user_id: user.id, token: token.value, platform: Capacitor.getPlatform() },
        { onConflict: 'token' }
      )
    })

    // Tapping a notification opens Today at a Glance
    PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
      const url = action?.notification?.data?.url || '/today'
      window.location.href = url
    })
  } catch (e) {
    console.log('Push registration skipped:', e)
  }
}
