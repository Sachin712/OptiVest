import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { increment } = await request.json()
    
    if (typeof increment !== 'number') {
      return NextResponse.json({ error: 'Invalid increment value' }, { status: 400 })
    }

    // Get current count
    const { data: currentData, error: fetchError } = await supabase
      .from('user_stats')
      .select('stat_value')
      .eq('stat_name', 'total_users')
      .single()

    if (fetchError) throw fetchError

    const currentCount = currentData?.stat_value || 0
    const newCount = Math.max(0, currentCount + increment)

    // Update count
    const { error: updateError } = await supabase
      .from('user_stats')
      .update({ 
        stat_value: newCount,
        updated_at: new Date().toISOString()
      })
      .eq('stat_name', 'total_users')

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true, 
      newCount,
      previousCount: currentCount 
    })
  } catch (error) {
    console.error('Error updating user count:', error)
    return NextResponse.json({ error: 'Failed to update user count' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('stat_value')
      .eq('stat_name', 'total_users')
      .single()

    if (error) throw error

    return NextResponse.json({ 
      userCount: data?.stat_value || 0 
    })
  } catch (error) {
    console.error('Error fetching user count:', error)
    return NextResponse.json({ error: 'Failed to fetch user count' }, { status: 500 })
  }
}
