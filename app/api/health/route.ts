import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {} as Record<string, any>,
    responseTime: '',
  };

  try {
    const supabase = await createClient();

    const { error: dbError, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (dbError) {
      healthCheck.services.database = {
        status: 'unhealthy',
        error: dbError.message,
      };
      healthCheck.status = 'degraded';
    } else {
      healthCheck.services.database = {
        status: 'healthy',
        connection: 'established',
        profilesCount: count ?? 0,
      };
    }

    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      healthCheck.services.authentication = {
        status: 'unhealthy',
        error: authError.message,
      };
      healthCheck.status = 'degraded';
    } else {
      healthCheck.services.authentication = {
        status: 'healthy',
        session: !!authData.session,
      };
    }

    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];

    const envStatus = requiredEnvVars.reduce((acc, envVar) => {
      acc[envVar] = {
        configured: !!process.env[envVar],
        value: process.env[envVar] ? '***' + process.env[envVar]!.slice(-4) : undefined,
      };
      return acc;
    }, {} as Record<string, any>);

    healthCheck.services.environment = envStatus;

    healthCheck.services.memory = {
      status: 'healthy',
      usage: process.memoryUsage().heapUsed / 1024 / 1024,
      total: process.memoryUsage().heapTotal / 1024 / 1024,
    };

    const responseTime = Date.now() - startTime;
    healthCheck.responseTime = `${responseTime}ms`;

    const unhealthyServices = Object.values(healthCheck.services).filter(
      (service: any) => service.status === 'unhealthy'
    );

    if (unhealthyServices.length > 0) {
      healthCheck.status =
        unhealthyServices.length === Object.keys(healthCheck.services).length
          ? 'unhealthy'
          : 'degraded';
    }

    const statusCode =
      healthCheck.status === 'healthy' ? 200 :
      healthCheck.status === 'degraded' ? 206 : 503;

    return NextResponse.json(healthCheck, { status: statusCode });
  } catch (error: any) {
    console.error('健康检查失败:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error.message,
        responseTime: `${Date.now() - startTime}ms`,
        services: {
          overall: {
            status: 'unhealthy',
            error: error.message,
          },
        },
      },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { detailed = false, services = [] } = body;

    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      detailed: detailed || services.length > 0,
      checks: {} as Record<string, any>,
    };

    const supabase = await createClient();
    const servicesToCheck = services.length > 0 ? services : ['database', 'auth', 'storage'];

    for (const service of servicesToCheck) {
      switch (service) {
        case 'database': {
          const startDb = Date.now();
          const { error: dbError, count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
          const dbTime = Date.now() - startDb;

          healthCheck.checks.database = {
            status: dbError ? 'unhealthy' : 'healthy',
            responseTime: `${dbTime}ms`,
            error: dbError?.message,
            profilesCount: dbError ? undefined : (count ?? 0),
          };
          break;
        }

        case 'auth': {
          const startAuth = Date.now();
          const { error: authError } = await supabase.auth.getSession();
          const authTime = Date.now() - startAuth;

          healthCheck.checks.auth = {
            status: authError ? 'unhealthy' : 'healthy',
            responseTime: `${authTime}ms`,
            error: authError?.message,
          };
          break;
        }

        case 'storage': {
          const startStorage = Date.now();
          const { error: storageError } = await supabase.storage.listBuckets();
          const storageTime = Date.now() - startStorage;

          healthCheck.checks.storage = {
            status: storageError ? 'unhealthy' : 'healthy',
            responseTime: `${storageTime}ms`,
            error: storageError?.message,
          };
          break;
        }

        case 'realtime': {
          const startRealtime = Date.now();
          healthCheck.checks.realtime = {
            status: 'healthy',
            responseTime: `${Date.now() - startRealtime}ms`,
            note: 'Realtime service check requires WebSocket connection',
          };
          break;
        }
      }
    }

    const failedChecks = Object.values(healthCheck.checks).filter(
      (check: any) => check.status === 'unhealthy'
    );

    if (failedChecks.length > 0) {
      healthCheck.status =
        failedChecks.length === Object.keys(healthCheck.checks).length
          ? 'unhealthy'
          : 'degraded';
    }

    const statusCode =
      healthCheck.status === 'healthy' ? 200 :
      healthCheck.status === 'degraded' ? 206 : 503;

    return NextResponse.json(healthCheck, { status: statusCode });
  } catch (error: any) {
    console.error('详细健康检查失败:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Detailed health check failed',
        message: error.message,
      },
      { status: 503 }
    );
  }
}