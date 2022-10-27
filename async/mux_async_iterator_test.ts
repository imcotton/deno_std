// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import {
  assertEquals,
  assertRejects,
  assertThrows,
} from "../testing/asserts.ts";
import { MuxAsyncIterator } from "./mux_async_iterator.ts";

async function* gen123(): AsyncIterableIterator<number> {
  yield 1;
  yield 2;
  yield 3;
}

async function* gen456(): AsyncIterableIterator<number> {
  yield 4;
  yield 5;
  yield 6;
}

async function* genThrows(): AsyncIterableIterator<number> {
  yield 7;
  throw new Error("something went wrong");
}

class CustomAsyncIterable {
  [Symbol.asyncIterator]() {
    return gen123();
  }
}

Deno.test("[async] MuxAsyncIterator", async function () {
  const mux = new MuxAsyncIterator<number>();
  mux.add(gen123());
  mux.add(gen456());
  const results = new Set();
  for await (const value of mux) {
    results.add(value);
  }
  assertEquals(results.size, 6);
  assertEquals(results, new Set([1, 2, 3, 4, 5, 6]));
});

Deno.test("[async] MuxAsyncIterator takes async iterable as source", async function () {
  const mux = new MuxAsyncIterator<number>();
  mux.add(new CustomAsyncIterable());
  const results = new Set();
  for await (const value of mux) {
    results.add(value);
  }
  assertEquals(results.size, 3);
  assertEquals(results, new Set([1, 2, 3]));
});

Deno.test({
  name: "[async] MuxAsyncIterator throws when the source throws",
  async fn() {
    const mux = new MuxAsyncIterator<number>();
    mux.add(gen123());
    mux.add(genThrows());
    const results = new Set();
    await assertRejects(
      async () => {
        for await (const value of mux) {
          results.add(value);
        }
      },
      Error,
      "something went wrong",
    );
  },
});

Deno.test("[async] MuxAsyncIterator::add need this in context", async function () {
  const mux = new MuxAsyncIterator<number>();
  const add = mux.add;
  // deno-lint-ignore ban-ts-comment
  // @ts-expect-error
  assertThrows(() => add(gen123()));

  await assertRejects(() => {
    return Promise.resolve(gen456()).then(mux.add);
  });
});
