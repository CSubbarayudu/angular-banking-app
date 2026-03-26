import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'accounts/:id',
    renderMode: RenderMode.Client  // render dynamically in browser, not pre-built
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];