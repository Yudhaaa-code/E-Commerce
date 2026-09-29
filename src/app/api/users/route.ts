import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, updateUserRole } from '@/lib/db';

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil data pengguna.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: 'User ID dan role wajib diisi.' },
        { status: 400 }
      );
    }

    if (role !== 'ADMIN' && role !== 'CUSTOMER') {
      return NextResponse.json(
        { success: false, error: 'Role hanya boleh ADMIN atau CUSTOMER.' },
        { status: 400 }
      );
    }

    const result = await updateUserRole(userId, role);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || 'Gagal mengubah role pengguna.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Role berhasil diubah menjadi ${role}.`,
      user: result.user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
