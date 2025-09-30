# CRC32 Checksum Utilities

Fast, modular CRC32 implementation with support for strings, buffers, and 
large file processing.

## Features

- **Standard CRC32**: IEEE 802.3 compatible (ZIP, PNG, Ethernet)
- **CRC32C variant**: Castagnoli polynomial for improved performance
- **Buffer support**: ArrayBuffer, DataView, Uint8Array
- **Block processing**: Custom format for large files
- **Zero dependencies**: Pure JavaScript implementation
- **TypeScript ready**: Full JSDoc type annotations

## Quick Start

```javascript
import { stringToCrc32 } from './stringCrc32.js';
import { bufferToCrc32 } from './bufferCrc32.js';
import { bufferToBlockCrc32 } from './blockCrc32.js';
import { CRC32, CRC32C } from './crcTables.js';

// String checksums (IEEE 802.3 standard)
const crc = stringToCrc32('hello world');
console.log(crc); // 222957957 (0xd4a1185)

// Standard test vector verification
console.log(stringToCrc32('123456789')); // 3421780262 (0xcbf43926)
console.log(stringToCrc32('123456789', CRC32C)); // 3808858755 (0xe3069283)

// Buffer checksums (standard)
const buffer = new TextEncoder().encode('hello world');
const bufferCrc = bufferToCrc32(buffer);
console.log(bufferCrc); // 222957957 (same as string)

// Large file processing (custom format)
const result = bufferToBlockCrc32(buffer, 1024);
console.log(result.checksumList); // [222957957]
console.log(result.toBase58()); // Base58-encoded result
```

## Module Overview

### `crcTables.js`
Shared CRC table generation and constants.

```javascript
import { getCrcTable, CRC32, CRC32C } from './crcTables.js';

const table = getCrcTable(CRC32); // Get lookup table
```

### `stringCrc32.js`
String to CRC32 conversion.

```javascript
import { stringToCrc32, CRC32, CRC32C } from './stringCrc32.js';

const crc = stringToCrc32('text', CRC32);  // Standard CRC32
const crcC = stringToCrc32('text', CRC32C); // CRC32C variant
```

### `bufferCrc32.js`
Standard buffer CRC32 - compatible with external tools.

```javascript
import { bufferToCrc32 } from './bufferCrc32.js';

// Works with all buffer types
const arrayBuffer = new ArrayBuffer(100);
const uint8Array = new Uint8Array(100);
const dataView = new DataView(arrayBuffer);

const crc1 = bufferToCrc32(arrayBuffer);
const crc2 = bufferToCrc32(uint8Array, 10, 50); // Offset & length
const crc3 = bufferToCrc32(dataView);
```

### `blockCrc32.js`
Custom block-based processing for large files.

```javascript
import { 
  bufferToBlockCrc32, 
  blockCrc32Iterator,
  bufferChecksumEquals,
  optimalBlockSize 
} from './blockCrc32.js';

// Process large buffer in blocks
const result = bufferToBlockCrc32(largeBuffer);
console.log(result.checksumList);  // Array of CRC32 values
console.log(result.toBase58());    // Concatenated Base58 string

// Stream processing
for (const block of blockCrc32Iterator(buffer, 1024)) {
  console.log(`Block at ${block.offset}: ${block.toBase58()}`);
}

// Verification
const isValid = bufferChecksumEquals(buffer, expectedChecksum);
```

## CRC32 Variants

### CRC32 (IEEE 802.3)
- **Use case**: General purpose, file integrity
- **Compatible with**: ZIP files, PNG images, Ethernet frames
- **Polynomial**: `0xEDB88320` (reversed)
- **Standard test**: `"123456789"` → `0xcbf43926` ✅

### CRC32C (Castagnoli)
- **Use case**: High-performance applications
- **Compatible with**: iSCSI, SCTP, certain databases
- **Polynomial**: `0x82f63b78` (reversed)
- **Standard test**: `"123456789"` → `0xe3069283` ✅

```javascript
import { CRC32, CRC32C } from './crcTables.js';

// All functions accept variant parameter
stringToCrc32('data', CRC32);   // Default
stringToCrc32('data', CRC32C);  // Castagnoli

// Verify against standard test vectors
console.assert(stringToCrc32('123456789', CRC32) === 0xcbf43926);
console.assert(stringToCrc32('123456789', CRC32C) === 0xe3069283);
```

## Block Processing Details

### Standard vs Block Format

**Standard CRC32** (compatible):
```
Input:  [large file data]
Output: 222957957 (single 32-bit value)
```

**Block CRC32** (proprietary):
```
Input:  [large file data split into blocks]
Block 1: 222957957 → Base58 encoded
Block 2: 891347246 → Base58 encoded
Block 3: 234567890 → Base58 encoded
Output:  [concatenated Base58 string]
```

### Block Size Selection

```javascript
// Automatic sizing
const blockSize = optimalBlockSize(buffer);

// Manual sizing
const result = bufferToBlockCrc32(buffer, 65536); // 64KB blocks
```

**Size Guidelines:**
- **Small files** (< 100KB): Single block
- **Medium files** (100KB - 2MB): 100KB blocks
- **Large files** (> 2MB): Adaptive sizing (max 20 blocks)

### Use Cases

**Standard CRC32:**
- File integrity verification
- Compatibility with external tools
- Single checksum for entire data

**Block CRC32:**
- Large file streaming
- Partial corruption detection
- Progress tracking during transfer
- Resume capability for interrupted uploads

## Error Handling

```javascript
// Invalid CRC variant
getCrcTable('invalid'); // throws "Invalid variant [invalid]"

// Unsupported buffer type
bufferToCrc32('string'); // throws "Unsupported buffer type"

// All functions validate inputs and provide clear error messages
```

## Standards Compliance

✅ **Verified Implementation**: Both CRC32 and CRC32C pass standard test vectors
- CRC32 IEEE 802.3: `"123456789"` → `0xcbf43926`
- CRC32C Castagnoli: `"123456789"` → `0xe3069283`

✅ **Full Compatibility**: 
- ZIP/PNG/Ethernet frames (CRC32)
- iSCSI/SCTP protocols (CRC32C)

## Performance Notes

- **Table caching**: CRC tables generated once per variant
- **Memory efficient**: Block processing doesn't load entire files
- **Browser compatible**: Works in all modern browsers
- **Standards compliant**: Verified against authoritative test vectors
- **No dependencies**: Pure JavaScript implementation

## Testing

Run tests for all modules:

```bash
pnpm test:file src/lib/util/checksum/
```

Run specific test files:

```bash
pnpm test:file src/lib/util/checksum/stringCrc32.test.js
pnpm test:file src/lib/util/checksum/bufferCrc32.test.js
pnpm test:file src/lib/util/checksum/blockCrc32.test.js
```

## TypeScript Support

All modules include comprehensive JSDoc type annotations:

```javascript
/**
 * @param {string} str - String to calculate checksum for
 * @param {import('./crcTables.js').CrcVariant} [variant=CRC32] - CRC variant
 * @returns {number} Unsigned 32-bit CRC32 value
 */
```

## Migration Guide

### From Original Implementation

**Old:**
```javascript
import { stringToCrc32 } from './crc32.js';
```

**New:**
```javascript
import { stringToCrc32 } from './stringCrc32.js';
// Same API, no changes needed
```

### Adding Block Processing

**Before:**
```javascript
// Single CRC32 for entire file
const crc = bufferToCrc32(largeFile);
```

**After:**
```javascript
// Block-based processing
const result = bufferToBlockCrc32(largeFile);
const checksum = result.toBase58(); // Custom format
```

## License

Part of HKdigital library core utilities.