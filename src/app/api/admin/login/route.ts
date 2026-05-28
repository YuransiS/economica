import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMINS = [
  { username: 'Yuransis', password: '56780156Yura', sessionVal: 'authenticated_yuransis' },
  { username: 'anya-koorator', password: 'fh1`lkfdmcwS5', sessionVal: 'authenticated_anya_koorator' },
];

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const matchedAdmin = ADMINS.find(
      (admin) => admin.username.toLowerCase() === username?.trim().toLowerCase() && admin.password === password
    );

    if (matchedAdmin) {
      const cookieStore = await cookies();
      
      // Set a simple session cookie using standard Next.js cookies API
      cookieStore.set('admin_session', matchedAdmin.sessionVal, {
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
