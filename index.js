
// Adapted from https://github.com/markdown-it/markdown-it/blob/fbc6b0fed563ba7c00557ab638fd19752f8e759d/docs/architecture.md

function findFirstMatchingConfig(link, configs) {
  let i, config;
  let href = link.attrs[link.attrIndex('href')][1];

  for (i = 0; i < configs.length; ++i) {
    config = configs[i];

    // if there is no pattern, config matches for all links
    // otherwise, only return config if href matches the pattern set
    if (!config.pattern || new RegExp(config.pattern).test(href)) {
      return config;
    }
  }
  return null;
}

function applyAttributes(idx, tokens, attributes) {
  Object.keys(attributes).forEach(function (attr) {
    let attrIndex;
    let value = attributes[attr];

    if (attr === 'className') {
      // when dealing with applying classes
      // programatically, some programmers
      // may prefer to use the className syntax
      attr = 'class';
    }

    attrIndex = tokens[idx].attrIndex(attr);

    if (attrIndex < 0) { // attr doesn't exist, add new attribute
      tokens[idx].attrPush([ attr, value ]);
    } else { // attr already exists, overwrite it
      tokens[idx].attrs[attrIndex][1] = value; // replace value of existing attr
    }
  });
}

function applyCustomAttributes(token) {
  if (token.type !== 'link_open') {
    return;
  }

  // split the attributes into an array
  let attrs = decodeURI(token.attrs[0][1]).split('|');

  // extract the actual href and assign it to the token
  let href = attrs.shift();
  token.attrs[0][1] = href;

  // create a map of all the custom attributes
  let custom = new Map();
  attrs.forEach(function (attr) {
    if (attr.indexOf('=') > -1) {
      let data = attr.split('=');
      custom.set(data[0], data[1]);
    } else {
      custom.set(attr, true);
    }
  });

  // assign the custom attributes to the token
  custom.forEach(function (value, key) {
    token.attrs.push([ key, value ]);
  });
}

function markdownitLinkAttributes(md, configs) {
  if (!configs) {
    configs = [];
  } else {
    configs = Array.isArray(configs) ? configs : [ configs ];
  }

  Object.freeze(configs);

  let defaultRender = md.renderer.rules.link_open || this.defaultRender;

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    let config = findFirstMatchingConfig(tokens[idx], configs);
    let attributes = config && config.attrs;

    // add any link specific attributes before applying global ones
    tokens.forEach(applyCustomAttributes);

    if (attributes) {
      applyAttributes(idx, tokens, attributes);
    }

    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self);
  };
}

markdownitLinkAttributes.defaultRender = function (tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

module.exports = markdownitLinkAttributes;
