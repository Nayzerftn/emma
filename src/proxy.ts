import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

/**
 * Garde d'accès du back-office. (Next 16 : middleware → proxy, runtime Node.)
 * Vérification optimiste basée sur la session cookie ; la vérification
 * « admin » sérieuse (table admins) est refaite dans le layout protégé.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!env.supabaseUrl || !env.supabaseAnonKey) return response;

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Sessions présentes mais non autorisées (ex. prof sur /admin, admin sur /prof) :
  // on ne redirige PAS les pages login vers le dashboard (sinon boucle infinie
  // avec la vérif de rôle du layout). On gate juste l'accès non authentifié.
  const isAdminLogin = path.startsWith("/admin/login");
  if (path.startsWith("/admin") && !isAdminLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  const isProfLogin = path.startsWith("/prof/login");
  if (path.startsWith("/prof") && !isProfLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/prof/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/prof/:path*"],
};
