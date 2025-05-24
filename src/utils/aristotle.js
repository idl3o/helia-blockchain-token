/**
 * aristotle.js - Logical framework for token governance and categorization
 * 
 * Inspired by Aristotle's formal logic and categorization systems.
 * This module provides a structured approach to token classification,
 * governance rules, and syllogistic reasoning for token operations.
 * 
 * @see Related modules:
 * - {@link ../godel.js} - Consistency verification for logical systems
 * - {@link ../leibniz.js} - Binary mathematics for symbolic representation
 * - {@link ../index.js} - Navigation between philosophical concepts
 */

/**
 * TokenCategory - Classification system for tokens based on Aristotelian categories
 */
class TokenCategory {
  constructor(name, attributes = {}) {
    this.name = name;
    this.attributes = attributes;
    this.subcategories = new Map();
  }

  /**
   * Adds a subcategory to this category
   * @param {string} name - Name of subcategory
   * @param {Object} attributes - Attributes of subcategory
   * @returns {TokenCategory} - The created subcategory
   */
  addSubcategory(name, attributes = {}) {
    // Merge parent attributes with specific attributes (inheritance)
    const mergedAttributes = { ...this.attributes, ...attributes };
    const subcategory = new TokenCategory(name, mergedAttributes);
    this.subcategories.set(name, subcategory);
    return subcategory;
  }

  /**
   * Checks if a token belongs to this category based on its properties
   * @param {Object} token - Token to categorize
   * @returns {boolean} - Whether token belongs to this category
   */
  categorizes(token) {
    // Check all required attributes
    for (const [key, value] of Object.entries(this.attributes)) {
      if (typeof value === 'function') {
        // If attribute is a function, use it as a predicate
        if (!value(token[key])) return false;
      } else {
        // Otherwise do a direct comparison
        if (token[key] !== value) return false;
      }
    }
    return true;
  }

  /**
   * Finds all categories that a token belongs to
   * @param {Object} token - Token to categorize
   * @returns {Array} - Array of category names
   */
  findCategories(token) {
    const categories = [];
    
    // Check if token matches this category
    if (this.categorizes(token)) {
      categories.push(this.name);
      
      // Check all subcategories
      for (const subcategory of this.subcategories.values()) {
        const subResults = subcategory.findCategories(token);
        categories.push(...subResults);
      }
    }
    
    return categories;
  }
}

/**
 * GovernanceRule - Represents an Aristotelian syllogism applied to token governance
 */
class GovernanceRule {
  constructor(name, premise, conclusion, description = '') {
    this.name = name;
    this.premise = premise;    // Function that tests if rule applies
    this.conclusion = conclusion;  // Function that enforces the rule
    this.description = description;
  }

  /**
   * Applies the rule to a token operation
   * @param {Object} operation - Operation to validate
   * @param {Object} context - Additional context
   * @returns {Object} - Result containing validity and any transformations
   */
  apply(operation, context = {}) {
    // Check if the premise applies to this operation
    if (!this.premise(operation, context)) {
      return { 
        applies: false, 
        operation 
      };
    }

    try {
      // Apply the rule's conclusion/consequence
      const result = this.conclusion(operation, context);
      return {
        applies: true,
        result,
        operation: result || operation
      };
    } catch (error) {
      return {
        applies: true,
        valid: false,
        error: error.message
      };
    }
  }
}

/**
 * Creates a rule system based on Aristotelian logic
 */
class AristotelianRuleSystem {
  constructor() {
    this.rules = [];
    this.categories = new Map();
  }

  /**
   * Adds a category to the system
   * @param {string} name - Category name
   * @param {Object} attributes - Category attributes
   * @returns {TokenCategory} - The created category
   */
  addCategory(name, attributes = {}) {
    const category = new TokenCategory(name, attributes);
    this.categories.set(name, category);
    return category;
  }

  /**
   * Adds a governance rule to the system
   * @param {string} name - Rule name
   * @param {Function} premise - Premise function
   * @param {Function} conclusion - Conclusion function
   * @param {string} description - Rule description
   */
  addRule(name, premise, conclusion, description = '') {
    const rule = new GovernanceRule(name, premise, conclusion, description);
    this.rules.push(rule);
  }

  /**
   * Applies all relevant rules to an operation
   * @param {Object} operation - Operation to validate
   * @param {Object} context - Additional context
   * @returns {Object} - Result of rule application
   */
  applyRules(operation, context = {}) {
    const results = [];
    let currentOperation = { ...operation };
    
    for (const rule of this.rules) {
      const result = rule.apply(currentOperation, context);
      results.push({
        rule: rule.name,
        ...result
      });
      
      // Update current operation if rule applied and transformed it
      if (result.applies && result.operation) {
        currentOperation = result.operation;
      }
      
      // If a rule made the operation invalid, stop processing
      if (result.applies && result.valid === false) {
        return {
          valid: false,
          reason: `Rule "${rule.name}" violation: ${result.error}`,
          results
        };
      }
    }
    
    return {
      valid: true,
      operation: currentOperation,
      results
    };
  }

  /**
   * Categorizes a token according to the defined categories
   * @param {Object} token - Token to categorize
   * @returns {Array} - Array of category names the token belongs to
   */
  categorizeToken(token) {
    const categories = [];
    
    for (const category of this.categories.values()) {
      const foundCategories = category.findCategories(token);
      categories.push(...foundCategories);
    }
    
    return [...new Set(categories)]; // Remove duplicates
  }
}

module.exports = {
  TokenCategory,
  GovernanceRule,
  AristotelianRuleSystem
};
