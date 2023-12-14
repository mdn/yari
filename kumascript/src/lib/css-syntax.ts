import { KumaThis } from "../environment.js";
import webRefData from "@webref/css";
import { definitionSyntax } from "css-tree";

export async function getCSSSyntax(
  kuma: KumaThis,
  slug?: string
): Promise<string> {
  const { env } = kuma;

  const locale = env.locale;

  // URL where we describe value definition syntax
  const valueDefinitionUrl = `/${locale}/docs/Web/CSS/Value_definition_syntax`;

  // CSS types for which we want to link to another page, and not expand the syntax
  const typesToLink = ["<color>", "<gradient>"];

  // Map item names onto slugs, in cases where the slug can't be derived from the name
  const slugMap = {
    "<color>": "color_value",
    "<position>": "position_value",
  };

  function localString(strings: Record<string, string>) {
    return kuma.mdn.localString.apply(kuma, [strings]);
  }

  // Descriptions used for building links and tooltips for parts of the value definition syntax
  const syntaxDescriptions = {
    "*": {
      fragment: "asterisk",
      tooltip: localString({
        "en-US": "Asterisk: the entity may occur zero, one or several times",
      }),
    },
    "+": {
      fragment: "plus",
      tooltip: localString({
        "en-US": "Plus: the entity may occur one or several times",
      }),
    },
    "?": {
      fragment: "question_mark",
      tooltip: localString({
        "en-US": "Question mark: the entity is optional",
      }),
    },
    "{}": {
      fragment: "curly_braces",
      tooltip: localString({
        "en-US":
          "Curly braces: encloses two integers defining the minimal and maximal numbers of occurrences of the entity, or a single integer defining the exact number required",
      }),
    },
    "#": {
      fragment: "hash_mark",
      tooltip: localString({
        "en-US":
          "Hash mark: the entity is repeated one or several times, each occurence separated by a comma",
      }),
    },
    "!": {
      fragment: "exclamation_point_!",
      tooltip: localString({
        "en-US": "Exclamation point: the group must produce at least one value",
      }),
    },
    "[]": {
      fragment: "brackets",
      tooltip: localString({
        "en-US":
          "Brackets: enclose several entities, combinators, and multipliers to transform them as a single component",
      }),
    },
    "|": {
      fragment: "single_bar",
      tooltip: localString({
        "en-US": "Single bar: exactly one of the entities must be present",
      }),
    },
    "||": {
      fragment: "double_bar",
      tooltip: localString({
        "en-US":
          "Double bar: one or several of the entities must be present, in any order",
      }),
    },
    "&&": {
      fragment: "double_ampersand",
      tooltip: localString({
        "en-US":
          "Double ampersand: all of the entities must be present, in any order",
      }),
    },
  };

  // get the contents of webref
  const parsedWebRef = await getParsedWebRef();

  // get all the value syntaxes
  let values = {};
  for (const spec of Object.values(parsedWebRef)) {
    values = { ...values, ...spec.values };
  }

  /**
   * Get the spec shortnames for an item, given:
   * @param {string} itemName - the name of the item
   * @param {string} itemType - this can only be "properties" or "atrules"
   */
  function getSpecsForItem(itemName: string, itemType: string) {
    // Get all specs which list this item
    const specsForItem = [];
    for (const [shortname, data] of Object.entries(parsedWebRef)) {
      const itemNames = Object.keys(data[itemType]);
      if (itemNames.includes(itemName)) {
        specsForItem.push(shortname);
      }
    }
    return specsForItem;
  }

  /**
   * Get the formal syntax for a property from the webref data, given:
   * @param {string} propertyName - the name of the property
   */
  function getPropertySyntax(propertyName: string): string {
    // 1) Get all specs which list this property
    let specsForProp = getSpecsForItem(propertyName, "properties");
    // 2) If we have more than one spec, filter out specs that end "-n" where n is a number
    if (specsForProp.length > 1) {
      specsForProp = specsForProp.filter((specName) => !/-\d+$/.test(specName));
    }
    // 3) If we have only one spec, return the syntax it lists
    if (specsForProp.length === 1) {
      return parsedWebRef[specsForProp[0]].properties[propertyName].value;
    }
    // 4) If we have > 1 spec, assume that:
    // - one of them is the base spec, which defines `values`,
    // - the others define incremental additions as `newValues`
    let syntax = "";
    let newSyntaxes = "";
    for (const specName of specsForProp) {
      const baseValue = parsedWebRef[specName].properties[propertyName].value;
      if (baseValue) {
        syntax = baseValue;
      }
      const newValues =
        parsedWebRef[specName].properties[propertyName].newValues;
      if (newValues) {
        newSyntaxes += ` | ${newValues}`;
      }
    }
    // Concatenate newValues onto values to return a single syntax string
    if (newSyntaxes) {
      syntax += newSyntaxes;
    }
    return syntax;
  }

  /**
   * Get the formal syntax for an at-rule from the webref data, given:
   * @param {string} atRuleName - the name of the at-rule
   */
  function getAtRuleSyntax(atRuleName: string): string {
    // An at-rule may appear in more than one spec: for example, if extra descriptors
    // are defined in different specs. But we assume that the at-rule's own syntax,
    // defined in the `value` property, only appears in one of them.
    const specs = getSpecsForItem(atRuleName, "atrules");
    for (const spec of specs) {
      if (parsedWebRef[spec].atrules[atRuleName].value) {
        return parsedWebRef[spec].atrules[atRuleName].value;
      }
    }
    return "";
  }

  /**
   * Get the formal syntax for an at-rule descriptor from the webref data, given:
   * @param {string} atRuleDescriptorName - the name of the at-rule descriptor
   */
  function getAtRuleDescriptorSyntax(atRuleDescriptorName: string): string {
    // We assume that the at-rule descriptor page is directly under
    // the page for its at-rule.
    const atRuleName = env.slug.split("/").at(-2);
    const specs = getSpecsForItem(atRuleName, "atrules");
    // Look through all the specs that define the at-rule, for the one
    // that defines this descriptor.
    for (const spec of specs) {
      const atRule = parsedWebRef[spec].atrules[atRuleName];
      for (const descriptor of atRule.descriptors) {
        if (descriptor.name === atRuleDescriptorName) {
          return descriptor.value;
        }
      }
    }
    return "";
  }

  /**
   * Get the formal syntax and properly formatted name for an item.
   */
  function getNameAndSyntax(): { name: string; syntax: string } {
    // get the item name from the page slug
    let itemName = slug || env.slug.split("/").pop().toLowerCase();
    let itemSyntax;
    switch (env["page-type"]) {
      case "css-shorthand-property":
      case "css-property":
        itemSyntax = getPropertySyntax(itemName);
        break;
      case "css-type":
        // some CSS data type slugs have a `_value` suffix
        if (itemName.endsWith("_value")) {
          itemName = itemName.replace("_value", "");
        }
        // not all types have an entry in the syntax
        if (values[itemName]) {
          itemSyntax = values[itemName].value;
        }
        itemName = `<${itemName}>`;
        break;
      case "css-function":
        itemName = `${itemName}()`;
        // not all functions have an entry in the syntax
        if (values[itemName]) {
          itemSyntax = values[itemName].value;
        }
        itemName = `<${itemName}>`;
        break;
      case "css-at-rule":
        itemSyntax = getAtRuleSyntax(itemName);
        break;
      case "css-at-rule-descriptor":
        itemSyntax = getAtRuleDescriptorSyntax(itemName);
        break;
    }
    return {
      name: itemName,
      syntax: itemSyntax,
    };
  }

  /**
   * Get the markup for a multiplier, including links to the value definition syntax.
   */
  function renderMultiplier(multiplierName: string): string {
    let key = multiplierName;
    // remove number inside `{}` multiplier
    if (multiplierName.startsWith("{")) {
      key = "{}";
    }
    // these two multiplier combinations can appear, we want to annotate them separately
    if (multiplierName === "+#" || multiplierName === "#?") {
      const info1 = syntaxDescriptions[multiplierName[0]];
      const info2 = syntaxDescriptions[multiplierName[1]];
      const link1 = `<a href="${valueDefinitionUrl}#${info1.fragment}" title="${info1.tooltip}">${multiplierName[0]}</a>`;
      const link2 = `<a href="${valueDefinitionUrl}#${info2.fragment}" title="${info2.tooltip}">${multiplierName[1]}</a>`;
      return `${link1}${link2}`;
    }
    // the "#" multipler can be followed by the curly brackets, we want to annotate them separately
    if (multiplierName.startsWith("#{")) {
      const info1 = syntaxDescriptions["#"];
      const info2 = syntaxDescriptions["{}"];
      const link1 = `<a href="${valueDefinitionUrl}#${info1.fragment}" title="${info1.tooltip}">${multiplierName[0]}</a>`;
      const link2 = `<a href="${valueDefinitionUrl}#${info2.fragment}" title="${
        info2.tooltip
      }">${multiplierName.slice(1)}</a>`;
      return `${link1}${link2}`;
    }
    const info = syntaxDescriptions[key];
    return `<a href="${valueDefinitionUrl}#${info.fragment}" title="${info.tooltip}">${multiplierName}</a>`;
  }

  /**
   * Determines the markup to generate for a single node in the AST
   * generated by css-tree.
   */
  function renderNode(name, node) {
    switch (node.type) {
      case "Property": {
        return `<span class="token property">${name}</span>`;
      }
      case "Type": {
        // encode < and >
        let encoded = name.replaceAll("<", "&lt;");
        encoded = encoded.replaceAll(">", "&gt;");
        // add CSS class: we use "property" because there isn't one for types
        const span = `<span class="token property">${encoded}</span>`;
        // If the type is not included in the syntax, or is in "typesToLink",
        // link to its dedicated page (don't expand it)
        const key = name.replace(/(^<|>$)/g, "");
        if (values[key]?.value && !typesToLink.includes(name)) {
          return span;
        } else {
          let slug;
          // If the name is in slugMap, we can't derive the slug from the name
          if (slugMap[name]) {
            slug = slugMap[name];
          } else {
            // The slug should not include the angle brackets
            slug = name.replaceAll("<", "");
            slug = slug.replaceAll(">", "");
            // The slug should not contain the range in square brackets, as in "<number [0,∞]>"
            slug = slug.replace(/\[.*\]/, "");
          }
          return `<a href="/${locale}/docs/Web/CSS/${slug}">${span}</a>`;
        }
      }
      case "Multiplier": {
        // link to the value definition syntax and provide a tooltip
        return renderMultiplier(name);
      }
      case "Keyword": {
        return `<span class="token keyword">${name}</span>`;
      }
      case "Function": {
        return `<span class="token function">${name}</span>`;
      }
      case "Token": {
        if (name === ")") {
          // this is a closing bracket
          return `<span class="token function">${name}</span>`;
        }
      }
      // eslint-disable-next-line no-fallthrough
      case "Group": {
        // link from brackets to the value definition syntax docs
        const info = syntaxDescriptions["[]"];
        name = name.replace(
          /^\[/,
          `<a href="${valueDefinitionUrl}#${info.fragment}" title="${info.tooltip}">[</a>`
        );
        name = name.replace(
          /\]$/,
          `<a href="${valueDefinitionUrl}#${info.fragment}" title="${info.tooltip}">]</a>`
        );

        // link from combinators (except " ") to the value definition syntax docs
        if (node.combinator && node.combinator !== " ") {
          const info = syntaxDescriptions[node.combinator];
          // note that we are replacing the combinator surrounded by spaces, like " | "
          name = name.replaceAll(
            ` ${node.combinator} `,
            ` <a href="${valueDefinitionUrl}#${info.fragment}" title="${info.tooltip}">${node.combinator}</a> `
          );
        }

        return name;
      }
      default:
        return name;
    }
  }

  /**
   * Generate the markup for every term in a syntax definition,
   * ensuring that the terms are visually aligned
   */
  function renderTerms(terms, combinator) {
    let output = "";
    const renderedTerms = [];

    for (const term of terms) {
      // figure out the lengths of the translated terms, without markup
      // this is just so we can align the terms properly
      const termTextLength = definitionSyntax.generate(term).length;
      // get the translated terms, with markup
      const termText = definitionSyntax.generate(term, {
        decorate: renderNode,
      });
      renderedTerms.push({
        text: termText,
        length: termTextLength,
      });
    }

    // we will space-pad all terms to the length of the longest term,
    // so that lines are aligned, but padding must not cause lines to wrap,
    // so the target width is clamped to the line length.
    const maxLineLength = 50;
    let maxTermLength = Math.max(...renderedTerms.map((t) => t.length));
    maxTermLength = Math.min(maxTermLength, maxLineLength);

    // write out the translated terms, padding with spaces for alignment
    // and separating terms using their combinator symbol
    for (let i = 0; i < renderedTerms.length; i++) {
      const termText = renderedTerms[i].text;
      const spaceCount = Math.max(
        2,
        maxTermLength + 2 - renderedTerms[i].length
      );
      let combinatorText = "";
      if (combinator && combinator !== " ") {
        const info = syntaxDescriptions[combinator];
        // link from combinators (except " ") to the value definition syntax docs
        combinatorText = `<a href="${valueDefinitionUrl}#${info.fragment}" title="${info.tooltip}">${combinator}</a>`;
      }
      // omit the combinator for the final term
      combinatorText = i < renderedTerms.length - 1 ? combinatorText : "";
      output += `  ${termText}${" ".repeat(spaceCount)}${combinatorText}<br/>`;
    }

    return output;
  }

  /**
   * Render the syntax for a single type.
   */
  function renderSyntax(type, syntax) {
    // write out the name of this type
    type = type.replaceAll("<", "&lt;");
    type = type.replaceAll(">", "&gt;");
    let output = `<span class="token property" id="${type}">${type} = </span><br/>`;

    const ast = definitionSyntax.parse(syntax);
    // if the combinator is ' ', write the complete type syntax in a single line
    if (ast.combinator === " ") {
      output += renderTerms([ast], ast.combinator);
    } else {
      // otherwise write out each direct child in its own line
      output += renderTerms(ast.terms, ast.combinator);
    }

    return output;
  }

  /**
   * Get names of all the types in a given set of syntaxes
   */
  function getTypesForSyntaxes(syntaxes, constituents) {
    function processNode(node) {
      // Ignore the constituent parts of "typesToLink" types
      if (typesToLink.includes(`<${node.name}>`)) {
        return;
      }
      if (node.type === "Type" && !constituents.includes(node.name)) {
        constituents.push(node.name);
      }
    }

    for (const syntax of syntaxes) {
      const ast = definitionSyntax.parse(syntax);
      definitionSyntax.walk(ast, processNode);
    }
  }

  /**
   * Given an item (such as a CSS property), fetch all the types that participate
   * in its formal syntax definition, either directly or transitively.
   */
  function getConstituentTypes(itemSyntax) {
    const allConstituents = [];
    let oldConstituentsLength = 0;
    // get all the types in the top-level syntax
    let constituentSyntaxes = [itemSyntax];

    // while an iteration added more types...
    // eslint-disable-next-line no-constant-condition
    while (true) {
      oldConstituentsLength = allConstituents.length;
      getTypesForSyntaxes(constituentSyntaxes, allConstituents);

      if (allConstituents.length <= oldConstituentsLength) {
        break;
      }
      // get the syntaxes for all newly added constituents,
      // and then get the types in those syntaxes
      constituentSyntaxes = [];
      for (const constituent of allConstituents.slice(oldConstituentsLength)) {
        const constituentSyntaxEntry = values[constituent];

        if (constituentSyntaxEntry?.value) {
          constituentSyntaxes.push(constituentSyntaxEntry.value);
        }
      }
    }
    return allConstituents;
  }

  /**
   * Write out the complete formal syntax for an item.
   *
   * This includes the item's own syntax, described in `itemSyntax`,
   * and also the syntax for any types that participate in the definition of
   * the item.
   */
  function writeFormalSyntax(itemName: string, itemSyntax: string) {
    let output = "";
    output += "<pre>";
    // write the syntax for the property
    output += renderSyntax(itemName, itemSyntax);
    output += "<br/>";
    // collect all the constituent types for the property
    const types = getConstituentTypes(itemSyntax);

    // and write each one out
    for (const type of types) {
      if (values[type] && values[type].value) {
        output += renderSyntax(`&lt;${type}&gt;`, values[type].value);
        output += "<br/>";
      }
    }

    output += "</pre>";
    return output;
  }

  let output = "";

  const { name, syntax } = getNameAndSyntax();

  if (!syntax) {
    output = "Error: could not find syntax for this item";
  } else {
    // write it out
    output = writeFormalSyntax(name, syntax);
  }
  return output;
}

async function getParsedWebRef(): Promise<WebRefObjectData> {
  const rawItems = await getRawWebRefData();

  return Object.fromEntries(
    Object.entries(rawItems).map(
      ([name, { spec, properties, atrules, values }]) => [
        name,
        {
          spec,
          properties: byName(properties),
          atrules: byName(atrules),
          values: byName(values),
        },
      ]
    )
  );
}

function byName<T extends Named>(items: T[]): Record<string, T> {
  return Object.fromEntries(
    items.map((item) => [item.name.replace(/(^<|>$)/g, ""), item])
  );
}

async function getRawWebRefData(): Promise<WebRefArrayData> {
  return (await webRefData.listAll()) as WebRefArrayData;
}

// @webref/css v5 interfaces.

type WebRefObjectData = Record<string, WebRefObjectDataItem>;
interface WebRefObjectDataItem {
  spec: WebRefSpecEntry;
  properties: Record<string, WebRefPropertyEntry>;
  atrules: Record<string, WebRefAtruleEntry>;
  values: Record<string, WebRefValuespaceEntry>;
}

// @webref/css v6 interfaces.

type WebRefArrayData = Record<string, WebRefArrayDataItem>;
interface WebRefArrayDataItem {
  spec: WebRefSpecEntry;
  properties: (WebRefPropertyEntry & Named)[];
  atrules: (WebRefAtruleEntry & Named)[];
  values: (WebRefValuespaceEntry & Named)[];
}

interface Named {
  name: string;
}

// Common interfaces.

interface WebRefSpecEntry {
  title: string;
  url: string;
}

interface WebRefPropertyEntry {
  value: string;
  newValues: string;
}

interface WebRefAtruleEntry {
  descriptors: {
    name: string;
    value: string;
  }[];
  value: string;
}

interface WebRefValuespaceEntry {
  prose?: string;
  value?: string;
}
