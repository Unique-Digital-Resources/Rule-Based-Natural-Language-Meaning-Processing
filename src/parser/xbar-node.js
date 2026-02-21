/**
 * @fileoverview X-Bar tree node class for representing phrase structure.
 * Implements the three-level hierarchy: X (head) -> X' (bar) -> XP (phrase).
 * @module parser/xbar-node
 */

import { PhraseType, XBarLevel, POS, posToPhraseType, getHeadCategory } from '../core/types.js';
import { Token } from '../core/token.js';

/**
 * Role of a child node in the X-Bar structure.
 * @readonly
 * @enum {string}
 */
export const ChildRole = {
    /** Head of the phrase */
    HEAD: 'head',
    /** Complement - sister to head */
    COMPLEMENT: 'complement',
    /** Specifier - sister to X' */
    SPECIFIER: 'specifier',
    /** Adjunct - attached at X' level */
    ADJUNCT: 'adjunct'
};

/**
 * XBarNode class representing a node in an X-Bar tree.
 * Supports the three-level hierarchy: X (head), X' (bar), XP (phrase).
 */
export class XBarNode {
    /**
     * Creates a new XBarNode instance.
     * @param {Object} options - Node options
     * @param {string} options.type - Node type: 'X' (head), 'X\'' (bar), or 'XP' (phrase)
     * @param {string} options.category - Phrase category: NP, VP, AP, PP, TP, etc.
     * @param {Token|null} [options.head] - The head token (for head nodes)
     * @param {XBarNode|null} [options.complement] - Complement node
     * @param {XBarNode|null} [options.specifier] - Specifier node
     * @param {XBarNode[]} [options.adjuncts] - Array of adjunct nodes
     * @param {Object} [options.semantic] - Semantic information
     */
    constructor({ type, category, head = null, complement = null, specifier = null, adjuncts = [], semantic = {} }) {
        /**
         * Node type: X (head), X' (bar), or XP (phrase)
         * @type {string}
         */
        this.type = type;

        /**
         * Phrase category: NP, VP, AP, PP, TP, etc.
         * @type {string}
         */
        this.category = category;

        /**
         * The head token (only for head/leaf nodes).
         * @type {Token|null}
         */
        this.headToken = head;

        /**
         * Complement node (sister to head).
         * @type {XBarNode|null}
         */
        this.complement = complement;

        /**
         * Specifier node (sister to X').
         * @type {XBarNode|null}
         */
        this.specifier = specifier;

        /**
         * Array of adjunct nodes.
         * @type {XBarNode[]}
         */
        this.adjuncts = Array.isArray(adjuncts) ? adjuncts : [];

        /**
         * Semantic information for this node.
         * @type {Object}
         */
        this.semantic = { ...semantic };

        /**
         * Parent node reference (set when added as child).
         * @type {XBarNode|null}
         * @private
         */
        this._parent = null;
    }

    /**
     * Gets the parent node.
     * @returns {XBarNode|null} The parent node
     */
    get parent() {
        return this._parent;
    }

    /**
     * Gets the head of this phrase.
     * For XP and X' nodes, recursively finds the head.
     * For X (head) nodes, returns this node.
     * @returns {XBarNode} The head node
     */
    findHead() {
        // If this is a head node, return itself
        if (this.type === XBarLevel.X) {
            return this;
        }

        // If this has a head token, return this
        if (this.headToken) {
            return this;
        }

        // For XP nodes, look in the X' (complement or specifier structure)
        if (this.type === XBarLevel.XP) {
            // The head is in the X' child
            if (this.complement && this.complement.type === XBarLevel.X_BAR) {
                return this.complement.findHead();
            }
            // If specifier is the only child, check there
            if (this.specifier) {
                // Specifier is not the head, but check complement
            }
        }

        // For X' nodes, the head is the leftmost element
        if (this.type === XBarLevel.X_BAR) {
            if (this.headToken) {
                return this;
            }
            if (this.complement) {
                // Check if complement contains the head (recursive structure)
                if (this.complement.type === XBarLevel.X_BAR) {
                    return this.complement.findHead();
                }
            }
        }

        return this;
    }

    /**
     * Gets the head token of this phrase.
     * @returns {Token|null} The head token
     */
    getHeadToken() {
        const headNode = this.findHead();
        return headNode ? headNode.headToken : null;
    }

    /**
     * Gets all children of this node.
     * @returns {XBarNode[]} Array of child nodes
     */
    get children() {
        const children = [];

        if (this.specifier) {
            children.push(this.specifier);
        }

        if (this.complement) {
            children.push(this.complement);
        }

        for (const adjunct of this.adjuncts) {
            children.push(adjunct);
        }

        return children;
    }

    /**
     * Checks if this node is complete (has all required components).
     * A complete node has a head.
     * @returns {boolean} True if the node is complete
     */
    isComplete() {
        // Head nodes are complete if they have a head token
        if (this.type === XBarLevel.X) {
            return this.headToken !== null;
        }

        // X' nodes are complete if they have a head (directly or in complement)
        if (this.type === XBarLevel.X_BAR) {
            if (this.headToken) return true;
            if (this.complement) {
                // Check for recursive X' structure
                if (this.complement.type === XBarLevel.X_BAR) {
                    return this.complement.isComplete();
                }
                // Has complement, needs head
                return this.headToken !== null;
            }
            return false;
        }

        // XP nodes are complete if they have an X' child
        if (this.type === XBarLevel.XP) {
            if (this.complement && this.complement.type === XBarLevel.X_BAR) {
                return this.complement.isComplete();
            }
            return false;
        }

        return false;
    }

    /**
     * Adds a child node with a specific role.
     * @param {XBarNode} node - The node to add
     * @param {string} role - The role of the child (head, complement, specifier, adjunct)
     * @returns {XBarNode} This node for chaining
     * @throws {Error} If the role is invalid or node is null
     */
    addChild(node, role) {
        if (!node) {
            throw new Error('Cannot add null node');
        }

        node._parent = this;

        switch (role) {
            case ChildRole.HEAD:
                // For head, we set the head token if it's a terminal
                if (node.type === XBarLevel.X && node.headToken) {
                    this.headToken = node.headToken;
                } else if (node.headToken) {
                    this.headToken = node.headToken;
                }
                break;

            case ChildRole.COMPLEMENT:
                this.complement = node;
                break;

            case ChildRole.SPECIFIER:
                this.specifier = node;
                break;

            case ChildRole.ADJUNCT:
                this.adjuncts.push(node);
                break;

            default:
                throw new Error(`Unknown child role: ${role}`);
        }

        return this;
    }

    /**
     * Traverses the tree in depth-first order.
     * @param {Function} callback - Callback function called for each node
     * @param {string} [order='pre'] - Traversal order: 'pre' (pre-order) or 'post' (post-order)
     */
    traverse(callback, order = 'pre') {
        if (order === 'pre') {
            callback(this);
        }

        // Traverse specifier
        if (this.specifier) {
            this.specifier.traverse(callback, order);
        }

        // Traverse complement
        if (this.complement) {
            this.complement.traverse(callback, order);
        }

        // Traverse adjuncts
        for (const adjunct of this.adjuncts) {
            adjunct.traverse(callback, order);
        }

        if (order === 'post') {
            callback(this);
        }
    }

    /**
     * Finds all nodes matching a predicate.
     * @param {Function} predicate - Predicate function that takes a node and returns boolean
     * @returns {XBarNode[]} Array of matching nodes
     */
    find(predicate) {
        const results = [];
        this.traverse(node => {
            if (predicate(node)) {
                results.push(node);
            }
        });
        return results;
    }

    /**
     * Finds all nodes of a specific category.
     * @param {string} category - The category to find (e.g., 'NP', 'VP')
     * @returns {XBarNode[]} Array of matching nodes
     */
    findByCategory(category) {
        return this.find(node => node.category === category);
    }

    /**
     * Finds all nodes of a specific type.
     * @param {string} type - The type to find (X, X', XP)
     * @returns {XBarNode[]} Array of matching nodes
     */
    findByType(type) {
        return this.find(node => node.type === type);
    }

    /**
     * Gets the label for this node (for display/visualization).
     * @returns {string} The node label
     */
    getLabel() {
        if (this.type === XBarLevel.X) {
            return this.headToken ? this.headToken.text : getHeadCategory(this.category);
        }

        if (this.type === XBarLevel.X_BAR) {
            return `${getHeadCategory(this.category)}'`;
        }

        if (this.type === XBarLevel.XP) {
            return this.category;
        }

        return '?';
    }

    /**
     * Converts this node to a string representation.
     * @param {number} [indent=0] - Indentation level
     * @returns {string} String representation
     */
    toString(indent = 0) {
        const spaces = '  '.repeat(indent);
        const label = this.getLabel();
        let result = `${spaces}${label}`;

        // Add head token info
        if (this.headToken) {
            result += ` [${this.headToken.text}]`;
        }

        // Add semantic info
        if (this.semantic.role) {
            result += ` (${this.semantic.role})`;
        }

        result += '\n';

        // Add children
        if (this.specifier) {
            result += `${spaces}  Spec:\n`;
            result += this.specifier.toString(indent + 2);
        }

        if (this.complement) {
            result += `${spaces}  Comp:\n`;
            result += this.complement.toString(indent + 2);
        }

        for (let i = 0; i < this.adjuncts.length; i++) {
            result += `${spaces}  Adjunct[${i}]:\n`;
            result += this.adjuncts[i].toString(indent + 2);
        }

        return result;
    }

    /**
     * Converts this node to a JSON-serializable object.
     * @returns {Object} JSON representation
     */
    toJSON() {
        const json = {
            type: this.type,
            category: this.category,
            label: this.getLabel()
        };

        if (this.headToken) {
            json.headToken = this.headToken.toJSON();
        }

        if (this.specifier) {
            json.specifier = this.specifier.toJSON();
        }

        if (this.complement) {
            json.complement = this.complement.toJSON();
        }

        if (this.adjuncts.length > 0) {
            json.adjuncts = this.adjuncts.map(a => a.toJSON());
        }

        if (Object.keys(this.semantic).length > 0) {
            json.semantic = this.semantic;
        }

        return json;
    }

    /**
     * Creates an XBarNode from a JSON object.
     * @param {Object} json - The JSON object
     * @returns {XBarNode} A new XBarNode instance
     */
    static fromJSON(json) {
        const node = new XBarNode({
            type: json.type,
            category: json.category,
            head: json.headToken ? Token.fromJSON(json.headToken) : null,
            complement: json.complement ? XBarNode.fromJSON(json.complement) : null,
            specifier: json.specifier ? XBarNode.fromJSON(json.specifier) : null,
            adjuncts: json.adjuncts ? json.adjuncts.map(a => XBarNode.fromJSON(a)) : [],
            semantic: json.semantic || {}
        });

        return node;
    }

    /**
     * Creates a head (X) node from a token.
     * @param {Token} token - The head token
     * @param {string} category - The phrase category
     * @returns {XBarNode} A new head node
     */
    static createHead(token, category) {
        return new XBarNode({
            type: XBarLevel.X,
            category: category,
            head: token
        });
    }

    /**
     * Creates a bar (X') node.
     * @param {string} category - The phrase category
     * @param {XBarNode|null} [head] - The head node
     * @param {XBarNode|null} [complement] - The complement node
     * @returns {XBarNode} A new bar node
     */
    static createBar(category, head = null, complement = null) {
        const node = new XBarNode({
            type: XBarLevel.X_BAR,
            category: category,
            complement: complement
        });

        if (head && head.headToken) {
            node.headToken = head.headToken;
        }

        if (complement) {
            complement._parent = node;
        }

        return node;
    }

    /**
     * Creates a phrase (XP) node.
     * @param {string} category - The phrase category
     * @param {XBarNode|null} [bar] - The X' child
     * @param {XBarNode|null} [specifier] - The specifier node
     * @returns {XBarNode} A new phrase node
     */
    static createPhrase(category, bar = null, specifier = null) {
        const node = new XBarNode({
            type: XBarLevel.XP,
            category: category,
            specifier: specifier
        });

        if (bar) {
            node.complement = bar;
            bar._parent = node;
        }

        if (specifier) {
            specifier._parent = node;
        }

        return node;
    }

    /**
     * Creates a simple phrase from a head token.
     * Creates X -> X' -> XP structure.
     * @param {Token} token - The head token
     * @param {string} category - The phrase category
     * @returns {XBarNode} A new phrase node
     */
    static createSimplePhrase(token, category) {
        // Create head (X)
        const headNode = XBarNode.createHead(token, category);

        // Create bar (X') with head
        const barNode = XBarNode.createBar(category, headNode);

        // Create phrase (XP)
        const phraseNode = XBarNode.createPhrase(category, barNode);

        return phraseNode;
    }

    /**
     * Creates a phrase with a specifier.
     * @param {Token} headToken - The head token
     * @param {string} category - The phrase category
     * @param {XBarNode} specifier - The specifier node
     * @returns {XBarNode} A new phrase node
     */
    static createPhraseWithSpecifier(headToken, category, specifier) {
        // Create head (X)
        const headNode = XBarNode.createHead(headToken, category);

        // Create bar (X') with head
        const barNode = XBarNode.createBar(category, headNode);

        // Create phrase (XP) with specifier
        const phraseNode = XBarNode.createPhrase(category, barNode, specifier);

        return phraseNode;
    }

    /**
     * Creates a phrase with a complement.
     * @param {Token} headToken - The head token
     * @param {string} category - The phrase category
     * @param {XBarNode} complement - The complement node
     * @returns {XBarNode} A new phrase node
     */
    static createPhraseWithComplement(headToken, category, complement) {
        // Create head (X)
        const headNode = XBarNode.createHead(headToken, category);

        // Create bar (X') with head and complement
        const barNode = XBarNode.createBar(category, headNode, complement);

        // Create phrase (XP)
        const phraseNode = XBarNode.createPhrase(category, barNode);

        return phraseNode;
    }

    /**
     * Creates a full phrase with specifier and complement.
     * @param {Token} headToken - The head token
     * @param {string} category - The phrase category
     * @param {XBarNode} specifier - The specifier node
     * @param {XBarNode} complement - The complement node
     * @returns {XBarNode} A new phrase node
     */
    static createFullPhrase(headToken, category, specifier, complement) {
        // Create head (X)
        const headNode = XBarNode.createHead(headToken, category);

        // Create bar (X') with head and complement
        const barNode = XBarNode.createBar(category, headNode, complement);

        // Create phrase (XP) with specifier
        const phraseNode = XBarNode.createPhrase(category, barNode, specifier);

        return phraseNode;
    }
}

export default XBarNode;
