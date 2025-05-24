# Helia Blockchain Token - Navigation Guide

This document serves as a central navigation hub for exploring the Helia Blockchain Token project and understanding how different philosophical concepts are integrated into the implementation.

## Core Concepts & Implementation

Each core component is inspired by a different philosophical or scientific figure:

| Module | Inspiration | Concept | Implementation |
|--------|------------|---------|----------------|
| [`planck.js`](../src/utils/planck.js) | Max Planck | Quantum discretization | Token value quantization |
| [`leibniz.js`](../src/utils/leibniz.js) | Gottfried Leibniz | Binary mathematics | Cryptographic operations |
| [`godel.js`](../src/utils/godel.js) | Kurt Gödel | Consistency verification | Transaction validation |
| [`aristotle.js`](../src/utils/aristotle.js) | Aristotle | Logical categorization | Token governance rules |
| [`shannon.js`](../src/utils/shannon.js) | Claude Shannon | Information theory | Transaction analysis |
| [`turing.js`](../src/utils/turing.js) | Alan Turing | Computational model | State transitions |

## System Architecture

The system integrates these philosophical concepts with a modern blockchain token architecture:

- [`index.js`](../src/index.js) - Main entry point that integrates all components
- [`token/index.js`](../src/token/index.js) - Core token implementation
- [`storage/index.js`](../src/storage/index.js) - Distributed storage via Helia/IPFS
- [`network/index.js`](../src/network/index.js) - P2P networking via libp2p

## Documentation

Explore the conceptual foundations and design principles:

- [Timeline Documentary](./timeline-documentary.md) - Historical evolution of concepts
- [Resolutions](./resolutions.md) - Guiding principles of the project
- [Philosophical Implementation Examples](./philosophical-implementation-examples.md) - Concrete examples of how philosophical concepts manifest in code
- [Philosophical Integration Guide](./philosophical-integration-guide.md) - Guide for integrating new philosophical concepts
- [Practical Example](./practical-example.md) - Complete working example showing how all components interact

## Implementation Flows

### Token Creation and Transfer Flow

1. User initiates token creation or transfer
2. Operation is quantized using [`planck.js`](../src/utils/planck.js) principles
3. Cryptographic proof is generated via [`leibniz.js`](../src/utils/leibniz.js)
4. Transaction consistency is verified with [`godel.js`](../src/utils/godel.js)
5. Token is categorized according to [`aristotle.js`](../src/utils/aristotle.js) rules
6. The transaction's information content is analyzed using [`shannon.js`](../src/utils/shannon.js)
7. State transition is processed through [`turing.js`](../src/utils/turing.js)
8. Result is stored in Helia via the storage module
9. Transaction is propagated through the network module

### Development Quick Links

- [Token Implementation](../src/token/index.js)
- [Core Utility Functions](../src/utils/)
- [Network Configuration](../src/network/index.js)
- [Storage Layer](../src/storage/index.js)
- [Main Application](../src/index.js)
- [CLI Interface](../src/cli.js)

## Interdependencies Map

The following diagram illustrates the interdependencies between philosophical modules:

```
            +-------------+
            |   index.js  |
            +------+------+
                   |
        +----------+-----------+
        |                      |
+-------v------+      +--------v-----+
| token/index  |<---->| network/index|
+-------+------+      +--------+-----+
        |                      |
+-------v------+      +--------v-----+
|storage/index |<---->|  utils/      |
+-------+------+      +--------+-----+
        |                      |
        |      +---------------+-----------------+
        |      |               |                 |
   +----v----+ | +----------+  |  +-----------+  |
   | planck  |<+ | leibniz  |<-+->|  godel    |  |
   +---------+   +-----+----+     +-----+-----+  |
                       |                |        |
                       v                v        |
                  +----+----+     +-----+-----+  |
                  |aristotle|<--->| shannon   |<-+
                  +----+----+     +-----+-----+
                       |                |
                       +------v---------+
                              |
                         +----+----+
                         | turing  |
                         +---------+
```

## Getting Started

To explore the philosophical implementation:

1. Start with the [`index.js`](../src/index.js) file to understand system integration
2. Examine each philosophical module in the [`utils/`](../src/utils/) directory
3. See how these modules are applied in the [`token/index.js`](../src/token/index.js) implementation
4. Refer to the [Timeline Documentary](./timeline-documentary.md) for conceptual background
5. Review the [Resolutions](./resolutions.md) for guiding principles
