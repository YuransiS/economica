import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_USER = 'Yuransis';
const ADMIN_PASS = '56780156Yura';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const cookieStore = await cookies();
      
      // Set a simple session cookie using standard Next.js cookies API
      cookieStore.set('admin_session', 'authenticated_yuransis', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: 'Невірний логін або пароль' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Помилка сервера' },
      { status: 500 }
    );
  }
}
