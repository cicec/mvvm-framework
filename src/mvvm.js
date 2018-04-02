class Subject {
    constructor() {
        this.observers = []
    }

    addObserver(observer) {
        this.observers.push(observer)
    }

    notify() {
        this.observers.forEach((observer) => {
            observer.update()
        })
    }
}

Subject.target = null

class Observer {
    constructor(vm, exp, cb) {
        this.vm = vm
        this.exp = exp
        this.cb = cb
        this.value = this.getValue()
    }

    update() {
        const oldVal = this.value
        const val = this.vm.data[this.exp]
        if (val !== oldVal) {
            this.value = val
            this.cb.call(this.vm, val, oldVal)
        }
    }

    getValue() {
        Subject.target = this
        const value = this.vm.data[this.exp]
        Subject.target = null
        return value
    }
}

function observe(data) {
    if (!data || typeof data !== 'object') return
    Object.keys(data).forEach((key) => {
        let val = data[key]
        const subject = new Subject()
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get() {
                if (Subject.target) subject.addObserver(Subject.target)
                return val
            },
            set(newVal) {
                val = newVal
                subject.notify()
            }
        })
        if (typeof val === 'object') observe(val)
    })
}

class Compile {
    constructor(el, vm) {
        this.$el = document.querySelector(el)
        this.vm = vm
        this.fragment = this.nodeToFragment(this.$el)
        this.compile(this.fragment)
        this.$el.appendChild(this.fragment)
    }

    nodeToFragment(el) {
        const fragment = document.createDocumentFragment()
        let child = el.firstChild
        while (child = el.firstChild) {
            fragment.appendChild(child)
        }
        return fragment
    }

    compile(el) {
        const { childNodes } = el
        Array.prototype.slice.call(childNodes).forEach((node) => {
            if (node.nodeType === 1) {
                this.compileElement(node)
            } else if (node.nodeType === 3) {
                this.compileText(node)
            }
            if (node.childNodes) this.compile(node)
        })
    }

    compileElement(node) {
        const attrs = node.attributes
        Array.prototype.slice.call(attrs).forEach((attr) => {
            console.log(attr)
        })
    }

    compileText(node) {
        const reg = /{{(.+?)}}/
        let match
        while (match = reg.exec(node.textContent)) {
            const raw = match[0]
            const exp = match[1].trim()
            node.textContent = node.textContent.replace(raw, this.vm.data[exp])
            new Observer(this.vm, exp, (val, oldVal) => {
                node.textContent = node.textContent.replace(oldVal, val)
            })
        }
    }
}

class MVVM {
    constructor(opts) {
        Object.keys(opts).forEach((key) => {
            this[key] = opts[key]
        })
        observe(this.data)
        new Compile(this.el, this)
    }
}