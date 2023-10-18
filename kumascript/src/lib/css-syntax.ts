import { KumaThis } from "../environment.js";
import { getSyntax } from "query-css-syntax";
import { definitionSyntax } from "css-tree";

const typesToOmit = ["<color>", "<gradient>"];

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

  /**
   * Get the formal syntax and properly formatted name for an item.
   */
  function getNameAndSyntax(): {
    name: string;
    syntax: string;
  } {
    // get the item name from the page slug
    let itemName = slug || env.slug.split("/").pop().toLowerCase();
    let itemSyntax;
    switch (env["page-type"]) {
      case "css-shorthand-property":
      case "css-property":
        itemSyntax = getSyntax(itemName, "property", typesToOmit);
        break;
      case "css-type":
        // some CSS data type slugs have a `_value` suffix
        if (itemName.endsWith("_value")) {
          itemName = itemName.replace("_value", "");
        }

        itemSyntax = getSyntax(itemName, "type", typesToOmit);
        itemName = `<${itemName}>`;
        break;
      case "css-function":
        itemName = `${itemName}()`;
        itemSyntax = getSyntax(itemName, "function", typesToOmit);
        itemName = `<${itemName}>`;
        break;
      case "css-at-rule":
        itemSyntax = getSyntax(itemName, "at-rule", typesToOmit);
        break;
      case "css-at-rule-descriptor":
        itemSyntax = getSyntax(itemName, "at-rule-descriptor", typesToOmit);
        break;
      default:
        itemSyntax = "";
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
    output += renderSyntax(itemName, itemSyntax.syntax);
    output += "<br/>";

    // and write each one out
    for (const constituant of itemSyntax.constituents) {
      output += renderSyntax(`&lt;${constituant.type}&gt;`, constituant.syntax);
      output += "<br/>";
    }

    output += "</pre>";
    return output;
  }

  let output;

  try {
    const { name, syntax } = getNameAndSyntax();
    output = writeFormalSyntax(name, syntax);
  } catch (e) {
    output = "Error: could not find syntax for this item";
  }

  return output;
}
