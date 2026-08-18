import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import {
  provideHttpClient,
  withInterceptors,
  withXsrfConfiguration,
} from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { routes } from "./app.routes";
import { credentialsInterceptor } from "./interceptors/credentials.interceptor";
import { errorInterceptor } from "./interceptors/error.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([credentialsInterceptor, errorInterceptor]),
      withXsrfConfiguration({
        cookieName: "XSRF-TOKEN",
        headerName: "X-XSRF-TOKEN",
      }),
    ),
    provideAnimationsAsync(),
  ],
};