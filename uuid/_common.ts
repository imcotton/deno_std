// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/**
 * Converts the byte array to a UUID string
 * @param bytes Used to convert Byte to Hex
 */
export function bytesToUuid(bytes: Iterable<number>): string {
  return uuidDashing(
    Array.from(bytes).map(
      (num) => num.toString(16).padStart(2, "0"),
    ),
  ).join("");
}

function uuidDashing(bits: readonly string[], dash = "-") {
  return [
    bits.slice(0, 4),
    dash,
    bits.slice(4, 6),
    dash,
    bits.slice(6, 8),
    dash,
    bits.slice(8, 10),
    dash,
    bits.slice(10, 16),
  ].flat();
}

/**
 * Converts a string to a byte array by converting the hex value to a number.
 * @param uuid Value that gets converted.
 */
export function uuidToBytes(uuid: string): number[] {
  const bytes = uuid.toLowerCase().match(/[a-f0-9]{2}/g) ?? [];
  return bytes.map((str) => parseInt(str, 16));
}
