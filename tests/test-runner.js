/**
 * @fileoverview Simple test framework for browser-based testing.
 * Provides describe/it/expect style testing with colored console output.
 * @module tests/test-runner
 */

/**
 * Test result status.
 * @enum {string}
 */
const TestStatus = {
    PENDING: 'PENDING',
    PASSED: 'PASSED',
    FAILED: 'FAILED'
};

/**
 * ANSI color codes for console output.
 * @enum {string}
 */
const Colors = {
    RESET: '\x1b[0m',
    GREEN: '\x1b[32m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    CYAN: '\x1b[36m',
    GRAY: '\x1b[90m',
    BOLD: '\x1b[1m'
};

/**
 * CSS styles for browser console output.
 * @enum {string}
 */
const Styles = {
    PASS: 'color: green; font-weight: bold;',
    FAIL: 'color: red; font-weight: bold;',
    SUITE: 'color: cyan; font-weight: bold;',
    DESCRIBE: 'color: blue; font-weight: bold;',
    NORMAL: 'color: inherit;',
    GRAY: 'color: gray;'
};

/**
 * Represents a single test case.
 */
class TestCase {
    /**
     * Creates a new test case.
     * @param {string} name - The test name
     * @param {Function} fn - The test function
     */
    constructor(name, fn) {
        this.name = name;
        this.fn = fn;
        this.status = TestStatus.PENDING;
        this.error = null;
        this.duration = 0;
    }

    /**
     * Runs the test case.
     * @returns {boolean} True if the test passed
     */
    run() {
        const startTime = performance.now();
        try {
            this.fn();
            this.status = TestStatus.PASSED;
            return true;
        } catch (error) {
            this.status = TestStatus.FAILED;
            this.error = error;
            return false;
        } finally {
            this.duration = performance.now() - startTime;
        }
    }
}

/**
 * Represents a test suite.
 */
class TestSuite {
    /**
     * Creates a new test suite.
     * @param {string} name - The suite name
     */
    constructor(name) {
        this.name = name;
        this.tests = [];
    }

    /**
     * Adds a test to the suite.
     * @param {string} name - The test name
     * @param {Function} fn - The test function
     */
    addTest(name, fn) {
        this.tests.push(new TestCase(name, fn));
    }

    /**
     * Runs all tests in the suite.
     * @returns {{passed: number, failed: number}} Test results
     */
    run() {
        let passed = 0;
        let failed = 0;

        for (const test of this.tests) {
            const result = test.run();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        }

        return { passed, failed };
    }
}

/**
 * Global test registry.
 * @type {TestSuite[]}
 */
let suites = [];
let currentSuite = null;

/**
 * Creates a test suite.
 * @param {string} name - The suite name
 * @param {Function} fn - The suite function containing tests
 */
export function describe(name, fn) {
    const suite = new TestSuite(name);
    currentSuite = suite;
    fn();
    suites.push(suite);
    currentSuite = null;
}

/**
 * Creates an individual test.
 * @param {string} name - The test name
 * @param {Function} fn - The test function
 */
export function it(name, fn) {
    if (currentSuite) {
        currentSuite.addTest(name, fn);
    } else {
        // Create an anonymous suite for orphan tests
        const suite = new TestSuite('Anonymous');
        suite.addTest(name, fn);
        suites.push(suite);
    }
}

/**
 * Creates an expectation for assertions.
 * @param {*} actual - The actual value
 * @returns {Object} An expectation object with assertion methods
 */
export function expect(actual) {
    return {
        /**
         * Asserts equality using strict equality.
         * @param {*} expected - The expected value
         */
        toBe(expected) {
            if (actual !== expected) {
                throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
            }
        },

        /**
         * Asserts that the value is defined (not undefined or null).
         */
        toBeDefined() {
            if (actual === undefined || actual === null) {
                throw new Error(`Expected value to be defined but got ${actual}`);
            }
        },

        /**
         * Asserts that the value is null.
         */
        toBeNull() {
            if (actual !== null) {
                throw new Error(`Expected null but got ${JSON.stringify(actual)}`);
            }
        },

        /**
         * Asserts that the value is truthy.
         */
        toBeTruthy() {
            if (!actual) {
                throw new Error(`Expected truthy value but got ${JSON.stringify(actual)}`);
            }
        },

        /**
         * Asserts that the value is falsy.
         */
        toBeFalsy() {
            if (actual) {
                throw new Error(`Expected falsy value but got ${JSON.stringify(actual)}`);
            }
        },

        /**
         * Asserts that the value is an array containing the expected item.
         * @param {*} expected - The expected item
         */
        toContain(expected) {
            if (!Array.isArray(actual)) {
                throw new Error(`Expected an array but got ${typeof actual}`);
            }
            if (!actual.includes(expected)) {
                throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
            }
        },

        /**
         * Asserts that the value equals the expected value (deep equality).
         * @param {*} expected - The expected value
         */
        toEqual(expected) {
            const actualStr = JSON.stringify(actual);
            const expectedStr = JSON.stringify(expected);
            if (actualStr !== expectedStr) {
                throw new Error(`Expected ${expectedStr} but got ${actualStr}`);
            }
        },

        /**
         * Asserts that the value has a property.
         * @param {string} prop - The property name
         */
        toHaveProperty(prop) {
            if (!(prop in actual)) {
                throw new Error(`Expected object to have property "${prop}"`);
            }
        },

        /**
         * Asserts that the value is greater than the expected value.
         * @param {number} expected - The expected value
         */
        toBeGreaterThan(expected) {
            if (typeof actual !== 'number') {
                throw new Error(`Expected a number but got ${typeof actual}`);
            }
            if (actual <= expected) {
                throw new Error(`Expected ${actual} to be greater than ${expected}`);
            }
        },

        /**
         * Asserts that the value is less than the expected value.
         * @param {number} expected - The expected value
         */
        toBeLessThan(expected) {
            if (typeof actual !== 'number') {
                throw new Error(`Expected a number but got ${typeof actual}`);
            }
            if (actual >= expected) {
                throw new Error(`Expected ${actual} to be less than ${expected}`);
            }
        },

        /**
         * Asserts that the value matches a regular expression.
         * @param {RegExp} pattern - The pattern to match
         */
        toMatch(pattern) {
            if (typeof actual !== 'string') {
                throw new Error(`Expected a string but got ${typeof actual}`);
            }
            if (!pattern.test(actual)) {
                throw new Error(`Expected "${actual}" to match ${pattern}`);
            }
        },

        /**
         * Asserts that the value has a specific length.
         * @param {number} length - The expected length
         */
        toHaveLength(length) {
            if (actual === undefined || actual === null) {
                throw new Error(`Expected value with length but got ${actual}`);
            }
            if (actual.length !== length) {
                throw new Error(`Expected length ${length} but got ${actual.length}`);
            }
        },

        /**
         * Asserts that a function throws an error.
         */
        toThrow() {
            if (typeof actual !== 'function') {
                throw new Error(`Expected a function but got ${typeof actual}`);
            }
            let threw = false;
            try {
                actual();
            } catch (e) {
                threw = true;
            }
            if (!threw) {
                throw new Error('Expected function to throw an error');
            }
        },

        /**
         * Returns a negated assertion.
         */
        get not() {
            const originalActual = actual;
            return {
                toBe(expected) {
                    if (originalActual === expected) {
                        throw new Error(`Expected ${JSON.stringify(expected)} to not equal ${JSON.stringify(originalActual)}`);
                    }
                },
                toBeDefined() {
                    if (originalActual !== undefined && originalActual !== null) {
                        throw new Error(`Expected value to be undefined or null`);
                    }
                },
                toBeNull() {
                    if (originalActual === null) {
                        throw new Error(`Expected value to not be null`);
                    }
                },
                toBeTruthy() {
                    if (originalActual) {
                        throw new Error(`Expected falsy value but got ${JSON.stringify(originalActual)}`);
                    }
                },
                toBeFalsy() {
                    if (!originalActual) {
                        throw new Error(`Expected truthy value but got ${JSON.stringify(originalActual)}`);
                    }
                },
                toContain(expected) {
                    if (!Array.isArray(originalActual)) {
                        throw new Error(`Expected an array but got ${typeof originalActual}`);
                    }
                    if (originalActual.includes(expected)) {
                        throw new Error(`Expected array to not contain ${JSON.stringify(expected)}`);
                    }
                },
                toEqual(expected) {
                    const actualStr = JSON.stringify(originalActual);
                    const expectedStr = JSON.stringify(expected);
                    if (actualStr === expectedStr) {
                        throw new Error(`Expected values to not be equal`);
                    }
                },
                toMatch(pattern) {
                    if (typeof originalActual !== 'string') {
                        throw new Error(`Expected a string but got ${typeof originalActual}`);
                    }
                    if (pattern.test(originalActual)) {
                        throw new Error(`Expected "${originalActual}" to not match ${pattern}`);
                    }
                },
                toHaveLength(length) {
                    if (originalActual?.length === length) {
                        throw new Error(`Expected length to not be ${length}`);
                    }
                },
                toThrow() {
                    if (typeof originalActual !== 'function') {
                        throw new Error(`Expected a function but got ${typeof originalActual}`);
                    }
                    let threw = false;
                    try {
                        originalActual();
                    } catch (e) {
                        threw = true;
                    }
                    if (threw) {
                        throw new Error('Expected function to not throw an error');
                    }
                }
            };
        }
    };
}

/**
 * Clears all registered test suites.
 */
export function clearTests() {
    suites = [];
    currentSuite = null;
}

/**
 * Gets all registered test suites.
 * @returns {TestSuite[]} The test suites
 */
export function getSuites() {
    return [...suites];
}

/**
 * Runs all registered tests and reports results.
 * @returns {{total: number, passed: number, failed: number, suites: Array}} Test results
 */
export function runTests() {
    console.log('\n');
    console.log('%c═══════════════════════════════════════════════════════════', Styles.SUITE);
    console.log('%c                    TEST RESULTS                          ', Styles.SUITE);
    console.log('%c═══════════════════════════════════════════════════════════', Styles.SUITE);
    console.log('\n');

    let totalPassed = 0;
    let totalFailed = 0;
    const results = [];

    for (const suite of suites) {
        console.log(`%c${suite.name}`, Styles.DESCRIBE);
        
        const suiteResult = {
            name: suite.name,
            tests: [],
            passed: 0,
            failed: 0
        };

        for (const test of suite.tests) {
            const passed = test.run();
            
            if (passed) {
                console.log(`  %c✓%c ${test.name}`, Styles.PASS, Styles.NORMAL);
                suiteResult.passed++;
                totalPassed++;
            } else {
                console.log(`  %c✗%c ${test.name}`, Styles.FAIL, Styles.NORMAL);
                if (test.error) {
                    console.log(`    %c→ ${test.error.message}`, Styles.GRAY);
                    if (test.error.stack) {
                        const stackLines = test.error.stack.split('\n').slice(0, 3);
                        for (const line of stackLines) {
                            console.log(`    %c${line}`, Styles.GRAY);
                        }
                    }
                }
                suiteResult.failed++;
                totalFailed++;
            }

            suiteResult.tests.push({
                name: test.name,
                passed: passed,
                error: test.error?.message || null
            });
        }

        results.push(suiteResult);
        console.log('');
    }

    // Summary
    const total = totalPassed + totalFailed;
    console.log('%c───────────────────────────────────────────────────────────', Styles.SUITE);
    console.log(
        `%cTests: %c${total}%c total, %c${totalPassed}%c passed, %c${totalFailed}%c failed`,
        Styles.NORMAL,
        Styles.DESCRIBE,
        Styles.NORMAL,
        Styles.PASS,
        Styles.NORMAL,
        totalFailed > 0 ? Styles.FAIL : Styles.NORMAL,
        Styles.NORMAL
    );
    console.log('%c───────────────────────────────────────────────────────────', Styles.SUITE);

    return {
        total,
        passed: totalPassed,
        failed: totalFailed,
        suites: results
    };
}

/**
 * Creates a test summary for display in HTML.
 * @param {Object} results - The test results from runTests()
 * @returns {string} HTML string
 */
export function createTestSummaryHTML(results) {
    const statusClass = results.failed === 0 ? 'passed' : 'failed';
    const statusIcon = results.failed === 0 ? '✓' : '✗';
    
    let html = `
        <div class="test-summary ${statusClass}">
            <h2>${statusIcon} Test Results</h2>
            <div class="stats">
                <span class="total">${results.total} tests</span>
                <span class="passed">${results.passed} passed</span>
                <span class="failed">${results.failed} failed</span>
            </div>
        </div>
        <div class="test-suites">
    `;

    for (const suite of results.suites) {
        html += `
            <div class="test-suite">
                <h3>${suite.name}</h3>
                <ul class="test-list">
        `;

        for (const test of suite.tests) {
            const testClass = test.passed ? 'passed' : 'failed';
            const testIcon = test.passed ? '✓' : '✗';
            html += `
                <li class="test ${testClass}">
                    <span class="icon">${testIcon}</span>
                    <span class="name">${test.name}</span>
                    ${test.error ? `<span class="error">${test.error}</span>` : ''}
                </li>
            `;
        }

        html += `
                </ul>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

// Export for use in other test files
export default {
    describe,
    it,
    expect,
    runTests,
    clearTests,
    getSuites,
    createTestSummaryHTML
};
