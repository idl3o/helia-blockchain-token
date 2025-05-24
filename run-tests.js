#!/usr/bin/env node
/**
 * Helia Blockchain Token Test Runner
 * 
 * This script provides a convenient way to run tests for the Helia Blockchain Token project.
 * It allows running all tests or specific test categories.
 * 
 * Usage:
 *   node run-tests.js [category]
 * 
 * Categories:
 *   - utils: Run all philosophical utility tests
 *   - token: Run token implementation tests
 *   - storage: Run Helia storage tests
 *   - integration: Run integration tests
 *   - unified: Run the Grand Unified Field Test
 *   - all: Run all tests (default)
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define test categories
const TEST_CATEGORIES = {
  utils: 'tests/utils/*.test.js',
  token: 'tests/token/*.test.js',
  storage: 'tests/storage/*.test.js',
  integration: 'tests/integration/*.test.js',
  unified: 'tests/integration/grand-unified-field.test.js',
  all: 'tests/**/*.test.js'
};

/**
 * Runs Jest with the specified pattern
 * @param {string} testPattern - Test file pattern to run
 * @param {boolean} verbose - Whether to use verbose output
 */
function runTests(testPattern, verbose = false) {
  const args = [
    '--testMatch',
    testPattern
  ];

  if (verbose) {
    args.push('--verbose');
  }

  console.log(`\n🧪 Running tests: ${testPattern}\n`);
  
  const jestResult = spawnSync('jest', args, { 
    stdio: 'inherit',
    shell: true
  });

  return jestResult.status;
}

/**
 * Displays help information
 */
function showHelp() {
  console.log('\nHelia Blockchain Token Test Runner');
  console.log('\nAvailable test categories:');
  Object.keys(TEST_CATEGORIES).forEach(category => {
    console.log(`  - ${category}: ${TEST_CATEGORIES[category]}`);
  });
  console.log('\nUsage:');
  console.log('  node run-tests.js [category]');
  console.log('  node run-tests.js [category] --verbose');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  let category = 'all';
  let verbose = false;

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return 0;
  }

  if (args.includes('--verbose') || args.includes('-v')) {
    verbose = true;
    args.splice(args.indexOf(args.find(arg => arg === '--verbose' || arg === '-v')), 1);
  }

  if (args.length > 0) {
    category = args[0];
  }

  if (!TEST_CATEGORIES[category]) {
    console.error(`Error: Unknown test category '${category}'`);
    showHelp();
    return 1;
  }

  // Map philosophical concepts to utils if specified
  if (['planck', 'leibniz', 'godel', 'aristotle', 'shannon', 'turing'].includes(category)) {
    const testFile = `tests/utils/${category}.test.js`;
    console.log(`Running tests for philosophical concept: ${category}`);
    return runTests(testFile, verbose);
  }

  return runTests(TEST_CATEGORIES[category], verbose);
}

// Execute main function
process.exit(main());
