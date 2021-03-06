import config from './config'
import Directives from './directives'
import Filters from './filters'

var KEY_RE = /^[^\|]+/,
    FILTERS_RE = /\|[^\|]+/g,
    FILTER_TOKEN_RE = /[^\s']+|'[^']+'/g,
    QUOTE_RE = /'/g

function Directive (def, attr, arg, key) {
  if (typeof def === 'function') {
    this._update = def
  } else {
    for (var prop in def) {
      if (prop === 'update') {
        this._update = def.update
        continue
      }
      this[prop] = def[prop]
    }
  }

  this.attr = attr
  this.arg = arg
  this.key = key

  var filters = attr.value.match(FILTERS_RE)
  if (filters) {
    this.filters = filters.map(function (filter) {
      var tokens = filter.slice(1)
        .match(FILTER_TOKEN_RE)
        .map(function (token) {
          return token.replace(QUOTE_RE, '').trim()
        })
      return {
        name: tokens[0],
        apply: Filters[tokens[0]],
        args: tokens.length > 1
          ? tokens.slice(1)
          : null
      }
    })
  }
}

Directive.prototype.update = function (value) {
  if (this.filters) {
    value = this.applyFilters(value)
  }
  this._update(value)
}

Directive.prototype.applyFilters = function (value) {
  var filtered = value
  this.filters.forEach(function (filter) {
    if (!filter.apply) throw new Error('Unknown filter: ' + filter.name)
    filtered = filter.apply(filtered, filter.args)
  })
  return filtered
}

export default {
  parse: function (attr) {
    var prefix = config.prefix
    if (attr.name.indexOf(prefix) === -1) return null
    var noprefix = attr.name.slice(prefix.length + 1),
        argIndex = noprefix.indexOf('-'),
        // 指令名
        arg = argIndex === -1
          ? null
          : noprefix.slice(argIndex + 1),
        // 绑定事件
        name = arg
          ? noprefix.slice(0, argIndex)
          : noprefix,
        def = Directives[name]
    // 绑定参数
    var key = attr.value.match(KEY_RE)

    return def && key
      ? new Directive(def, attr, arg, key[0].trim())
      : null
  }
}