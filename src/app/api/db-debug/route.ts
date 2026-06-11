import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test raw query first
    const rawResult = await db.$queryRaw`SELECT current_schema(), current_database(), inet_server_addr()`;
    
    // Test project query
    const projects = await db.project.findMany();
    
    return NextResponse.json({
      status: 'ok',
      currentSchema: rawResult[0].current_schema,
      currentDb: rawResult[0].current_database,
      projectCount: projects.length,
      projects: projects.map(p => ({ id: p.id, title: p.title }))
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack?.substring(0, 500),
    }, { status: 500 });
  }
}
