import { asArray, toSelector } from "../utils.js";

const exhaustsProps = (props, required, optional) => {
  const remaining = new Map(
    Object.entries(props).map(([key, value]) => [key, new Set(asArray(value))])
  );
  for (const keyOrObject of asArray(required)) {
    if (typeof keyOrObject == "object") {
      for (const [key, value] of Object.entries(keyOrObject)) {
        const valueSet = remaining.get(key);
        if (!valueSet || !valueSet.delete(value)) {
          return false;
        }
        if (valueSet && valueSet.size == 0) {
          remaining.delete(key);
        }
      }
    } else {
      if (!remaining.delete(keyOrObject)) {
        return false;
      }
    }
  }
  for (const keyOrObject of asArray(optional)) {
    if (typeof keyOrObject == "object") {
      for (const [key, value] of Object.entries(keyOrObject)) {
        const valueSet = remaining.get(key);
        if (valueSet) {
          valueSet.delete(value);
          if (valueSet.size == 0) {
            remaining.delete(key);
          }
        }
      }
    } else {
      remaining.delete(keyOrObject);
    }
  }
  return remaining.size == 0;
};

const exhaustsClasses = (classes, required, optional) => {
  const remaining = new Set(classes);
  for (const key of asArray(required)) {
    if (!remaining.delete(key)) {
      return false;
    }
  }
  for (const key of asArray(optional)) {
    if (typeof key == "function") {
      const matches = Array.from(remaining).filter((k) => key(k));
      for (const match of matches) {
        remaining.delete(match);
      }
    } else {
      remaining.delete(key);
    }
  }
  return remaining.size == 0;
};

export const matchesQuery = (node, query, options) => {
  if (Array.isArray(query)) {
    return query.some((q) => matchesQuery(node, q, options));
  }

  if (typeof query == "function") {
    const result = query(node, options);
    return typeof result == "boolean"
      ? result
      : matchesQuery(node, result, options);
  }

  if (node.type !== "element") {
    return false;
  }

  if (typeof query == "string") {
    return query == toSelector(node);
  }

  if (typeof query !== "object") {
    return false;
  }

  if (
    "is" in query &&
    !asArray(query.is).some((tagName) => node.tagName == tagName)
  ) {
    return false;
  }

  const { className, ...props } = node.properties;
  return (
    exhaustsProps(props, query.has, query.canHave) &&
    exhaustsClasses(
      asArray(className),
      asArray(query.hasClass),
      query.canHaveClass
    )
  );
};
