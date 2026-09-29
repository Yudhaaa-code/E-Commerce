import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, address, city } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Nama, email, dan password wajib diisi.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password minimal terdiri dari 6 karakter.' },
        { status: 400 }
      );
    }

    const result = await registerUser({
      name,
      email,
      password,
      phone,
      address,
      city,
    });

    if (result.error || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || 'Gagal mendaftar akun.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran akun berhasil!',
      user: result.user,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Terjadi kesalahan saat registrasi.' },
      { status: 500 }
    );
  }
}
