import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Fallback credentials check if DB is offline/paused
    const isDefaultAdmin = trimmedEmail === 'gnaathglobal@gmail.com' && password === 'Gnaathcomm';

    let admin = null;
    try {
      const client = prisma || new (require('@prisma/client').PrismaClient)();
      const adminUserModel = (client as any).adminUser || (client as any).admin_user;

      if (adminUserModel) {
        admin = await adminUserModel.findUnique({
          where: { email: trimmedEmail },
        });
      }
    } catch (dbErr: any) {
      console.warn('Database offline during admin login, checking default admin fallback:', dbErr?.message);
    }

    if (admin) {
      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return NextResponse.json({ success: false, error: 'Invalid admin credentials' }, { status: 401 });
      }

      await createAdminSession({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      });

      return NextResponse.json({
        success: true,
        admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      });
    }

    // Fallback check
    if (isDefaultAdmin) {
      const fallbackPayload = {
        id: 'default-admin-id',
        email: 'gnaathglobal@gmail.com',
        name: 'G Naath Admin',
        role: 'ADMIN',
      };

      await createAdminSession(fallbackPayload);

      return NextResponse.json({
        success: true,
        admin: fallbackPayload,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid admin credentials' }, { status: 401 });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Login failed' }, { status: 500 });
  }
}
