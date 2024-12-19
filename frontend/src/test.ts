// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { speculoosMatchers } from 'ngx-speculoos';
import { NgModule, provideExperimentalZonelessChangeDetection } from '@angular/core';

@NgModule({
  providers: [provideExperimentalZonelessChangeDetection()]
})
class TestingModule {}

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment([BrowserDynamicTestingModule, TestingModule], platformBrowserDynamicTesting(), {
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true
});

beforeEach(() => {
  jasmine.addMatchers(speculoosMatchers);
});
