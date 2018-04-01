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
    constructor(vm, key, cb) {
        this.vm = vm
        this.key = key
        this.cb = cb
        this.value = this.getValue()
    }

    update() {
        const oldVal = this.value
        const val = this.vm.data[this.key]
        if (val !== oldVal) {
            this.value = val
            this.cb.call(this.vm, val, oldVal)
        }
    }

    getValue() {
        Subject.target = this
        const value = this.vm.data[this.key]
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

class MVVM {
    constructor(opts) {
        Object.keys(opts).forEach((key) => {
            this[key] = opts[key]
        })
        this.el = document.querySelector(this.el)
        observe(this.data)
        this.compile(this.el)
    }

    compile(node) {
        if (node.nodeType === 1) {
            node.childNodes.forEach((childNode) => {
                this.compile(childNode)
            })
        } else if (node.nodeType === 3) {
            const reg = /{{(.+?)}}/
            let match
            while (match = reg.exec(node.nodeValue)) {
                const raw = match[0]
                const key = match[1].trim()
                node.nodeValue = node.nodeValue.replace(raw, this.data[key])
                new Observer(this, key, (val, oldVal) => {
                    node.nodeValue = node.nodeValue.replace(oldVal, val)
                })
            }
        }
    }
}