import config from './config'
import Seed from './seed'
import watchArray from './watchArray'

export default {
  text: function (value) {
    this.el.textContent = value || ''
  },
  show: function (value) {
    this.el.style.display = value ? '' : 'none'
  },
  class: function (value) {
    this.el.classList[value ? 'add' : 'remove'](this.arg)
  },
  for: function (arr) {
    var self = this
    var tag = this.el.nodeName.toLowerCase()
    var els = arr.map(_ => document.createElement(tag))
    els.forEach(function (value) {
      self.el.parentNode.appendChild(value)
    })
  },
  on: {
    update: function (handler) {
      var event = this.arg
      if (!this.handlers) {
        this.handlers = {}
      }
      var handlers = this.handlers
      if (handlers[event]) {
        this.el.removeEventListener(event, handlers[event])
      }
      if (handler) {
        handler = handler.bind(this.seed)
        this.el.addEventListener(event, handler)
        handlers[event] = handler
      }
    },
    unbind: function () {
      var event = this.arg
      if (this.handlers) {
        this.el.removeEventListener(event, this.handlers[event])
      }
    }
  },
  each: {
    bind: function () {
      this.el['sd-block'] = true
      this.prefixRE = new RegExp('^' + this.arg + '.')
      var ctn = this.container = this.el.parentNode
      this.marker = document.createComment('sd-each-' + this.arg + '-marker')
      ctn.insertBefore(this.marker, this.el)
      ctn.removeChild(this.el)
      this.childSeeds = []
    },
    update: function (collection) {
      if (this.childSeeds.length) {
        this.childSeeds.forEach(function (child) {
          child.destroy()
        })
        this.childSeeds = []
      }
      watchArray(collection, this.mutate.bind(this))
      var self = this
      collection.forEach(function (item, i) {
        self.childSeeds.push(self.buildItem(item, i, collection))
      })
    },
    mutate: function (mutation) {
      console.log(mutation)
    },
    buildItem: function (data, index, collection) {
      var node = this.el.cloneNode(true),
      spore = new Seed(node, data, {
        eachPrefixRE: this.prefixRE,
        parentScope: this.seed.scope
      })
      this.container.insertBefore(node, this.marker)
      collection[index] = spore.scope
      return spore
    }
  }
}