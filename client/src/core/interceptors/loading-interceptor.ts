import { HttpEvent, HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { BusyService } from '../services/busy-service';
import { delay, finalize, of, tap } from 'rxjs';

const cashe = new Map<string, HttpEvent<unknown>>();

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);

  const generateCacheKey = (url:string, params: HttpParams) : string => {
    const paramString = params.keys().map(key => `${key}=${params.get(key)}`).join('&');
    return paramString ? `${url}?${paramString}` : url;
  }

  const cacheKey = generateCacheKey(req.url, req.params);

  if(req.method === 'GET'){
    const casheResponse = cashe.get(cacheKey);
    if(casheResponse){
      return of(casheResponse);
    }
  }

  busyService.busy();

  return next(req).pipe(
    delay(500),
    tap(response => {
      cashe.set(cacheKey, response)
    }),
    finalize(() => {
      busyService.idle();
    })
  )
};
