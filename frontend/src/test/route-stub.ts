import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';

type Params = Record<string, string | number | boolean | null | undefined | Array<string | number | boolean>>;

export class ActivatedRouteStub {
  private paramsSubject = new BehaviorSubject<Params>({});
  private queryParamsSubject = new BehaviorSubject<Params>({});
  private paramMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap({}));
  private queryParamMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap({}));

  readonly params: Observable<Params> = this.paramsSubject.asObservable();
  readonly queryParams: Observable<Params> = this.queryParamsSubject.asObservable();
  readonly paramMap: Observable<ParamMap> = this.paramMapSubject.asObservable();
  readonly queryParamMap: Observable<ParamMap> = this.queryParamMapSubject.asObservable();
  readonly fragment: Observable<string | null> = of(null);
  readonly data: Observable<Record<string, unknown>> = of({});
  readonly title: Observable<string | undefined> = of(undefined);
  readonly url: Observable<Array<unknown>> = of([]);

  snapshot: ActivatedRoute['snapshot'] = {
    params: this.paramsSubject.value,
    queryParams: this.queryParamsSubject.value,
    paramMap: convertToParamMap(this.paramsSubject.value),
    queryParamMap: convertToParamMap(this.queryParamsSubject.value),
    fragment: null,
    data: {},
    title: undefined,
    url: []
  } as unknown as ActivatedRoute['snapshot'];

  setParam(key: string, value: Params[keyof Params]) {
    this.updateParams({ ...this.paramsSubject.value, [key]: value });
  }

  setQueryParam(key: string, value: Params[keyof Params]) {
    this.updateQueryParams({ ...this.queryParamsSubject.value, [key]: value });
  }

  setParams(params: Params) {
    this.updateParams(params);
  }

  setQueryParams(params: Params) {
    this.updateQueryParams(params);
  }

  private updateParams(params: Params) {
    this.paramsSubject.next(params);
    this.paramMapSubject.next(convertToParamMap(params));
    this.snapshot = {
      ...this.snapshot,
      params,
      paramMap: convertToParamMap(params)
    } as unknown as ActivatedRoute['snapshot'];
  }

  private updateQueryParams(params: Params) {
    this.queryParamsSubject.next(params);
    this.queryParamMapSubject.next(convertToParamMap(params));
    this.snapshot = {
      ...this.snapshot,
      queryParams: params,
      queryParamMap: convertToParamMap(params)
    } as unknown as ActivatedRoute['snapshot'];
  }
}

export function stubRoute(options?: { params?: Params; queryParams?: Params }) {
  const route = new ActivatedRouteStub();
  if (options?.params) {
    route.setParams(options.params);
  }
  if (options?.queryParams) {
    route.setQueryParams(options.queryParams);
  }
  return route;
}
