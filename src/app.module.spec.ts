import { Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { AppModule } from './app.module.js';

describe('AppModule', () => {
  it('compiles the root module', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    expect(moduleRef.get(AppModule)).toBeInstanceOf(AppModule);
    await moduleRef.close();
  });
});

describe('test toolchain', () => {
  // Guards ADR 0005/0006: if SWC stops emitting decorator metadata, constructor
  // injection silently breaks. This test fails loudly instead.
  it('resolves constructor-injected dependencies', async () => {
    @Injectable()
    class Dependency {
      value(): string {
        return 'injected';
      }
    }

    @Injectable()
    class Consumer {
      constructor(readonly dependency: Dependency) {}
    }

    @Module({ providers: [Dependency, Consumer] })
    class ProbeModule {}

    const moduleRef = await Test.createTestingModule({ imports: [ProbeModule] }).compile();

    expect(moduleRef.get(Consumer).dependency.value()).toBe('injected');
    await moduleRef.close();
  });
});
