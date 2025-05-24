/**
 * Test suite for Aristotle module (logical framework for token governance)
 */

const aristotle = require('../../src/utils/aristotle');

describe('Aristotle Module - Logical Framework', () => {
  describe('TokenCategory class', () => {
    let category;
    
    beforeEach(() => {
      category = new aristotle.TokenCategory('BaseToken', { type: 'ERC20' });
    });
    
    test('should create a category with name and attributes', () => {
      expect(category.name).toBe('BaseToken');
      expect(category.attributes).toEqual({ type: 'ERC20' });
      expect(category.subcategories).toBeInstanceOf(Map);
      expect(category.subcategories.size).toBe(0);
    });
    
    test('should add subcategories correctly', () => {
      const subcategory = category.addSubcategory('StableToken', { stable: true });
      
      expect(category.subcategories.size).toBe(1);
      expect(category.subcategories.get('StableToken')).toBe(subcategory);
      
      // Subcategory should inherit parent attributes
      expect(subcategory.attributes).toEqual({ type: 'ERC20', stable: true });
    });
    
    test('should categorize tokens based on attributes', () => {
      const token = { type: 'ERC20', name: 'Test Token' };
      
      expect(category.categorizes(token)).toBe(true);
      
      const nonMatchingToken = { type: 'ERC721', name: 'NFT Token' };
      expect(category.categorizes(nonMatchingToken)).toBe(false);
    });
    
    test('should use functions as predicates in attributes', () => {
      const categoryWithPredicate = new aristotle.TokenCategory('LargeSupply', {
        totalSupply: (supply) => supply > 1000000
      });
      
      expect(categoryWithPredicate.categorizes({ totalSupply: 2000000 })).toBe(true);
      expect(categoryWithPredicate.categorizes({ totalSupply: 500 })).toBe(false);
    });
    
    test('should find all matching categories for a token', () => {
      // Add subcategories
      const stableSubcategory = category.addSubcategory('StableToken', { stable: true });
      stableSubcategory.addSubcategory('USDStable', { currency: 'USD' });
      category.addSubcategory('UtilityToken', { utility: true });
      
      const token = {
        type: 'ERC20',
        stable: true,
        currency: 'USD',
        name: 'USDC'
      };
      
      const categories = category.findCategories(token);
      
      expect(categories).toContain('BaseToken');
      expect(categories).toContain('StableToken');
      expect(categories).toContain('USDStable');
      expect(categories).not.toContain('UtilityToken');
    });
  });
  
  describe('GovernanceRule class', () => {
    let rule;
    
    beforeEach(() => {
      // Rule to enforce minimum transfer amount
      const premise = (op) => op.type === 'transfer' && op.amount !== undefined;
      const conclusion = (op) => {
        if (op.amount < 10) throw new Error('Transfer amount below minimum');
        return op;
      };
      
      rule = new aristotle.GovernanceRule(
        'MinimumTransfer',
        premise,
        conclusion,
        'Enforces minimum transfer amount of 10 units'
      );
    });
    
    test('should create rule with correct properties', () => {
      expect(rule.name).toBe('MinimumTransfer');
      expect(typeof rule.premise).toBe('function');
      expect(typeof rule.conclusion).toBe('function');
      expect(rule.description).toBe('Enforces minimum transfer amount of 10 units');
    });
    
    test('should not apply rule when premise is false', () => {
      const result = rule.apply({ type: 'mint', amount: 5 });
      
      expect(result.applies).toBe(false);
    });
    
    test('should apply rule when premise is true', () => {
      const validOp = { type: 'transfer', amount: 20 };
      const result = rule.apply(validOp);
      
      expect(result.applies).toBe(true);
      expect(result.operation).toEqual(validOp);
    });
    
    test('should mark operation as invalid when conclusion throws', () => {
      const invalidOp = { type: 'transfer', amount: 5 };
      const result = rule.apply(invalidOp);
      
      expect(result.applies).toBe(true);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Transfer amount below minimum');
    });
  });
  
  describe('AristotelianRuleSystem class', () => {
    let ruleSystem;
    
    beforeEach(() => {
      ruleSystem = new aristotle.AristotelianRuleSystem();
    });
    
    test('should create rule system with empty rules and categories', () => {
      expect(ruleSystem.rules).toEqual([]);
      expect(ruleSystem.categories).toBeInstanceOf(Map);
    });
    
    test('should add categories and rules', () => {
      const category = ruleSystem.addCategory('Token', { digital: true });
      expect(ruleSystem.categories.size).toBe(1);
      expect(ruleSystem.categories.get('Token')).toBe(category);
      
      ruleSystem.addRule(
        'ValidateTransfer',
        () => true,
        () => true,
        'Simple validation rule'
      );
      
      expect(ruleSystem.rules.length).toBe(1);
      expect(ruleSystem.rules[0].name).toBe('ValidateTransfer');
    });
    
    test('should apply rules in sequence', () => {
      // First rule adds a fee
      ruleSystem.addRule(
        'AddFee',
        (op) => op.type === 'transfer',
        (op) => ({ ...op, fee: 2 }),
        'Apply transfer fee'
      );
      
      // Second rule validates final amount
      ruleSystem.addRule(
        'ValidateAmount',
        (op) => op.type === 'transfer',
        (op) => {
          if (op.amount - (op.fee || 0) <= 0) {
            throw new Error('Amount after fee must be positive');
          }
          return op;
        },
        'Validate amount after fees'
      );
      
      const validOp = { type: 'transfer', amount: 10 };
      const invalidOp = { type: 'transfer', amount: 1 };
      
      const validResult = ruleSystem.applyRules(validOp);
      expect(validResult.valid).toBe(true);
      expect(validResult.operation).toEqual({ type: 'transfer', amount: 10, fee: 2 });
      
      const invalidResult = ruleSystem.applyRules(invalidOp);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.reason).toContain('Rule "ValidateAmount" violation');
    });
    
    test('should categorize tokens correctly', () => {
      const fungibleCategory = ruleSystem.addCategory('Fungible', { fungible: true });
      fungibleCategory.addSubcategory('Currency', { currencyType: 'stable' });
      
      const nftCategory = ruleSystem.addCategory('NonFungible', { fungible: false });
      
      const stablecoin = { fungible: true, currencyType: 'stable', name: 'USDT' };
      const nft = { fungible: false, unique: true, name: 'CryptoKitty' };
      
      const stablecoinCategories = ruleSystem.categorizeToken(stablecoin);
      expect(stablecoinCategories).toContain('Fungible');
      expect(stablecoinCategories).toContain('Currency');
      expect(stablecoinCategories).not.toContain('NonFungible');
      
      const nftCategories = ruleSystem.categorizeToken(nft);
      expect(nftCategories).toContain('NonFungible');
      expect(nftCategories).not.toContain('Fungible');
    });
  });
});
